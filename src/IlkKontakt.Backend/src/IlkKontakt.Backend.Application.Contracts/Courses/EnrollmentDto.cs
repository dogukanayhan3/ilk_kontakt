using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class EnrollmentDto : AuditedEntityDto<Guid>
{
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
    public DateTime EnrollmentDate { get; set; }
} 