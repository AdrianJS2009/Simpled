using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Simpled.Data;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Simpled.Helpers
{
    /// <summary>
    /// Middleware que impide el acceso a usuarios baneados globalmente.
    /// Si el usuario está autenticado y baneado, responde 403 Forbidden.
    /// </summary>
    public class UserBanMiddleware
    {
        private readonly RequestDelegate _next;

        public UserBanMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, SimpledDbContext db)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (Guid.TryParse(userIdStr, out var userId))
                {
                    var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
                    if (user != null && user.IsBanned)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsync("Usuario baneado. Acceso denegado.");
                        return;
                    }
                }
            }
            await _next(context);
        }
    }
} 