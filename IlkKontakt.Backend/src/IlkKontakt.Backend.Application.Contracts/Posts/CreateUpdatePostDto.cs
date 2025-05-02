using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Posts;

public class CreateUpdatePostDto
{
    [Required]
    public string Content { get; set; }
}