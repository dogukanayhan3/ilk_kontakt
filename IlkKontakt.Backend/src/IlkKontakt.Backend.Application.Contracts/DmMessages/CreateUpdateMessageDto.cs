using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Chat;

public class CreateUpdateMessageDto
{
    [Required]
    public Guid ChatSessionId { get; set; }

    [Required]
    public Guid SenderId { get; set; }

    [Required]
    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;
}


