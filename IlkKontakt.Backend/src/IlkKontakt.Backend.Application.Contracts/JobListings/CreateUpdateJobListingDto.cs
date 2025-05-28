using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.JobListings;

public class CreateUpdateJobListingDto
{
    [Required]
    [StringLength(128)]
    public string Title { get; set; }

    [Required]
    [StringLength(128)]
    public string Company { get; set; }

    [StringLength(1000)]
    public string Description { get; set; }

    public JobType Type { get; set; }

    [StringLength(256)]
    public string Location { get; set; }

    [StringLength(64)]
    public string ExperienceLevel { get; set; }
}