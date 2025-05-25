using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles;

public interface ISkillAppService :
    ICrudAppService<
    SkillDto,
    Guid,
    SkillPagedAndSortedResultRequestDto,
    CreateUpdateSkillDto>
{
    
}