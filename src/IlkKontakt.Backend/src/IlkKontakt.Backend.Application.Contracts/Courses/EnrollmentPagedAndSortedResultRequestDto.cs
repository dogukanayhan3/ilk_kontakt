using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class EnrollmentPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? CourseId { get; set; }
    public Guid? UserId { get; set; }
} 