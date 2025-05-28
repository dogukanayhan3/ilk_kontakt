using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Contact;

public class CreateUpdateContactUsDto
{
    [Required]
    [MaxLength(128)]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(64)]
    public string Email { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; }
}

