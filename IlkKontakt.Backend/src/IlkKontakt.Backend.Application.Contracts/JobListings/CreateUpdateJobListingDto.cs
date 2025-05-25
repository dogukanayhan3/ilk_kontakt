using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.JobListings;

public class CreateUpdateJobListingDto
{
    [Required]
    [StringLength(128)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(128)]
    public string Company { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    public JobType Type { get; set; } = JobType.Undefined;

    [StringLength(256)]
    public string Location { get; set; } = string.Empty;

    [StringLength(64)]
    public string ExperienceLevel { get; set; } = string.Empty;
}