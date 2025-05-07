using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles;

public interface IUserProfileAppService :
    ICrudAppService<
        UserProfileDto,
        Guid,
        UserProfilePagedAndSortedResultRequestDto,
        CreateUpdateUserProfileDto>
{
}