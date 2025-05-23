using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class InstructorPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? UserId { get; set; }
}