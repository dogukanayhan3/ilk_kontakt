using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Connections;

public class UpdateConnectionStatusDto
{
    [Required]
    public ConnectionStatus Status { get; set; }
}
