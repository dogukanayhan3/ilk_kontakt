using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class SkillDto : AuditedEntityDto<Guid>
{
    public Guid ProfileId { get; set; }
    public String SkillName { get; set; }
    public SkillProficiency SkillProficiency { get; set; }
}