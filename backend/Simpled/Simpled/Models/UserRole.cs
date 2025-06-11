using System.ComponentModel.DataAnnotations;

namespace Simpled.Models
{
     /// <summary>
    /// Define los roles globales posibles de un usuario en la aplicación.
    /// </summary>
    public class UserRole
    {
        /// <summary>
        /// Identificador único de la relación rol-usuario.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador del usuario.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Rol global asignado (admin o user).
        /// </summary>
        [Required, RegularExpression("admin|user")]
        public string Role { get; set; } = default!;

        /// <summary>
        /// Usuario al que pertenece el rol.
        /// </summary>
        public User? User { get; set; }
    }
}
