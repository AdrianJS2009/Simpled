using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Simpled.Dtos.Auth;
using Simpled.Repository;
using System.Security.Claims;

namespace Simpled.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authService;

        public AuthController(IAuthRepository authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Inicia sesión con email y contraseña y devuelve un token JWT.
        /// </summary>
        /// <param name="loginDto">Datos de acceso del usuario</param>
        /// <returns>Token JWT y Id de usuario</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
                return Unauthorized("Credenciales inválidas");

            return Ok(new
            {
                token = result.Token,
                id = result.UserId
            });
        }

        /// <summary>
        /// Inicia el proceso de login externo (challenge) para el proveedor especificado.
        /// </summary>
        /// <param name="provider">Nombre del proveedor (Google o GitHub)</param>
        /// <returns>Redirección al proveedor OAuth</returns>
        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLogin([FromRoute] string provider)
        {

            var redirectUrl = Url.Action(
                nameof(ExternalLoginCallback),
                "Auth",
                new { provider },
                Request.Scheme);

            var props = new AuthenticationProperties
            {
                RedirectUri = redirectUrl
            };

            return Challenge(props, provider);
        }

        /// <summary>
        /// Procesa la respuesta del proveedor externo y genera un JWT propio.
        /// </summary>
        /// <param name="provider">Nombre del proveedor</param>
        /// <returns>Token JWT y Id de usuario</returns>
        [HttpGet("external-login-callback")]
        public async Task<IActionResult> ExternalLoginCallback([FromQuery] string provider)
        {

            var authResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!authResult.Succeeded || authResult.Principal == null)
                return BadRequest("Error en la autenticación externa");


            var email = authResult.Principal.FindFirstValue(ClaimTypes.Email)!;
            var name = authResult.Principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
            var key = authResult.Principal.FindFirstValue(ClaimTypes.NameIdentifier)!;


            var dto = new ExternalLoginDto
            {
                Provider = provider,
                ProviderKey = key,
                Email = email,
                Name = name
            };
            var loginResult = await _authService.ExternalLoginAsync(dto);


            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (loginResult == null)
                return BadRequest("No se pudo autenticar con el proveedor externo");

            var frontendUrl = Environment.GetEnvironmentVariable("URL_FRONTEND");

            if (string.IsNullOrEmpty(frontendUrl))
                return StatusCode(500, "URL del frontend no está configurada");

            var redirectUrl = $"{frontendUrl}/autenticacion-completada?token={loginResult.Token}&id={loginResult.UserId}";

            return Redirect(redirectUrl);
        }
    }
}
