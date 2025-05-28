using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.ContactUss;

public class CreateUpdateContactUsDto
{
    [Required]
    public Guid contact_id { get; set; }

    [Required]
    [MaxLength(128)]
    public string name { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(64)]
    public string email { get; set; }

    [Required]
    [MaxLength(2000)]
    public string message { get; set; }
}

