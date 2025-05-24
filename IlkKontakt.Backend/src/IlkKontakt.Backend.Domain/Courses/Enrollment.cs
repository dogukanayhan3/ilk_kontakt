using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Courses;

public class Enrollment : AuditedAggregateRoot<Guid>
{
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
    public DateTime EnrollmentDate { get; set; }
}