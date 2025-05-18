using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles.Project;

public class CreateUpdateProjectDto
{
    public Guid ProfileId { get; set; }
    [Required]
    public String ProjectName { get; set; }
    [Required]
    public String Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public String? ProjectUrl { get; set; }
}