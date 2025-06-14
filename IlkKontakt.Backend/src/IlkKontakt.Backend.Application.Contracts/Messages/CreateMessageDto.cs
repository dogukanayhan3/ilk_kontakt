using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Messages;

public class CreateMessageDto
{
    [Required]
    public Guid ConnectionId { get; set; }

    [Required]
    [StringLength(2000)]
    public string Text { get; set; }
}
