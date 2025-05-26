using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.JobListings;

public class JobListing : AuditedEntity<Guid>
{
    public string Title { get; set; }
    public string Company { get; set; }
    public string Description { get; set; }

    public JobType Type { get; set; } 

    public string Location { get; set; }
    public string ExperienceLevel { get; set; }
}


