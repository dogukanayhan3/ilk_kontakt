using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Courses;

public class Course : AuditedAggregateRoot<Guid>
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string ThumbnailUrl { get; set; }
    public Guid InstructorId { get; set; }   
    public bool IsPublished { get; set; }
}