using System.ComponentModel.DataAnnotations;
using Simpled.Dtos.Teams;
using Simpled.Models.Enums;

namespace Simpled.Dtos.Users
{
    /// <summary>
    /// DTO para lectura de información de un usuario.
    /// </summary>
    public class UserReadDto
    {
        /// <summary>
        /// Identificador único del usuario.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Nombre completo del usuario.
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// Correo electrónico del usuario.
        /// </summary>
        public string Email { get; set; } = default!;

        /// <summary>
        /// URL de la imagen de perfil del usuario.
        /// </summary>
        public string ImageUrl { get; set; } = default!;

        /// <summary>
        /// Rol asociado al usuario en la web.
        /// </summary>
        [Required]
        [RegularExpression("user|admin", ErrorMessage = "WebRole debe ser 'user' o 'admin'.")]
        public UserWebRoles WebRole { get; set; }


        /// <summary>
        /// Número de logros completados por el usuario.
        /// </summary>
        public int AchievementsCompleted { get; set; }

        /// <summary>
        /// Equipos a los que pertenece el usuario.
        /// </summary>
        public List<TeamReadDto> Teams { get; set; } = new();

        /// <summary>
        /// Fecha de creación de la cuenta de usuario (UTC).
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Roles globales asignados al usuario.
        /// </summary>
        public List<string> Roles { get; set; } = new();

        /// <summary>
        /// Indica si el usuario está baneado globalmente. Si es true, el usuario no podrá acceder a la aplicación.
        /// </summary>
        public bool IsBanned { get; set; }

        /// <summary>
        /// Indica si el usuario es externo (OAuth).
        /// </summary>
        public bool IsExternal { get; set; }

        /// <summary>
        /// Proveedor externo (Google, GitHub, etc), si aplica.
        /// </summary>
        public string? Provider { get; set; }
    }

}
