using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Simpled.Dtos.Users;
using Simpled.Repository;

namespace Simpled.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userService;

        public UsersController(IUserRepository userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Obtiene todos los usuarios registrados.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un usuario específico por su GUID.
        /// </summary>
        /// <param name="id">ID del usuario</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user == null ? NotFound("User not found.") : Ok(user);
        }

        /// <summary>
        /// Registra un nuevo usuario.
        /// </summary>
        /// <param name="dto">Datos del usuario</param>
        /// <param name="image">Foto del usuario</param>
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] UserRegisterDto dto, IFormFile ?image)
        {
            var createdUser = await _userService.RegisterAsync(dto, image);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
        }

        /// <summary>
        /// Actualiza la información de un usuario existente.
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="dto">Datos del usuario</param>
        /// <param name="image">Foto del usuario</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromForm] UserUpdateDto dto, IFormFile? image)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var success = await _userService.UpdateAsync(dto, image);
            return success ? NoContent() : NotFound("User not found.");
        }

        /// <summary>
        /// Elimina un usuario de la base de datos.
        /// </summary>
        /// <param name="id">ID del usuario</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var success = await _userService.DeleteAsync(id);
            return success ? NoContent() : NotFound("User not found.");
        }
    }
}



