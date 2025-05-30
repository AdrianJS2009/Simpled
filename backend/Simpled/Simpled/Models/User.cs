using System.ComponentModel.DataAnnotations;

namespace Simpled.Models
{
    /// <summary>
    /// Representa un usuario de la plataforma.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Identificador único del usuario.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Nombre completo del usuario.
        /// </summary>
        public string Name { get; set; } = "Dummy";

        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        /// <summary>
        /// Hash de la contraseña para autenticación.
        /// </summary>
        [Required]
        public string PasswordHash { get; set; } = default!;

        /// <summary>
        /// URL de la imagen de perfil del usuario.
        /// </summary>
        public string ImageUrl { get; set; } = "/images/default/avatar-default.jpg";

        /// <summary>
        /// Fecha de creación de la cuenta (UTC).
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Roles asociados al usuario.
        /// </summary>
        public List<UserRole> Roles { get; set; } = new();

        /// <summary>
        /// Tableros de los que el usuario es miembro.
        /// </summary>
        public List<BoardMember> BoardMembers { get; set; } = new();

        /// <summary>
        /// Cantidad de tableros creados por el usuario.
        /// </summary>
        public int CreatedBoardsCount { get; set; }

        /// <summary>
        /// Cantidad de tareas creadas por el usuario.
        /// </summary>
        public int CreatedTasksCount { get; set; }

        /// <summary>
        /// Cantidad de tareas completadas por el usuario.
        /// </summary>
        public int CompletedTasksCount { get; set; }

        /// <summary>
        /// Cantidad de equipos a los que pertenece el usuario.
        /// </summary>
        public int TeamsCount { get; set; }

        /// <summary>
        /// Logros del usuario.
        /// </summary>
        public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();

        /// <summary>
        /// Equipos creados por el usuario.
        /// </summary>
        public List<Team> Teams { get; set; } = new();

        /// <summary>
        /// Equipos de los que el usuario es miembro.
        /// </summary>
        public List<TeamMember> TeamMembers { get; set; } = new();
    }

}
