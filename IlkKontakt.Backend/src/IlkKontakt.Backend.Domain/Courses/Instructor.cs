using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Courses;

public class Instructor : AuditedAggregateRoot<Guid>
{
    public Guid UserId { get; set; }
    public Guid InstructorUserProfileId { get; set; }
}