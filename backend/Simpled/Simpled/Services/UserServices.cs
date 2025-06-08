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
using Simpled.Models.Enums;

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
                WebRole = u.WebRole,
                Roles = u.Roles.Select(r => r.Role).ToList(),
                IsBanned = u.IsBanned,
                IsExternal = u.IsExternal,
                Provider = u.Provider
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
                Name = tm.Team?.Name ?? string.Empty,
                OwnerId = tm.Team?.OwnerId ?? Guid.Empty,
                OwnerName = tm.Team?.Owner?.Name ?? string.Empty,
                Role = tm.Role,
                Members = tm.Team?.Members != null
                    ? tm.Team.Members.Select(m => new TeamMemberDto
                    {
                        UserId = m.UserId,
                        UserName = m.User?.Name ?? string.Empty,
                        Role = m.Role
                    })
                    : new List<TeamMemberDto>()
            });

            return new UserReadDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ImageUrl = user.ImageUrl,
                AchievementsCompleted = user.Achievements.Count,
                CreatedAt = user.CreatedAt,
                WebRole = user.WebRole,
                Roles = user.Roles.Select(r => r.Role).ToList(),
                Teams = teamDtos.ToList(),
                IsBanned = user.IsBanned,
                IsExternal = user.IsExternal,
                Provider = user.Provider
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
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
                throw new ApiException("Ya existe un usuario con ese correo.", 409);
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = userDto.Name,
                Email = userDto.Email,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                WebRole = UserWebRoles.User,
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
                WebRole = user.WebRole,
                Roles = user.Roles.Select(r => r.Role).ToList(),
                ImageUrl = user.ImageUrl,
                IsExternal = user.IsExternal,
                Provider = user.Provider
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

            if (existing.IsExternal)
            {
                // Solo permite cambiar nombre e imagen
                existing.Name = userDto.Name;
                await ActualizarImagenUsuario(existing, userDto.ImageUrl, image);
            }
            else
            {
                existing.Email = userDto.Email;
                existing.Name = userDto.Name;
                await ActualizarPasswordSiEsNecesario(existing, userDto.Password);
                await ActualizarImagenUsuario(existing, userDto.ImageUrl, image);
            }

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

        /// <summary>
        /// Cambia el rol global de un usuario (admin, editor, viewer).
        /// </summary>
        /// <param name="userId">ID del usuario.</param>
        /// <param name="role">Nuevo rol global a asignar.</param>
        /// <returns>True si la operación fue exitosa.</returns>
        public async Task<bool> ChangeUserRoleAsync(Guid userId, string role)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new NotFoundException("Usuario no encontrado.");

            if (!Enum.TryParse<UserWebRoles>(role, true, out var parsedRole))
                throw new ApiException("Rol no válido.", 400);

            user.WebRole = parsedRole;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Banea o desbanea a un usuario globalmente.
        /// </summary>
        /// <param name="userId">ID del usuario.</param>
        /// <param name="isBanned">True para banear, false para desbanear.</param>
        /// <returns>True si la operación fue exitosa.</returns>
        public async Task<bool> SetUserBannedAsync(Guid userId, bool isBanned)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new NotFoundException("Usuario no encontrado.");
            user.IsBanned = isBanned;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserStatsDto> GetUserStatsAsync(Guid userId)
        {
            var tasks = await _context.Items.Where(i => i.AssigneeId == userId).ToListAsync();
            var now = DateTime.UtcNow;
            var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek + 1); // Lunes
            var endOfWeek = startOfWeek.AddDays(7);
            var today = now.Date;
            return new UserStatsDto
            {
                TotalTasks = tasks.Count,
                CompletedTasks = tasks.Count(t => t.Status == "completed"),
                InProgressTasks = tasks.Count(t => t.Status == "in-progress"),
                DelayedTasks = tasks.Count(t => t.Status == "delayed"),
                UpcomingDeadlines = tasks.Count(t => (t.Status == "pending" || t.Status == "in-progress") && t.DueDate != null && t.DueDate > now && t.DueDate < now.AddDays(7)),
                CompletedTasksThisWeek = tasks.Count(t => t.Status == "completed" && t.CompletedAt != null && t.CompletedAt >= startOfWeek && t.CompletedAt < endOfWeek),
                PendingTasksToday = tasks.Count(t => (t.Status == "pending" || t.Status == "in-progress") && t.DueDate != null && t.DueDate.Value.Date == today),
                PendingTasks = tasks.Count(t => t.Status == "pending")
            };
        }

        public async Task<List<UserActivityDto>> GetUserRecentActivityAsync(Guid userId)
        {
            var activities = await _context.ActivityLogs
                .Include(a => a.User)
                .Include(a => a.Item)
                    .ThenInclude(i => i.Column)
                        .ThenInclude(c => c.Board)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .ToListAsync();
            return activities.Select(a => new UserActivityDto
            {
                Id = a.Id.ToString(),
                Type = a.Action,
                UserName = a.User != null ? a.User.Name : "",
                UserImageUrl = a.User != null ? a.User.ImageUrl : "",
                TaskTitle = a.Item != null ? a.Item.Title : null,
                BoardName = a.Item?.Column?.Board != null ? a.Item.Column.Board.Name : null,
                CommentText = a.Field == "comment" ? a.NewValue : null,
                OldStatus = a.Field == "status" ? a.OldValue : null,
                NewStatus = a.Field == "status" ? a.NewValue : null,
                AssigneeName = a.Field == "assignee" ? a.NewValue : null,
                Timestamp = a.Timestamp
            }).ToList();
        }
    }
}
