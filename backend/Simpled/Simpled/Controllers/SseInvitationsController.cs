using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Simpled.Services;
using System.Security.Claims;
using System.Text;
using System.Threading.Channels;

namespace Simpled.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/sse/invitations")]
    public class SseInvitationsController : ControllerBase
    {
        private readonly SseInvitationBroadcastService _broadcastService;
        public SseInvitationsController(SseInvitationBroadcastService broadcastService)
        {
            _broadcastService = broadcastService;
        }

        [HttpGet]
        public async Task Get([FromQuery(Name = "access_token")] string? accessToken = null)
        {
            Response.Headers["Content-Type"] = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["Connection"] = "keep-alive";
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
            {
                Response.StatusCode = 401;
                await Response.Body.FlushAsync();
                return;
            }
            var channel = Channel.CreateUnbounded<(string, string)>();
            _broadcastService.Register(email, channel.Writer);
            try
            {
                await foreach (var (eventName, message) in channel.Reader.ReadAllAsync(HttpContext.RequestAborted))
                {
                    var eventLine = $"event: {eventName}\n";
                    var dataLine = $"data: {message}\n\n";
                    var bytes = Encoding.UTF8.GetBytes(eventLine + dataLine);
                    await Response.Body.WriteAsync(bytes, 0, bytes.Length);
                    await Response.Body.FlushAsync();
                }
            }
            catch (OperationCanceledException) { /* No hacer nada, es esperado al cancelar la petición SSE */ }
            finally
            {
                _broadcastService.Unregister(email, channel.Writer);
            }
        }
    }
} 