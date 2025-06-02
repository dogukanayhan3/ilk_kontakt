using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Chat;

public class CreateUpdateChatSessionDto
{
    [Required]
    public Guid User1Id { get; set; }

    [Required]
    public Guid User2Id { get; set; }

    [Required]
    public DateTime StartedAt { get; set; } = DateTime.Now;
}

