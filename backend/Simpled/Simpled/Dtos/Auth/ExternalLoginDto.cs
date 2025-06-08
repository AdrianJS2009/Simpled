namespace Simpled.Dtos.Auth
{
    /// <summary>
    /// DTO para inicio de sesión externo (OAuth, etc.).
    /// </summary>
    public class ExternalLoginDto
    {
        /// <summary>
        /// Proveedor de autenticación externo (p. ej., Google, Facebook).
        /// </summary>
        public string Provider { get; set; } = string.Empty;

        /// <summary>
        /// Clave única proporcionada por el proveedor.
        /// </summary>
        public string ProviderKey { get; set; } = string.Empty;

        /// <summary>
        /// Correo electrónico del usuario autenticado.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del usuario autenticado.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// URL de la imagen de perfil del usuario autenticado.
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;
    }
}