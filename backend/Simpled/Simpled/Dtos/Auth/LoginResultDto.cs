namespace Simpled.Dtos.Auth
{
  /// <summary>
    /// DTO con el resultado del inicio de sesión.
    /// </summary>
    public class LoginResultDto
    {
        /// <summary>
        /// Token JWT generado tras la autenticación.
        /// </summary>
        public string Token { get; set; } = default!;

        /// <summary>
        /// Identificador único del usuario autenticado.
        /// </summary>
        public string UserId { get; set; } = default!;

        /// <summary>
        /// Indica si el usuario está baneado.
        /// </summary>
        public bool IsBanned { get; set; }
    }
}
