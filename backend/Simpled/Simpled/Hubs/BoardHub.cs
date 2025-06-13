using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace Simpled.Hubs
{

    public class BoardHub : Hub
    {
        /// <summary>
        /// Notifica a un usuario de una invitación de tablero.
        /// </summary>
        /// <param name="email">Correo electrónico del usuario invitado.</param>
        /// <param name="message">Mensaje de la invitación.</param>
        public async Task SendInvitationNotification(string email, string message)
        {
            await Clients.User(email).SendAsync("InvitationReceived", message);
        }

        /// <summary>
        /// Notifica a un usuario de una invitación de equipo.
        /// </summary>
        /// <param name="email">Correo electrónico del usuario invitado.</param>
        /// <param name="teamName">Nombre del equipo.</param>
        /// <param name="role">Rol asignado en el equipo.</param>
        public async Task SendTeamInvitation(string email, string teamName, string role)
        {
            await Clients.User(email).SendAsync("TeamInvitationReceived", new
            {
                teamName,
                role
            });
        }

        /// <summary>
        /// Notifica a todos los usuarios conectados al grupo del tablero que éste ha sido actualizado.
        /// </summary>
        /// <param name="boardId">Identificador del tablero.</param>
        /// <param name="action">Acción realizada (por ejemplo, "ColumnCreated").</param>
        /// <param name="payload">Datos adicionales asociados a la acción.</param>
        public async Task NotifyBoardUpdated(string boardId, string action, object payload)
        {
            await Clients
                 .Group(boardId)
                 .SendAsync("BoardUpdated", boardId, action, payload);
        }

        /// <summary>
        /// Al conectar un cliente, lo añade al grupo basado en su email (para invitaciones).
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
            if (!string.IsNullOrEmpty(email))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, email.ToLower());
            }
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Une la conexión actual al grupo del tablero especificado.
        /// </summary>
        /// <param name="boardId">Identificador del tablero.</param>
        public async Task JoinBoardGroup(Guid boardId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId.ToString());
            Console.WriteLine($"[Hub] Usuario unido al grupo del board {boardId}");
        }

        /// <summary>
        /// Elimina la conexión actual del grupo del tablero especificado.
        /// </summary>
        /// <param name="boardId">Identificador del tablero.</param>
        public async Task LeaveBoardGroup(Guid boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId.ToString());
            Console.WriteLine($"[Hub] Usuario salió del grupo del board {boardId}");
        }

        /// <summary>
        /// Alias para LeaveBoardGroup, usado por el frontend para salir de un grupo de tablero.
        /// </summary>
        /// <param name="boardId">Identificador del tablero.</param>
        public async Task LeaveRoom(Guid boardId)
        {
            await LeaveBoardGroup(boardId);
        }
    }
}
