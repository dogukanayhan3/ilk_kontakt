using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp;
using System.Linq.Dynamic.Core;
using IlkKontakt.Backend.Permissions;

namespace IlkKontakt.Backend.UserProfiles;

public class UserProfileAppService : ApplicationService, IUserProfileAppService
{
    private readonly IRepository<UserProfile, Guid> _repository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public UserProfileAppService(
        IRepository<UserProfile, Guid> repository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto> GetAsync(Guid id)
    {
        var profile = await _repository.GetAsync(id);
        return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
    }

    public async Task<PagedResultDto<UserProfileDto>> GetListAsync(UserProfilePagedAndSortedResultRequestDto input)
    {
        var queryable = await _repository.GetQueryableAsync();

        var query = queryable
            .WhereIf(input.UserId.HasValue, x => x.UserId == input.UserId)
            .WhereIf(!string.IsNullOrWhiteSpace(input.Email), x => x.Email.Contains(input.Email))
            .WhereIf(!string.IsNullOrWhiteSpace(input.PhoneNumber), x => x.PhoneNumber.Contains(input.PhoneNumber))
            .WhereIf(!string.IsNullOrWhiteSpace(input.Address), x => x.Address.Contains(input.Address))
            .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? nameof(UserProfile.CreationTime) + " desc" : input.Sorting)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var profiles = await AsyncExecuter.ToListAsync(query);
        var totalCount = await AsyncExecuter.CountAsync(queryable);

        return new PagedResultDto<UserProfileDto>(
            totalCount,
            ObjectMapper.Map<List<UserProfile>, List<UserProfileDto>>(profiles)
        );
    }

    public async Task<UserProfileDto> CreateAsync(CreateUpdateUserProfileDto input)
    {
        // Check if user exists
        var user = await _userRepository.FindAsync(input.UserId);
        if (user == null)
            throw new UserFriendlyException("User not found!");

        // Check if profile already exists for this user
        if (await _repository.AnyAsync(x => x.UserId == input.UserId))
            throw new UserFriendlyException("Profile already exists for this user!");

        var profile = ObjectMapper.Map<CreateUpdateUserProfileDto, UserProfile>(input);
        await _repository.InsertAsync(profile);
        return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
    }

    public async Task<UserProfileDto> UpdateAsync(Guid id, CreateUpdateUserProfileDto input)
    {
        var profile = await _repository.GetAsync(id);

        // Prevent changing UserId
        if (profile.UserId != input.UserId)
            throw new UserFriendlyException("Cannot change UserId of profile!");

        ObjectMapper.Map(input, profile);
        await _repository.UpdateAsync(profile);
        return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}
