using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Courses;

public class CreateUpdateInstructorDto
{
    [Required]
    public Guid UserId { get; set; }
} 