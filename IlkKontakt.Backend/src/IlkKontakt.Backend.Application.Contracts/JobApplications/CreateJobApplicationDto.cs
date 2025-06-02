using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.JobApplications;

public class CreateJobApplicationDto
{
    public Guid JobListingId { get; set; }
}