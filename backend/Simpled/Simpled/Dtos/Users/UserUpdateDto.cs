using System.ComponentModel.DataAnnotations;

namespace Simpled.Dtos.Users
{
     /// <summary>
    /// DTO para actualización de datos de un usuario.
    /// </summary>
    public class UserUpdateDto
    {
        /// <summary>
        /// Identificador único del usuario.
        /// </summary>
        [Required]
        public Guid Id { get; set; }

        /// <summary>
        /// Nombre completo del usuario.
        /// </summary>
        [Required]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Correo electrónico del usuario.
        /// </summary>
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        /// <summary>
        /// Contraseña en texto plano.
        /// </summary>
        public string? Password { get; set; }

        /// <summary>
        /// URL de la imagen de perfil (opcional).
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Indica si el usuario está baneado globalmente. Si es true, el usuario no podrá acceder a la aplicación.
        /// </summary>
        public bool IsBanned { get; set; }
    }
}
