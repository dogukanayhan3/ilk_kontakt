using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.JobApplications;

public class JobApplicationDto : EntityDto<Guid>
{
    public Guid JobListingId { get; set; }
    public Guid ApplicantId { get; set; }
    public JobApplicationStatus Status { get; set; }
}