using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Simpled.Dtos.Subtasks;
using Simpled.Helpers;
using Simpled.Models;
using Simpled.Repository;

namespace Simpled.Controllers
{
    /// <summary>
    /// Gestiona las subtareas (checklist) de un ítem en el tablero, incluyendo registro de actividad.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/items/{itemId:guid}/subtasks")]
    public class SubtasksController : ControllerBase
    {
        private readonly IItemRepository _itemService;
        private readonly IBoardMemberRepository _memberRepo;
        private readonly IActivityLogRepository _logRepo;

        /// <summary>
        /// Crea una instancia de <see cref="SubtasksController"/>.
        /// </summary>
        public SubtasksController(
            IItemRepository itemService,
            IBoardMemberRepository memberRepo,
            IActivityLogRepository logRepo)
        {
            _itemService = itemService;
            _memberRepo = memberRepo;
            _logRepo = logRepo;
        }

        /// <summary>
        /// Obtiene todas las subtareas asociadas a un ítem.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SubtaskDto>), 200)]
        public async Task<IActionResult> GetAll(Guid itemId)
        {
            var subtasks = await _itemService.GetSubtasksByItemIdAsync(itemId);
            return Ok(subtasks);
        }

        /// <summary>
        /// Crea una nueva subtarea para un ítem y registra la actividad.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(SubtaskDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Create(Guid itemId, [FromBody] SubtaskCreateDto dto)
        {
            if (dto.ItemId != itemId)
                return BadRequest("El ItemId no coincide con la ruta.");

            var boardId = await _itemService.GetBoardIdByItemId(itemId);
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await BoardAuthorizationHelper.HasBoardPermissionAsync(
                    User, boardId, new[] { "admin", "editor" }, _memberRepo))
                return Forbid("No tienes permisos para crear subtareas.");

            var created = await _itemService.CreateSubtaskAsync(dto);

            // Registrar actividad de creación de subtarea
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = userId,
                Action = "Subtarea creada",
                Details = created.Title,
                Timestamp = DateTime.UtcNow
            });

            return CreatedAtAction(nameof(GetAll), new { itemId }, created);
        }

        /// <summary>
        /// Actualiza una subtarea existente y registra la actividad.
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Update(Guid itemId, Guid id, [FromBody] SubtaskUpdateDto dto)
        {
            if (dto.ItemId != itemId || dto.Id != id)
                return BadRequest("ID de subtarea o ItemId incorrectos.");

            var boardId = await _itemService.GetBoardIdByItemId(itemId);
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var item = await _itemService.GetByIdAsync(itemId);

            // Verificar permisos
            var hasBoardPermission = await BoardAuthorizationHelper.HasBoardPermissionAsync(
                User, boardId, new[] { "admin", "editor" }, _memberRepo);

            // Permitir que el usuario asignado marque sus subtareas como completadas
            var isAssignee = item.AssigneeId == userId;

            if (!hasBoardPermission && !isAssignee)
                return Forbid("No tienes permisos para editar subtareas.");

            // Si no es admin/editor, solo puede cambiar el estado de completado
            if (!hasBoardPermission && isAssignee && dto.Title != null)
                return Forbid("Solo puedes marcar las subtareas como completadas.");

            // Obtener estado previo para detalle
            var allSubtasks = await _itemService.GetSubtasksByItemIdAsync(itemId);
            var before = allSubtasks.FirstOrDefault(st => st.Id == id);

            await _itemService.UpdateSubtaskAsync(dto);

            // Registrar actividad de actualización
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = userId,
                Action = "Subtarea actualizada",
                Details = before != null
                    ? $"De '{before.Title}' a '{dto.Title}'"
                    : dto.Title,
                Timestamp = DateTime.UtcNow
            });

            return NoContent();
        }

        /// <summary>
        /// Elimina una subtarea de un ítem y registra la actividad.
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Delete(Guid itemId, Guid id)
        {
            var boardId = await _itemService.GetBoardIdByItemId(itemId);
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!await BoardAuthorizationHelper.HasBoardPermissionAsync(
                    User, boardId, new[] { "admin", "editor" }, _memberRepo))
                return Forbid("No tienes permisos para eliminar subtareas.");

            await _itemService.DeleteSubtaskAsync(id);

            // Registrar actividad de eliminación de subtarea
            await _logRepo.AddAsync(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                UserId = userId,
                Action = "Subtarea eliminada",
                Details = id.ToString(),
                Timestamp = DateTime.UtcNow
            });

            return NoContent();
        }
    }
}
