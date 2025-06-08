using System.ComponentModel.DataAnnotations;

namespace Simpled.Models
{
    /// <summary>
    /// Representa una tarea o elemento dentro de una columna de tablero.
    /// </summary>
    public class Item
    {
        /// <summary>
        /// Identificador único del ítem.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador de la columna a la que pertenece el ítem.
        /// </summary>
        [Required]
        public Guid ColumnId { get; set; }

        /// <summary>
        /// Título del ítem.
        /// </summary>
        [Required, MaxLength(100)]
        public string Title { get; set; } = default!;

        /// <summary>
        /// Descripción opcional del ítem.
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Fecha límite para completar el ítem, si aplica.
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Fecha de inicio del trabajo en el ítem, si aplica.
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Estado actual del ítem: pending, in-progress, completed o delayed.
        /// </summary>
        [Required, RegularExpression("pending|in-progress|completed|delayed")]
        public string Status { get; set; } = "pending";

        /// <summary>
        /// Identificador del usuario asignado, si existe.
        /// </summary>
        public Guid? AssigneeId { get; set; }

        /// <summary>
        /// Usuario asignado al ítem.
        /// </summary>
        public User? Assignee { get; set; }

        /// <summary>
        /// Comentarios asociados al ítem.
        /// </summary>
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

        /// <summary>
        /// Columna a la que pertenece el ítem.
        /// </summary>
        public BoardColumn? Column { get; set; }

        /// <summary>
        /// Contenido adicional del ítem (texto, imágenes, checkbox).
        /// </summary>
        public List<Content> Contents { get; set; } = new();

        /// <summary>
        /// Lista de subtareas asociadas al ítem.
        /// </summary>
        public List<Subtask> Subtasks { get; set; } = new();

        /// <summary>
        /// Fecha y hora en que la tarea fue completada (UTC).
        /// </summary>
        public DateTime? CompletedAt { get; set; }
    }

}
