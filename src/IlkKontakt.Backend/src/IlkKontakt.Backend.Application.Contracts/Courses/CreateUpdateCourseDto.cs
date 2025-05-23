using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Courses;

public class CreateUpdateCourseDto
{
    [Required]
    [StringLength(128)]
    public string Title { get; set; }

    [StringLength(2048)]
    public string Description { get; set; }

    [StringLength(512)]
    public string ThumbnailUrl { get; set; }

    public bool IsPublished { get; set; }
} 