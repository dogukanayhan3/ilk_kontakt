using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Connections;

public class CreateConnectionDto
{
    [Required]
    public Guid ReceiverId { get; set; }
}
