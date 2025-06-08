namespace Simpled.Dtos.BoardInvitations
{
    /// <summary>
    /// DTO para eventos SSE de invitaciones (tablero o equipo).
    /// </summary>
    public class SseInvitationEventDto
    {
        /// <summary>
        /// Tipo de evento: "board" o "team".
        /// </summary>
        public string EventType { get; set; } = string.Empty;

        /// <summary>
        /// Datos de la invitación (BoardInvitationReadDto o TeamInvitationReadDto).
        /// </summary>
        public object Data { get; set; } = null!;
    }
} 