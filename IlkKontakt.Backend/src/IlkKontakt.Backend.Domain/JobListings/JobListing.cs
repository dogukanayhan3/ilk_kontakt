using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.JobListings;

public class JobListing : AuditedAggregateRoot<Guid>
{
    public string Title { get; set; }
    public string Company { get; set; }
    public string Description { get; set; }
    public ExperienceLevel ExperienceLevel { get; set; } 
    public WorkType WorkType { get; set; }
    public string Location { get; set; }
}


