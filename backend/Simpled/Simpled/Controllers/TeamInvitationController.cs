using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Simpled.Dtos.TeamInvitations;
using Simpled.Hubs;
using Simpled.Repository;
using Simpled.Services;

namespace Simpled.Controllers
{
    /// <summary>
    /// Controlador para gestionar invitaciones a equipos.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TeamInvitationsController : ControllerBase
    {
        private readonly ITeamInvitationRepository _invService;
        private readonly ITeamRepository _teamRepo;
        private readonly IHubContext<BoardHub> _hub;
        private readonly SseInvitationBroadcastService _sseBroadcast;

        public TeamInvitationsController(
            ITeamInvitationRepository invService,
            ITeamRepository teamRepo,
            IHubContext<BoardHub> hub,
            SseInvitationBroadcastService sseBroadcast)
        {
            _invService = invService;
            _teamRepo = teamRepo;
            _hub = hub;
            _sseBroadcast = sseBroadcast;
        }

        private Guid CurrentUserId =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Lista las invitaciones pendientes del usuario actual.
        /// </summary>
        [HttpGet("user")]
        public async Task<IActionResult> GetUserInvitations()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
                return Unauthorized("No se pudo leer el correo.");

            var list = await _invService.GetAllByEmailAsync(email.ToLower());
            return Ok(list);
        }

        /// <summary>
        /// Crea una nueva invitación a un equipo (solo owner).
        /// NOTA: No añade inmediatamente al equipo, deja al usuario aceptar o rechazar.
        /// </summary>
        /// <param name="dto">Datos de la invitación</param>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TeamInvitationCreateDto dto)
        {
            var team = await _teamRepo.GetByIdAsync(dto.TeamId);
            if (team == null) return NotFound("Equipo no encontrado.");
            if (team.OwnerId != CurrentUserId)
                return Forbid("Solo el owner puede invitar.");

            var inv = await _invService.CreateAsync(dto);

            await _hub.Clients.User(dto.Email.ToLower()).SendAsync("TeamInvitationReceived", new
            {
                teamName = team.Name,
                role = "viewer",
                invitationToken = inv.Token
            });

            // Notificación SSE
            var invitationDto = new Simpled.Dtos.TeamInvitations.TeamInvitationReadDto
            {
                Id = inv.Id,
                TeamId = inv.TeamId,
                TeamName = team.Name,
                Token = inv.Token,
                Accepted = inv.Accepted,
                CreatedAt = inv.CreatedAt
            };
            await _sseBroadcast.BroadcastInvitationAsync(dto.Email.ToLower(), invitationDto, "team");

            return Ok("Invitación enviada.");
        }

        /// <summary>
        /// Acepta una invitación (añade al usuario al equipo).
        /// </summary>
        /// <param name="dto">Datos de la invitación a aceptar</param>
        [HttpPost("accept")]
        public async Task<IActionResult> Accept([FromBody] TeamInvitationAcceptDto dto)
        {
            var success = await _invService.AcceptAsync(dto.Token, CurrentUserId);
            return success
                ? Ok("Invitación aceptada.")
                : BadRequest("No se pudo aceptar la invitación.");
        }

        /// <summary>
        /// Rechaza una invitación.
        /// </summary>
        /// <param name="dto">Datos de la invitación a rechazar</param>
        [HttpPost("reject")]
        public async Task<IActionResult> Reject([FromBody] TeamInvitationAcceptDto dto)
        {
            var success = await _invService.RejectAsync(dto.Token);
            return success
                ? Ok("Invitación rechazada.")
                : NotFound("Invitación no encontrada.");
        }
    }
}
