using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using Simpled.Dtos.Items;
using Simpled.Dtos.Subtasks;
using Simpled.Exception;
using Simpled.Hubs;
using Simpled.Models;
using Simpled.Repository;
using Simpled.Validators;
using FluentValidation;

namespace Simpled.Services
{
    /// <summary>
    /// Servicio para la gestión de ítems y subtareas.
    /// Implementa IItemRepository.
    /// </summary>
    public class ItemService : IItemRepository
    {
        private readonly SimpledDbContext _context;
        private readonly IHubContext<BoardHub> _hubContext;

        public ItemService(SimpledDbContext context, IHubContext<BoardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Obtiene todos los ítems del sistema.
        /// </summary>
        /// <returns>Lista de ítems.</returns>
        public async Task<IEnumerable<ItemReadDto>> GetAllAsync()
        {
            return await _context.Items
                .Include(i => i.Subtasks)
                .Select(i => new ItemReadDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    StartDate = i.StartDate,
                    DueDate = i.DueDate,
                    ColumnId = i.ColumnId,
                    Status = i.Status,
                    AssigneeId = i.AssigneeId,
                    Subtasks = i.Subtasks
                        .Select(st => new SubtaskDto
                        {
                            Id = st.Id,
                            ItemId = st.ItemId,
                            Title = st.Title,
                            IsCompleted = st.IsCompleted
                        })
                        .ToList()
                })
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene un ítem por su ID.
        /// </summary>
        /// <param name="id">ID del ítem.</param>
        /// <returns>DTO del ítem o excepción si no existe.</returns>
        public async Task<ItemReadDto?> GetByIdAsync(Guid id)
        {
            var i = await _context.Items
                .Include(i => i.Subtasks)
                .FirstOrDefaultAsync(i => i.Id == id)
                ?? throw new NotFoundException("Ítem no encontrado.");

            return new ItemReadDto
            {
                Id = i.Id,
                Title = i.Title,
                Description = i.Description,
                StartDate = i.StartDate,
                DueDate = i.DueDate,
                ColumnId = i.ColumnId,
                Status = i.Status,
                AssigneeId = i.AssigneeId,
                Subtasks = i.Subtasks
                    .Select(st => new SubtaskDto
                    {
                        Id = st.Id,
                        ItemId = st.ItemId,
                        Title = st.Title,
                        IsCompleted = st.IsCompleted
                    })
                    .ToList()
            };
        }

        /// <summary>
        /// Crea un nuevo ítem.
        /// </summary>
        /// <param name="dto">Datos del ítem a crear.</param>
        /// <returns>DTO del ítem creado.</returns>
        public async Task<ItemReadDto> CreateAsync(ItemCreateDto dto)
        {
            var validator = new ItemCreateValidator();
            var validationResult = validator.Validate(dto);
            if (!validationResult.IsValid)
                throw new ApiException(validationResult.Errors[0].ErrorMessage, 400);
            var item = new Item
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                DueDate = dto.DueDate,
                ColumnId = dto.ColumnId,
                Status = dto.Status,
                AssigneeId = dto.AssigneeId
            };
            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            var result = new ItemReadDto
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                StartDate = item.StartDate,
                DueDate = item.DueDate,
                ColumnId = item.ColumnId,
                Status = item.Status,
                AssigneeId = item.AssigneeId
            };

            var boardId = (await GetBoardIdByColumnId(dto.ColumnId)).ToString();
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "ItemCreated", result);

            return result;
        }

        /// <summary>
        /// Actualiza los datos de un ítem existente.
        /// </summary>
        /// <param name="dto">Datos actualizados del ítem.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el ítem no existe.</exception>
        public async Task<bool> UpdateAsync(ItemUpdateDto dto)
        {
            var validator = new ItemUpdateValidator();
            var validationResult = validator.Validate(dto);
            if (!validationResult.IsValid)
                throw new ApiException(validationResult.Errors[0].ErrorMessage, 400);
            var item = await _context.Items.FindAsync(dto.Id)
                ?? throw new NotFoundException("Ítem no encontrado.");

          
            var wasCompleted = item.Status == "completed";

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.StartDate = dto.StartDate;
            item.DueDate = dto.DueDate;
            item.ColumnId = dto.ColumnId;
            item.Status = dto.Status;
            item.AssigneeId = dto.AssigneeId;

 
            if (!wasCompleted && dto.Status == "completed")
                item.CompletedAt = DateTime.UtcNow;
            else if (wasCompleted && dto.Status != "completed")
                item.CompletedAt = null;

            await _context.SaveChangesAsync();

            var boardId = (await GetBoardIdByItemId(dto.Id)).ToString();
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "ItemUpdated", new
                {
                    dto.Id,
                    dto.Title,
                    dto.Description,
                    dto.StartDate,
                    dto.DueDate,
                    dto.ColumnId,
                    dto.Status,
                    dto.AssigneeId
                });

            return true;
        }

        /// <summary>
        /// Actualiza el estado de un ítem.
        /// </summary>
        /// <param name="id">ID del ítem.</param>
        /// <param name="status">Nuevo estado.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el ítem no existe.</exception>
        public async Task<bool> UpdateStatusAsync(Guid id, string status)
        {
            var item = await _context.Items.FindAsync(id)
                ?? throw new NotFoundException("Ítem no encontrado.");

            var wasCompleted = item.Status == "completed";
            item.Status = status;
            if (!wasCompleted && status == "completed")
                item.CompletedAt = DateTime.UtcNow;
            else if (wasCompleted && status != "completed")
                item.CompletedAt = null;

            await _context.SaveChangesAsync();

            var boardId = (await GetBoardIdByItemId(id)).ToString();
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "ItemStatusChanged", new { id, status });

            return true;
        }

        /// <summary>
        /// Elimina un ítem por su ID.
        /// </summary>
        /// <param name="id">ID del ítem.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si el ítem no existe.</exception>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var item = await _context.Items.FindAsync(id)
                ?? throw new NotFoundException("Ítem no encontrado.");

            var boardId = (await GetBoardIdByItemId(id)).ToString();
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "ItemDeleted", new { id });

            return true;
        }

        /// <summary>
        /// Sube un archivo asociado a un ítem.
        /// </summary>
        /// <param name="itemId">ID del ítem.</param>
        /// <param name="file">Archivo a subir.</param>
        /// <returns>Entidad Content creada.</returns>
        /// <exception cref="NotFoundException">Si el ítem no existe.</exception>
        /// <exception cref="ApiException">Si el archivo es inválido.</exception>
        public async Task<Content?> UploadFileAsync(Guid itemId, IFormFile file)
        {
            var item = await _context.Items.FindAsync(itemId)
                ?? throw new NotFoundException("Ítem no encontrado para subir archivo.");
            if (file == null || file.Length == 0)
                throw new ApiException("El archivo es inválido o está vacío.", 400);

            var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploads);

            var filename = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var path = Path.Combine(uploads, filename);
            await using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            var content = new Content
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                Type = "image",
                Value = "/uploads/" + filename
            };
            _context.Contents.Add(content);
            await _context.SaveChangesAsync();

            var boardId = (await GetBoardIdByItemId(itemId)).ToString();
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "ItemFileUploaded", new
                {
                    itemId,
                    contentId = content.Id,
                    content.Value
                });

            return content;
        }

        /// <summary>
        /// Obtiene el ID del tablero al que pertenece una columna.
        /// </summary>
        /// <param name="columnId">ID de la columna.</param>
        /// <returns>ID del tablero.</returns>
        /// <exception cref="NotFoundException">Si la columna no existe.</exception>
        public async Task<Guid> GetBoardIdByColumnId(Guid columnId)
        {
            var column = await _context.BoardColumns.FindAsync(columnId)
                ?? throw new NotFoundException("Columna no encontrada.");
            return column.BoardId;
        }

        /// <summary>
        /// Obtiene el ID del tablero al que pertenece un ítem.
        /// </summary>
        /// <param name="itemId">ID del ítem.</param>
        /// <returns>ID del tablero.</returns>
        /// <exception cref="NotFoundException">Si el ítem o la columna no existen.</exception>
        public async Task<Guid> GetBoardIdByItemId(Guid itemId)
        {
            var item = await _context.Items.FindAsync(itemId)
                ?? throw new NotFoundException("Ítem no encontrado.");
            var column = await _context.BoardColumns.FindAsync(item.ColumnId)
                ?? throw new NotFoundException("Columna del ítem no encontrada.");
            return column.BoardId;
        }

        /// <summary>
        /// Obtiene las subtareas asociadas a un ítem.
        /// </summary>
        /// <param name="itemId">ID del ítem.</param>
        /// <returns>Lista de subtareas.</returns>
        public async Task<IEnumerable<SubtaskDto>> GetSubtasksByItemIdAsync(Guid itemId)
        {
            return await _context.Subtasks
                .Where(st => st.ItemId == itemId)
                .Select(st => new SubtaskDto
                {
                    Id = st.Id,
                    ItemId = st.ItemId,
                    Title = st.Title,
                    IsCompleted = st.IsCompleted
                })
                .ToListAsync();
        }

        /// <summary>
        /// Crea una nueva subtarea para un ítem.
        /// </summary>
        /// <param name="dto">Datos de la subtarea.</param>
        /// <returns>DTO de la subtarea creada.</returns>
        public async Task<SubtaskDto> CreateSubtaskAsync(SubtaskCreateDto dto)
        {
            var subtask = new Subtask
            {
                Id = Guid.NewGuid(),
                ItemId = dto.ItemId,
                Title = dto.Title,
                IsCompleted = false
            };
            _context.Subtasks.Add(subtask);
            await _context.SaveChangesAsync();

            var boardId = (await GetBoardIdByItemId(dto.ItemId)).ToString();
            var result = new SubtaskDto
            {
                Id = subtask.Id,
                ItemId = subtask.ItemId,
                Title = subtask.Title,
                IsCompleted = subtask.IsCompleted
            };
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "SubtaskCreated", result);

            return result;
        }

        /// <summary>
        /// Actualiza los datos de una subtarea existente.
        /// </summary>
        /// <param name="dto">Datos actualizados de la subtarea.</param>
        /// <returns>True si la actualización fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si la subtarea no existe.</exception>
        public async Task<bool> UpdateSubtaskAsync(SubtaskUpdateDto dto)
        {
            var subtask = await _context.Subtasks.FindAsync(dto.Id)
                ?? throw new NotFoundException("Subtarea no encontrada.");

            subtask.Title = dto.Title;
            subtask.IsCompleted = dto.IsCompleted;
            await _context.SaveChangesAsync();

            var boardId = (await GetBoardIdByItemId(dto.ItemId)).ToString();
            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "SubtaskUpdated", new
                {
                    dto.Id,
                    dto.ItemId,
                    dto.Title,
                    dto.IsCompleted
                });

            return true;
        }

        /// <summary>
        /// Elimina una subtarea por su ID.
        /// </summary>
        /// <param name="subtaskId">ID de la subtarea.</param>
        /// <returns>True si la eliminación fue exitosa.</returns>
        /// <exception cref="NotFoundException">Si la subtarea no existe.</exception>
        public async Task<bool> DeleteSubtaskAsync(Guid subtaskId)
        {
            var subtask = await _context.Subtasks.FindAsync(subtaskId)
                ?? throw new NotFoundException("Subtarea no encontrada.");

            var itemId = subtask.ItemId;
            var boardId = (await GetBoardIdByItemId(itemId)).ToString();
            _context.Subtasks.Remove(subtask);
            await _context.SaveChangesAsync();

            await _hubContext.Clients
                .Group(boardId)
                .SendAsync("BoardUpdated", boardId, "SubtaskDeleted", new
                {
                    Id = subtaskId,
                    ItemId = itemId
                });

            return true;
        }
    }
}
