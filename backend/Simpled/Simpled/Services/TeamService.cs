using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using Simpled.Dtos.Teams;
using Simpled.Dtos.Teams.TeamMembers;
using Simpled.Exception;
using Simpled.Models;
using Simpled.Repository;
using FluentValidation;
using Simpled.Services.Achievements;

namespace Simpled.Services
{
    /// <summary>
    /// Servicio para la gestión de equipos y sus miembros.
    /// Implementa ITeamRepository e ITeamMemberRepository.
    /// </summary>
    public class TeamService : ITeamRepository, ITeamMemberRepository
    {
        private readonly SimpledDbContext _context;
        private readonly AchievementsService _achievementsService;

        public TeamService(SimpledDbContext context, AchievementsService achievementsService)
        {
            _context = context;
            _achievementsService = achievementsService;
        }

        // ITeamRepository

        /// <summary>
        /// Obtiene todos los equipos donde el usuario es owner o miembro.
        /// </summary>
        /// <param name="userId">ID del usuario.</param>
        /// <returns>Lista de equipos.</returns>
        public async Task<IEnumerable<TeamReadDto>> GetAllByUserAsync(Guid userId)
        {
            // Equipos donde es owner o miembro
            var teams = await _context.Teams
                .Include(t => t.Owner)
                .Include(t => t.Members).ThenInclude(tm => tm.User)
                .Where(t => t.OwnerId == userId
                         || t.Members.Any(tm => tm.UserId == userId))
                .ToListAsync();

            return teams.Select(t => new TeamReadDto
            {
                Id = t.Id,
                Name = t.Name,
                OwnerId = t.OwnerId,
                OwnerName = t.Owner!.Name,
                Members = t.Members.Select(m => new TeamMemberDto
                {
                    UserId = m.UserId,
                    UserName = m.User!.Name,
                    Role = m.Role
                })
            });
        }

        /// <summary>
        /// Obtiene un equipo por su ID.
        /// </summary>
        /// <param name="id">ID del equipo.</param>
        /// <returns>DTO del equipo o null si no existe.</returns>
        public async Task<TeamReadDto?> GetByIdAsync(Guid id)
        {
            var team = await _context.Teams
                .Include(t => t.Owner)
                .Include(t => t.Members).ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team == null) return null;

            return new TeamReadDto
            {
                Id = team.Id,
                Name = team.Name,
                OwnerId = team.OwnerId,
                OwnerName = team.Owner!.Name,
                Members = team.Members.Select(m => new TeamMemberDto
                {
                    UserId = m.UserId,
                    UserName = m.User!.Name,
                    Role = m.Role
                })
            };
        }

        /// <summary>
        /// Crea un nuevo equipo y lo asigna a un owner.
        /// </summary>
        /// <param name="dto">Datos del equipo a crear.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <returns>DTO del equipo creado.</returns>
        public async Task<TeamReadDto> CreateAsync(TeamCreateDto dto, Guid ownerId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ApiException("El nombre del equipo es obligatorio.", 400);
            var team = new Team
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                OwnerId = ownerId
            };
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return new TeamReadDto
            {
                Id = team.Id,
                Name = team.Name,
                OwnerId = team.OwnerId,
                OwnerName = (await _context.Users.FindAsync(ownerId))!.Name,
                Members = Array.Empty<TeamMemberDto>()
            };
        }

        /// <summary>
        /// Actualiza los datos de un equipo existente.
        /// </summary>
        /// <param name="dto">Datos actualizados del equipo.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el equipo no existe.</exception>
        /// <exception cref="ApiException">Si el usuario no tiene permisos.</exception>
        public async Task<bool> UpdateAsync(TeamUpdateDto dto, Guid ownerId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ApiException("El nombre del equipo es obligatorio.", 400);
            var team = await _context.Teams.FindAsync(dto.Id);
            if (team == null) throw new NotFoundException("Equipo no encontrado.");
            if (team.OwnerId != ownerId) throw new ApiException("No tienes permisos para modificar este equipo.", 403);

            team.Name = dto.Name;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Elimina un equipo por su ID.
        /// </summary>
        /// <param name="id">ID del equipo.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el equipo no existe.</exception>
        /// <exception cref="ApiException">Si el usuario no tiene permisos.</exception>
        public async Task<bool> DeleteAsync(Guid id, Guid ownerId)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null) throw new NotFoundException("Equipo no encontrado.");
            if (team.OwnerId != ownerId) throw new ApiException("No tienes permisos para eliminar este equipo.", 403);

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
            return true;
        }

        // ITeamMemberRepository

        /// <summary>
        /// Obtiene los miembros de un equipo.
        /// </summary>
        /// <param name="teamId">ID del equipo.</param>
        /// <returns>Lista de miembros.</returns>
        public async Task<IEnumerable<TeamMemberDto>> GetMembersAsync(Guid teamId)
        {
            var members = await _context.TeamMembers
                .Include(tm => tm.User)
                .Where(tm => tm.TeamId == teamId)
                .ToListAsync();

            return members.Select(m => new TeamMemberDto
            {
                UserId = m.UserId,
                UserName = m.User!.Name,
                Role = m.Role
            });
        }

        /// <summary>
        /// Añade un miembro a un equipo.
        /// </summary>
        /// <param name="dto">Datos del miembro.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <exception cref="NotFoundException">Si el equipo no existe.</exception>
        /// <exception cref="ApiException">Si el usuario no tiene permisos o el miembro ya existe.</exception>
        public async Task AddMemberAsync(TeamMemberCreateDto dto, Guid ownerId)
        {
            if (dto.TeamId == Guid.Empty || dto.UserId == Guid.Empty || string.IsNullOrWhiteSpace(dto.Role))
                throw new ApiException("Todos los campos del miembro son obligatorios.", 400);
            var team = await _context.Teams.FindAsync(dto.TeamId);
            if (team == null) throw new NotFoundException("Equipo no encontrado.");
            if (team.OwnerId != ownerId) throw new ApiException("No tienes permisos para invitar a este equipo.", 403);

            bool exists = await _context.TeamMembers.AnyAsync(tm =>
                tm.TeamId == dto.TeamId && tm.UserId == dto.UserId);
            if (exists) throw new ApiException("Usuario ya es miembro del equipo.", 409);

            _context.TeamMembers.Add(new TeamMember
            {
                TeamId = dto.TeamId,
                UserId = dto.UserId,
                Role = dto.Role
            });

          
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user != null)
            {
                user.TeamsCount++;
                await _achievementsService.ProcessActionAsync(user, "UnirseEquipo", user.TeamsCount);
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Actualiza el rol de un miembro de equipo.
        /// </summary>
        /// <param name="dto">Datos del miembro.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el equipo o miembro no existe.</exception>
        /// <exception cref="ApiException">Si el usuario no tiene permisos.</exception>
        public async Task<bool> UpdateMemberAsync(TeamMemberUpdateDto dto, Guid ownerId)
        {
            if (dto.TeamId == Guid.Empty || dto.UserId == Guid.Empty || string.IsNullOrWhiteSpace(dto.Role))
                throw new ApiException("Todos los campos del miembro son obligatorios.", 400);
            var team = await _context.Teams.FindAsync(dto.TeamId);
            if (team == null) throw new NotFoundException("Equipo no encontrado.");
            if (team.OwnerId != ownerId) throw new ApiException("No tienes permisos para modificar miembros.", 403);

            var member = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == dto.TeamId && tm.UserId == dto.UserId);
            if (member == null) throw new NotFoundException("Miembro no encontrado.");

            member.Role = dto.Role;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Elimina un miembro de un equipo.
        /// </summary>
        /// <param name="teamId">ID del equipo.</param>
        /// <param name="userId">ID del usuario a eliminar.</param>
        /// <param name="ownerId">ID del owner.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el equipo o miembro no existe.</exception>
        /// <exception cref="ApiException">Si el usuario no tiene permisos.</exception>
        public async Task<bool> RemoveMemberAsync(Guid teamId, Guid userId, Guid ownerId)
        {
            var team = await _context.Teams.FindAsync(teamId);
            if (team == null) throw new NotFoundException("Equipo no encontrado.");
            if (team.OwnerId != ownerId) throw new ApiException("No tienes permisos para eliminar miembros.", 403);

            var member = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);
            if (member == null) throw new NotFoundException("Miembro no encontrado.");

          
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.TeamsCount--;
            }

            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
