using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles
{
    public interface IExperienceAppService :
        ICrudAppService<
            ExperienceDto,
            Guid,
            ExperiencePagedAndSortedResultRequestDto,
            CreateUpdateExperienceDto>
    {
        Task<PagedResultDto<ExperienceDto>> GetListByProfileAsync(Guid profileId);
    }
}