using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.JobListings;

public class JobListingDto : AuditedEntityDto<Guid>
{
    public string Title { get; set; }

    public string Company { get; set; }

    public string Description { get; set; }

    public JobType Type { get; set; }

    public string Location { get; set; }

    public string ExperienceLevel { get; set; }
}
