using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class CoursePagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? InstructorId { get; set; }
    public string? Title { get; set; }
    public bool? IsPublished { get; set; }
}