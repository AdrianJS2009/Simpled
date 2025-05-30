using Simpled.Dtos.Teams;

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
    }

}
