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

    [StringLength(2000)]
    public string? Description { get; set; }
    
    public ExperienceLevel ExperienceLevel { get; set; } 
    
    public WorkType WorkType { get; set; }

    [StringLength(256)]
    public string? Location { get; set; }
    
    public string? ExternalUrl { get; set; }
}