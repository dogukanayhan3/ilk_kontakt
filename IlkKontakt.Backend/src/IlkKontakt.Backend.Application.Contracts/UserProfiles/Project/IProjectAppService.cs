using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles.Project;

public interface IProjectAppService :
    ICrudAppService<
    ProjectDto,
    Guid,
    PagedResultRequestDto,
    CreateUpdateProjectDto>
{
    
}