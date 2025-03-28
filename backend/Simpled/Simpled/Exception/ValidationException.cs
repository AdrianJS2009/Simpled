﻿namespace Simpled.Exception
{
    public class ValidationException : ApiException
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationException(IDictionary<string, string[]> errors)
            : base("Validation failed.", 400)
        {
            Errors = errors;
        }
    }
}
