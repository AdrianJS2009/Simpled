using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using Simpled.Dtos.Users;
using Simpled.Models;

namespace Simpled.Controllers
{
    /// <summary>
    /// Controlador para gestionar los tableros favoritos de los usuarios.
    /// </summary>
    [ApiController]
    [Route("api/favorite-boards")]
    [Authorize]
    public class FavoriteBoardsController : ControllerBase
    {
        private readonly SimpledDbContext _context;

        public FavoriteBoardsController(SimpledDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Modifica el estado de favorito de un tablero de true a false.
        /// </summary>
        /// <param name="dto">DTO con el Id del tablero</param>
        /// <returns>True si es favorito, false si no lo es</returns>
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] FavoriteBoardDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = string.IsNullOrEmpty(userIdClaim) ? null : Guid.Parse(userIdClaim);
            if (userId == null) return Unauthorized();


            var favorite = await _context.FavoriteBoards.FindAsync(userId, dto.BoardId);

            if (favorite != null)
            {
                _context.FavoriteBoards.Remove(favorite);
                await _context.SaveChangesAsync();
                return Ok(new { favorite = false });
            }

            _context.FavoriteBoards.Add(new FavoriteBoards
            {
                UserId = (Guid) userId,
                BoardId = dto.BoardId
            });

            await _context.SaveChangesAsync();
            return Ok(new { favorite = true });
        }

        /// <summary>
        /// Revisa si un tablero es favorito o no para el usuario actual.
        /// </summary>
        /// <param name="dto">DTO con el Id del tablero</param>
        /// <returns>True si es favorito, false si no lo es</returns>
        [HttpGet("check-favorite/{boardId}")]
        public async Task<IActionResult> CheckFavorite(FavoriteBoardDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = string.IsNullOrEmpty(userIdClaim) ? null : Guid.Parse(userIdClaim);
            if (userId == null) return Unauthorized();

            var exists = await _context.FavoriteBoards.AnyAsync(f =>
                f.UserId == userId && f.BoardId == dto.BoardId);

            return Ok(new { favorite = exists });
        }

        /// <summary>
        /// Obtiene la lista de tableros marcados como favoritos por el usuario actual.
        /// </summary>
        /// <returns>Lista de tableros favoritos</returns>
        [HttpGet]
        public async Task<IActionResult> GetFavoriteBoardNames()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = string.IsNullOrEmpty(userIdClaim) ? null : Guid.Parse(userIdClaim);
            if (userId == null) return Unauthorized();

            var list = await _context.FavoriteBoards
                .Where(f => f.UserId == userId)
                .Include(f => f.Board)
                .Select(f => new {
                    Id = f.Board!.Id,
                    Name = f.Board!.Name
                })
                .ToListAsync();

            return Ok(list);
        }

        /// <summary>
        /// Obtiene la lista de tableros marcados como favoritos por un usuario específico.
        /// </summary>
        /// <param name="userId">ID del usuario</param>
        /// <returns>Lista de tableros favoritos</returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserFavoriteBoards(Guid userId)
        {
            var list = await _context.FavoriteBoards
                .Where(f => f.UserId == userId)
                .Include(f => f.Board)
                .Select(f => new {
                    Id = f.Board!.Id,
                    Name = f.Board!.Name
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
