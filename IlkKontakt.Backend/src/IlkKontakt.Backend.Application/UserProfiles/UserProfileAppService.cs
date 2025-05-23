using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.UserProfiles
{
    public class UserProfileAppService
        : ApplicationService, IUserProfileAppService
    {
        private readonly IRepository<UserProfile, Guid> _repository;
        private readonly ICurrentUser _currentUser;

        public UserProfileAppService(
            IRepository<UserProfile, Guid> repository,
            ICurrentUser currentUser)
        {
            _repository   = repository;
            _currentUser  = currentUser;
        }

        public async Task<UserProfileDto> GetAsync(Guid id)
        {
            var profile = await _repository.GetAsync(id);
            return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
        }

        public async Task<PagedResultDto<UserProfileDto>> GetListAsync(
            UserProfilePagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            var query = queryable
                .WhereIf(!string.IsNullOrWhiteSpace(input.Email),
                    x => x.Email.Contains(input.Email))
                .WhereIf(!string.IsNullOrWhiteSpace(input.PhoneNumber),
                    x => x.PhoneNumber.Contains(input.PhoneNumber))
                .WhereIf(!string.IsNullOrWhiteSpace(input.Address),
                    x => x.Address.Contains(input.Address))
                .WhereIf(input.UserId.HasValue,
                    x => x.UserId == input.UserId.Value) // filter by UserId if provided
                .OrderBy(string.IsNullOrWhiteSpace(input.Sorting)
                    ? nameof(UserProfile.CreationTime) + " desc"
                    : input.Sorting)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var profiles  = await AsyncExecuter.ToListAsync(query);
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            return new PagedResultDto<UserProfileDto>(
                totalCount,
                ObjectMapper.Map<List<UserProfile>, List<UserProfileDto>>(profiles)
            );
        }


        public async Task<UserProfileDto> CreateAsync(
            CreateUpdateUserProfileDto input)
        {
            if (!_currentUser.IsAuthenticated)
            {
                throw new AbpAuthorizationException("Not logged in.");
            }

            var userId = _currentUser.GetId();

            if (await _repository.AnyAsync(x => x.UserId == userId))
            {
                throw new UserFriendlyException(
                    "A profile already exists for this user.");
            }

            var profile = ObjectMapper
                .Map<CreateUpdateUserProfileDto, UserProfile>(input);

            profile.UserId = userId;

            await _repository.InsertAsync(profile, autoSave: true);

            return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
        }

        public async Task<UserProfileDto> UpdateAsync(
            Guid id,
            CreateUpdateUserProfileDto input)
        {
            if (!_currentUser.IsAuthenticated)
            {
                throw new AbpAuthorizationException("Not logged in.");
            }

            var userId  = _currentUser.GetId();
            var profile = await _repository.GetAsync(id);

            if (profile.UserId != userId)
            {
                throw new UserFriendlyException(
                    "You can only update your own profile.");
            }

            ObjectMapper.Map(input, profile);
            await _repository.UpdateAsync(profile, autoSave: true);

            return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
        }

        public async Task DeleteAsync(Guid id)
        {
            if (!_currentUser.IsAuthenticated)
            {
                throw new AbpAuthorizationException("Not logged in.");
            }

            var profile = await _repository.GetAsync(id);
            var userId  = _currentUser.GetId();

            if (profile.UserId != userId)
            {
                throw new UserFriendlyException(
                    "You can only delete your own profile.");
            }

            await _repository.DeleteAsync(id, autoSave: true);
        }
        
        public async Task<UserProfileDto> GetByUserAsync()
        {
            if (!_currentUser.IsAuthenticated)
                throw new AbpAuthorizationException("Not logged in.");

            var userId = _currentUser.GetId();
            var profile = await _repository.FirstOrDefaultAsync(x => x.UserId == userId);
            if (profile == null)
                throw new EntityNotFoundException(typeof(UserProfile), userId);

            return ObjectMapper.Map<UserProfile, UserProfileDto>(profile);
        }
    }
    
}
