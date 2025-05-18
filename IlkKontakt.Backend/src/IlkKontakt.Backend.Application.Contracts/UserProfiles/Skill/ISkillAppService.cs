using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles.Skill;

public interface ISkillAppService :
    ICrudAppService<
    SkillDto,
    Guid,
    PagedResultRequestDto,
    CreateUpdateSkillDto>
{
    
}