using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.JobApplications;

public class UpdateJobApplicationStatusDto
{
    [Required]
    public JobApplicationStatus Status { get; set; }
}