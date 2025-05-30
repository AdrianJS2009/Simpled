using System;

namespace Simpled.Dtos.Users
{
    /// <summary>
    /// DTO para una actividad reciente del usuario.
    /// </summary>
    public class UserActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserImageUrl { get; set; } = string.Empty;
        public string? TaskTitle { get; set; }
        public string? BoardName { get; set; }
        public string? CommentText { get; set; }
        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? AssigneeName { get; set; }
        public DateTime Timestamp { get; set; }
    }
} 