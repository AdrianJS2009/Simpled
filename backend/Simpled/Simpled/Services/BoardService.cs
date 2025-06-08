using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using Simpled.Dtos.Boards;
using Simpled.Exception;
using Simpled.Hubs;
using Simpled.Models;
using Simpled.Repository;

namespace Simpled.Services
{
    /// <summary>
    /// Servicio para la gestión de tableros (Boards).
    /// Implementa IBoardRepository.
    /// </summary>
    public class BoardService : IBoardRepository
    {
        private readonly SimpledDbContext _context;
        private readonly IHubContext<BoardHub> _hubContext;

        public BoardService(SimpledDbContext context, IHubContext<BoardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Obtiene todos los tableros visibles para un usuario.
        /// </summary>
        /// <param name="userId">ID del usuario (opcional).</param>
        /// <returns>Lista de tableros.</returns>
        public async Task<IEnumerable<BoardReadDto>> GetAllAsync(Guid? userId = null)
        {
            var boards = await _context.Boards
                .Where(b =>
                    b.IsPublic ||
                    (userId != null &&
                     (b.OwnerId == userId ||
                      _context.BoardMembers.Any(m => m.BoardId == b.Id && m.UserId == userId))))
                .Select(b => new BoardReadDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    OwnerId = b.OwnerId,
                    IsPublic = b.IsPublic,
                    UserRole = userId != null
                        ? _context.BoardMembers
                            .Where(m => m.BoardId == b.Id && m.UserId == userId)
                            .Select(m => m.Role)
                            .FirstOrDefault()
                        : null,
                })
                .ToListAsync();

            if (userId != null)
            {
                foreach (var board in boards)
                {
                    board.IsFavorite = await _context.FavoriteBoards
                        .AnyAsync(f => f.BoardId == board.Id && f.UserId == userId);
                }
            }

            return boards;
        }

        /// <summary>
        /// Obtiene un tablero por su ID y el ID del usuario.
        /// </summary>
        /// <param name="id">ID del tablero.</param>
        /// <param name="userId">ID del usuario.</param>
        /// <returns>DTO del tablero o null si no existe.</returns>
        /// <exception cref="NotFoundException">Si el tablero no se encuentra.</exception>
        public async Task<BoardReadDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var b = await _context.Boards.FindAsync(id);
            if (b == null)
                throw new NotFoundException("Tablero no encontrado.");

            return new BoardReadDto
            {
                Id = b.Id,
                Name = b.Name,
                OwnerId = b.OwnerId,
                IsPublic = b.IsPublic,
                IsFavorite = await _context.FavoriteBoards
                                .AnyAsync(f => f.BoardId == b.Id && f.UserId == userId)
            };
        }

        /// <summary>
        /// Crea un nuevo tablero y asigna al usuario como admin.
        /// </summary>
        /// <param name="dto">Datos del tablero a crear.</param>
        /// <param name="userId">ID del usuario creador.</param>
        /// <returns>DTO del tablero creado.</returns>
        public async Task<BoardReadDto> CreateAsync(BoardCreateDto dto, Guid userId)
        {
            var newBoard = new Board
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                OwnerId = userId,
                IsPublic = dto.IsPublic
            };

            _context.Boards.Add(newBoard);

            _context.BoardMembers.Add(new BoardMember
            {
                BoardId = newBoard.Id,
                UserId = userId,
                Role = "admin"
            });

            await _context.SaveChangesAsync();

            var dtoResult = new BoardReadDto
            {
                Id = newBoard.Id,
                Name = newBoard.Name,
                OwnerId = newBoard.OwnerId,
                IsPublic = newBoard.IsPublic
            };

            // Emitir notificación general si estás en una vista global
            await _hubContext.Clients.User(userId.ToString())
                .SendAsync("BoardUpdated", newBoard.Id, "BoardCreated", dtoResult);

            return dtoResult;
        }

        /// <summary>
        /// Actualiza los datos de un tablero existente.
        /// </summary>
        /// <param name="dto">Datos actualizados del tablero.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el tablero no se encuentra.</exception>
        public async Task<bool> UpdateAsync(BoardUpdateDto dto)
        {
            var board = await _context.Boards.FindAsync(dto.Id);
            if (board == null)
                throw new NotFoundException("Tablero no encontrado.");

            board.Name = dto.Name;
            board.IsPublic = dto.IsPublic;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group(dto.Id.ToString())
                .SendAsync("BoardUpdated", dto.Id, "BoardUpdated", new
                {
                    dto.Name,
                    dto.IsPublic
                });

            return true;
        }

        /// <summary>
        /// Elimina un tablero por su ID.
        /// </summary>
        /// <param name="id">ID del tablero.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el tablero no se encuentra.</exception>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var board = await _context.Boards.FindAsync(id);
            if (board == null)
                throw new NotFoundException("Tablero no encontrado.");

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group(id.ToString())
                .SendAsync("BoardUpdated", id, "BoardDeleted", new { id });

            return true;
        }

        /// <summary>
        /// Obtiene un tablero por su ID (sin tracking).
        /// </summary>
        /// <param name="id">ID del tablero.</param>
        /// <returns>Entidad Board o null si no existe.</returns>
        public async Task<Board?> GetBoardByIdAsync(Guid id)
        {
            return await _context.Boards
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);
        }
    }
}
