﻿using System.ComponentModel.DataAnnotations;

namespace Simpled.Dtos.Items
{
    public class ItemCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = default!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        [Required]
        public Guid ColumnId { get; set; }
    }
}
