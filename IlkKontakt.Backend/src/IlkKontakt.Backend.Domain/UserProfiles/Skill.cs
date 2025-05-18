using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.UserProfiles;

public class Skill : AuditedEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public String SkillName { get; set; }
    public SkillProficiency SkillProficiency { get; set; }
}