using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.JobApplications;

public class JobApplication : AuditedAggregateRoot<Guid>
{
    public Guid JobListingId { get; set; }
    public Guid ApplicantId { get; set; }
    public JobApplicationStatus Status { get; set; }

    public JobApplication(Guid jobListingId, Guid applicantId)
    {
        JobListingId = jobListingId;
        ApplicantId = applicantId;
        Status = JobApplicationStatus.Pending;
    }
}
