using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.Courses;

public class CreateUpdateEnrollmentDto
{
    [Required]
    public Guid CourseId { get; set; }

    [Required]
    public Guid UserId { get; set; }
}