using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using Simpled.Dtos.Users;
using Simpled.Models;
using Simpled.Repository;
using Simpled.Exception;
using Simpled.Dtos.Teams;
using Simpled.Dtos.Teams.TeamMembers;
using Simpled.Validators;
using FluentValidation;

namespace Simpled.Services
{
    /// <summary>
    /// Servicio para la gestión de usuarios.
    /// Implementa IUserRepository.
    /// </summary>
    public class UserService : IUserRepository
    {
        private readonly SimpledDbContext _context;

        public UserService(SimpledDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene todos los usuarios del sistema.
        /// </summary>
        /// <returns>Lista de usuarios.</returns>
        public async Task<IEnumerable<UserReadDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.Include(u => u.Roles).ToListAsync();
            return users.Select(u => new UserReadDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                ImageUrl = u.ImageUrl,
                AchievementsCompleted = u.Achievements.Count,
                CreatedAt = u.CreatedAt,
                Roles = u.Roles.Select(r => r.Role).ToList()
            });
        }

        /// <summary>
        /// Obtiene un usuario por su ID, incluyendo sus equipos y logros.
        /// </summary>
        /// <param name="id">ID del usuario.</param>
        /// <returns>DTO del usuario o excepción si no existe.</returns>
        public async Task<UserReadDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.Achievements)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                throw new NotFoundException("Usuario no encontrado.");

            var memberships = await _context.TeamMembers
                .Include(tm => tm.Team)
                    .ThenInclude(t => t.Owner)
                .Include(tm => tm.Team)
                    .ThenInclude(t => t.Members)
                        .ThenInclude(m => m.User)
                .Where(tm => tm.UserId == id)
                .ToListAsync();

            var teamDtos = memberships.Select(tm => new TeamReadDto
            {
                Id = tm.TeamId,
                Name = tm.Team != null ? tm.Team.Name : string.Empty,
                OwnerId = tm.Team != null ? tm.Team.OwnerId : Guid.Empty,
                OwnerName = tm.Team != null && tm.Team.Owner != null ? tm.Team.Owner.Name : string.Empty,
                Role = tm.Role,
                Members = tm.Team != null && tm.Team.Members != null ?
                    tm.Team.Members.Select(m => new TeamMemberDto
                    {
                        UserId = m.UserId,
                        UserName = m.User != null ? m.User.Name : string.Empty,
                        Role = m.Role
                    }) : new List<TeamMemberDto>()
            });

            return new UserReadDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ImageUrl = user.ImageUrl,
                AchievementsCompleted = user.Achievements.Count,
                CreatedAt = user.CreatedAt,
                Roles = user.Roles.Select(r => r.Role).ToList(),
                Teams = teamDtos.ToList()
            };
        }

        /// <summary>
        /// Registra un nuevo usuario en el sistema.
        /// </summary>
        /// <param name="userDto">Datos del usuario a registrar.</param>
        /// <param name="image">Imagen de perfil (opcional).</param>
        /// <returns>DTO del usuario registrado.</returns>
        public async Task<UserReadDto> RegisterAsync(UserRegisterDto userDto, IFormFile ?image)
        {
            var validator = new UserRegisterValidator();
            var validationResult = validator.Validate(userDto);
            if (!validationResult.IsValid)
                throw new ApiException(validationResult.Errors[0].ErrorMessage, 400);
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = userDto.Name,
                Email = userDto.Email,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                Roles = new List<UserRole>(),
                ImageUrl = "/images/default/avatar-default.jpg"
            };

            user.Roles.Add(new UserRole
            {
                UserId = user.Id,
                Role = "viewer"
            });

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (image != null)
            {
                string uploadsFolder = Path.Combine("wwwroot", "images", user.Id.ToString());

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    Console.WriteLine($"Carpeta creada: {uploadsFolder}");
                }

                string filePath = Path.Combine(uploadsFolder, "image.jpg");

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }

                user.ImageUrl = $"/images/{user.Id.ToString()}/image.jpg";
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }

            return new UserReadDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                Roles = user.Roles.Select(r => r.Role).ToList(),
                ImageUrl = user.ImageUrl,
            };
        }

        /// <summary>
        /// Actualiza los datos de un usuario existente.
        /// </summary>
        /// <param name="userDto">Datos actualizados del usuario.</param>
        /// <param name="image">Imagen de perfil (opcional).</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el usuario no existe.</exception>
        public async Task<bool> UpdateAsync(UserUpdateDto userDto, IFormFile? image)
        {
            var validator = new UserUpdateValidator();
            var validationResult = validator.Validate(userDto);
            if (!validationResult.IsValid)
                throw new ApiException(validationResult.Errors[0].ErrorMessage, 400);
            var existing = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userDto.Id);
            if (existing == null)
                throw new NotFoundException("Usuario no encontrado.");

            existing.Email = userDto.Email;
            existing.Name = userDto.Name;

            await ActualizarPasswordSiEsNecesario(existing, userDto.Password);
            await ActualizarImagenUsuario(existing, userDto.ImageUrl, image);

            await _context.SaveChangesAsync();
            return true;
        }

        private static Task ActualizarPasswordSiEsNecesario(User existing, string? nuevaPassword)
        {
            if (!string.IsNullOrWhiteSpace(nuevaPassword))
            {
                bool samePassword = BCrypt.Net.BCrypt.Verify(nuevaPassword, existing.PasswordHash);
                if (!samePassword)
                {
                    existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(nuevaPassword);
                }
            }
            return Task.CompletedTask;
        }

        private async Task ActualizarImagenUsuario(User existing, string? nuevaImageUrl, IFormFile? image)
        {
            if (!string.IsNullOrWhiteSpace(nuevaImageUrl))
            {
                if (!existing.ImageUrl.Contains("avatar-default.jpg"))
                {
                    string oldImagePath = Path.Combine("wwwroot", existing.ImageUrl.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                    var directory = Path.GetDirectoryName(oldImagePath);
                    if (Directory.Exists(directory) && Directory.GetFiles(directory).Length == 0)
                    {
                        Directory.Delete(directory);
                    }
                }
                existing.ImageUrl = "/images/default/avatar-default.jpg";
            }
            else if (image != null)
            {
                string uploadsFolder = Path.Combine("wwwroot", "images", existing.Id.ToString());
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    Console.WriteLine($"Carpeta creada: {uploadsFolder}");
                }
                string filePath = Path.Combine(uploadsFolder, "image.jpg");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }
                existing.ImageUrl = $"/images/{existing.Id.ToString()}/image.jpg";
                _context.Users.Update(existing);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Elimina un usuario por su ID.
        /// </summary>
        /// <param name="id">ID del usuario.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el usuario no existe.</exception>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new NotFoundException("Usuario no encontrado.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
