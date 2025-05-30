using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Simpled.Dtos.Comments;
using Simpled.Models;
using Simpled.Repository;

namespace Simpled.Controllers
{
    /// <summary>
    /// Gestiona los comentarios de un ítem, incluyendo registro de actividad.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/items/{itemId:guid}/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentRepository _commentRepo;
        private readonly IActivityLogRepository _logRepo;

        /// <summary>
        /// Constructor que inyecta repositorios de comentarios y logs de actividad.
        /// </summary>
        public CommentsController(
            ICommentRepository commentRepo,
            IActivityLogRepository logRepo)
        {
            _commentRepo = commentRepo;
            _logRepo = logRepo;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Obtiene todos los comentarios de un ítem.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetComments(Guid itemId)
        {
            var comments = await _commentRepo.GetByItemIdAsync(itemId);
            return Ok(comments);
        }

        /// <summary>
        /// Crea un nuevo comentario y registra la actividad.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CommentReadDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> AddComment(Guid itemId, [FromBody] CommentCreateDto dto)
        {
            if (itemId != dto.ItemId)
                return BadRequest("El ID del ítem no coincide.");

            var created = await _commentRepo.CreateAsync(CurrentUserId, dto);

            // Registrar actividad de comentario añadido
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = CurrentUserId,
                Action = "Comentario añadido",
                Details = created.Text,
                Timestamp = DateTime.UtcNow
            });

            return CreatedAtAction(nameof(GetComments), new { itemId }, created);
        }

        /// <summary>
        /// Elimina un comentario (solo autor) y registra la actividad.
        /// </summary>
        [HttpDelete("{commentId:guid}")]
        public async Task<IActionResult> Delete(Guid itemId, Guid commentId)
        {
            var success = await _commentRepo.DeleteAsync(commentId, CurrentUserId);
            if (!success)
                return Forbid("No puedes eliminar este comentario.");

            // Registrar actividad de comentario eliminado
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = CurrentUserId,
                Action = "Comentario eliminado",
                Details = commentId.ToString(),
                Timestamp = DateTime.UtcNow
            });

            return NoContent();
        }

        /// <summary>
        /// Marca un comentario como resuelto/no resuelto y registra la actividad.
        /// </summary>
        [HttpPatch("{commentId:guid}/resolve")]
        public async Task<IActionResult> ToggleResolved(Guid itemId, Guid commentId, [FromQuery] bool resolved)
        {
            var success = await _commentRepo.MarkAsResolvedAsync(commentId, CurrentUserId, resolved);
            if (!success)
                return Forbid("No puedes modificar este comentario.");

            // Registrar actividad de resolvimiento de comentario
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = CurrentUserId,
                Action = resolved ? "Comentario resuelto" : "Comentario reabierto",
                Details = commentId.ToString(),
                Timestamp = DateTime.UtcNow
            });

            return NoContent();
        }

        /// <summary>
        /// Actualiza un comentario y registra la actividad.
        /// </summary>
        [HttpPut("{commentId:guid}")]
        public async Task<IActionResult> Update(
            Guid itemId,
            Guid commentId,
            [FromBody] CommentUpdateDto dto)
        {
            if (itemId != dto.ItemId)
                return BadRequest("El ID del ítem no coincide.");

            var updated = await _commentRepo.UpdateAsync(CurrentUserId, commentId, dto);
            if (updated is null)
                return Forbid("No puedes editar este comentario.");

            // Registrar actividad de comentario editado
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = CurrentUserId,
                Action = "Comentario editado",
                Details = updated.Text,
                Timestamp = DateTime.UtcNow
            });

            return Ok(updated);
        }
    }
}