using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Connections;

public class UpdateConnectionDto
{
    [Required]
    public ConnectionStatus Status { get; set; }
}
