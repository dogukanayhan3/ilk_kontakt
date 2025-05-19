using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles;

public class CreateUpdateSkillDto
{
    public Guid ProfileId { get; set; }
    [Required]
    public String SkillName { get; set; }
    [Required]
    public SkillProficiency SkillProficiency { get; set; }
}