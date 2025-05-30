namespace Simpled.Exception
{
    /// <summary>
    /// Excepción lanzada cuando un usuario intenta acceder a un recurso para el que está prohibido (por ejemplo, usuario baneado).
    /// </summary>
    [System.Serializable]
    public class ForbiddenException : System.Exception
    {
        public ForbiddenException() { }

        public ForbiddenException(string message) : base(message) { }

        public ForbiddenException(string message, System.Exception inner) : base(message, inner) { }
    }
}
