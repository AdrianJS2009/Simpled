
using Simpled.Dtos.Users;

namespace Simpled.Repository
{
    /// <summary>
    /// Define las operaciones de lectura y escritura sobre los usuarios.
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Obtiene todos los usuarios registrados.
        /// </summary>
        /// <returns>Secuencia de DTOs con la información de cada usuario.</returns>
        Task<IEnumerable<UserReadDto>> GetAllUsersAsync();

        /// <summary>
        /// Obtiene un usuario por su identificador.
        /// </summary>
        /// <param name="id">Identificador único del usuario.</param>
        /// <returns>DTO con los datos del usuario, o <c>null</c> si no existe.</returns>
        Task<UserReadDto?> GetUserByIdAsync(Guid id);

        /// <summary>
        /// Registra un nuevo usuario en el sistema.
        /// </summary>
        /// <param name="userDto">DTO con los datos de registro del usuario.</param>
        /// <param name="image">Archivo opcional de imagen de perfil.</param>
        /// <returns>DTO con los datos del usuario creado.</returns>
        Task<UserReadDto> RegisterAsync(UserRegisterDto userDto, IFormFile? image);

        /// <summary>
        /// Actualiza los datos de un usuario existente.
        /// </summary>
        /// <param name="userDto">DTO con los nuevos datos del usuario.</param>
        /// <param name="image">Archivo opcional de nueva imagen de perfil.</param>
        /// <returns><c>true</c> si la actualización fue exitosa; en caso contrario, <c>false</c>.</returns>
        Task<bool> UpdateAsync(UserUpdateDto userDto, IFormFile? image);

        /// <summary>
        /// Elimina un usuario por su identificador.
        /// </summary>
        /// <param name="id">Identificador del usuario a eliminar.</param>
        /// <returns><c>true</c> si la eliminación fue exitosa; en caso contrario, <c>false</c>.</returns>
        Task<bool> DeleteAsync(Guid id);
    }
}
