using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class CourseDto : AuditedEntityDto<Guid>
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string ThumbnailUrl { get; set; }
    public Guid InstructorId { get; set; }
    public bool IsPublished { get; set; }
    public string InstructorName { get; set; }
    public string InstructorSurname { get; set; }
    public string InstructorFullName { get; set; }
}