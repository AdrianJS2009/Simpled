﻿using System.ComponentModel.DataAnnotations;

namespace TaskBoard.api.Models.Dtos.AuthDtos
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}


