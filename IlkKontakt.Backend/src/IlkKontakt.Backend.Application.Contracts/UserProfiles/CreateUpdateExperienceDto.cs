using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles;

public class CreateUpdateExperienceDto
{
    [Required]
    public Guid ProfileId { get; set; }

    [Required]
    [StringLength(128)]
    public string Title { get; set; }

    [Required]
    [StringLength(128)]
    public string CompanyName { get; set; }

    [Required]
    [StringLength(128)]
    public string Location { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool IsCurrentPosition { get; set; }

    [Required]
    [StringLength(2000)]
    public string Description { get; set; }

    [Required]
    public EmploymentType EmploymentType { get; set; }
}