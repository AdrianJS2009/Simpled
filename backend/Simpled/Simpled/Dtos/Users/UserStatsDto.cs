using System;

namespace Simpled.Dtos.Users
{
    /// <summary>
    /// DTO para estadísticas del usuario en el dashboard.
    /// </summary>
    public class UserStatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int DelayedTasks { get; set; }
        public int UpcomingDeadlines { get; set; }
        public int CompletedTasksThisWeek { get; set; }
        public int PendingTasksToday { get; set; }
        public int PendingTasks { get; set; }
    }
} 