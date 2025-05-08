using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using System.Linq.Dynamic.Core;
using IlkKontakt.Backend.Permissions;
using IlkKontakt.Backend.UserProfiles;

namespace IlkKontakt.Backend.UserProfiles
{
    public class ExperienceAppService : ApplicationService, IExperienceAppService
    {
        private readonly IRepository<Experience, Guid> _repository;
        private readonly IRepository<UserProfile, Guid> _profileRepository;

        public ExperienceAppService(
            IRepository<Experience, Guid> repository,
            IRepository<UserProfile, Guid> profileRepository)
        {
            _repository = repository;
            _profileRepository = profileRepository;
        }

        public async Task<ExperienceDto> GetAsync(Guid id)
        {
            var experience = await _repository.GetAsync(id);
            return ObjectMapper.Map<Experience, ExperienceDto>(experience);
        }

        public async Task<PagedResultDto<ExperienceDto>> GetListAsync(
            ExperiencePagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            var query = queryable
                .WhereIf(input.ProfileId.HasValue, x => x.ProfileId == input.ProfileId)
                .WhereIf(
                    !string.IsNullOrWhiteSpace(input.Title),
                    x => x.Title.Contains(input.Title)
                )
                .WhereIf(
                    !string.IsNullOrWhiteSpace(input.CompanyName),
                    x => x.CompanyName.Contains(input.CompanyName)
                )
                .WhereIf(
                    input.EmploymentType.HasValue,
                    x => x.EmploymentType == input.EmploymentType.Value
                );

            var totalCount = await AsyncExecuter.CountAsync(query);

            query = query
                .OrderBy(input.Sorting ?? $"{nameof(Experience.StartDate)} desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var experiences = await AsyncExecuter.ToListAsync(query);

            return new PagedResultDto<ExperienceDto>(
                totalCount,
                ObjectMapper.Map<List<Experience>, List<ExperienceDto>>(experiences)
            );
        }

        public async Task<PagedResultDto<ExperienceDto>> GetListByProfileAsync(Guid profileId)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .Where(x => x.ProfileId == profileId)
                .OrderByDescending(x => x.StartDate);

            var experiences = await AsyncExecuter.ToListAsync(query);
            var totalCount = experiences.Count;

            return new PagedResultDto<ExperienceDto>(
                totalCount,
                ObjectMapper.Map<List<Experience>, List<ExperienceDto>>(experiences)
            );
        }

        public async Task<ExperienceDto> CreateAsync(CreateUpdateExperienceDto input)
        {
            await ValidateExperienceAsync(input);

            var experience = ObjectMapper.Map<CreateUpdateExperienceDto, Experience>(input);

            if (input.IsCurrentPosition)
            {
                experience.EndDate = null;
            }

            await _repository.InsertAsync(experience);
            return ObjectMapper.Map<Experience, ExperienceDto>(experience);
        }

        public async Task<ExperienceDto> UpdateAsync(Guid id, CreateUpdateExperienceDto input)
        {
            await ValidateExperienceAsync(input);

            var experience = await _repository.GetAsync(id);

            if (experience.ProfileId != input.ProfileId)
            {
                throw new UserFriendlyException("Cannot change ProfileId of experience!");
            }

            ObjectMapper.Map(input, experience);

            if (input.IsCurrentPosition)
            {
                experience.EndDate = null;
            }

            await _repository.UpdateAsync(experience);
            return ObjectMapper.Map<Experience, ExperienceDto>(experience);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        private async Task ValidateExperienceAsync(CreateUpdateExperienceDto input)
        {
            // Check if profile exists
            if (!await _profileRepository.AnyAsync(x => x.Id == input.ProfileId))
            {
                throw new UserFriendlyException("Profile not found!");
            }

            // Validate dates
            if (input.StartDate > DateTime.Now)
            {
                throw new UserFriendlyException("Start date cannot be in the future!");
            }

            if (input.EndDate.HasValue && input.EndDate.Value < input.StartDate)
            {
                throw new UserFriendlyException("End date cannot be earlier than start date!");
            }

            if (input.IsCurrentPosition && input.EndDate.HasValue)
            {
                throw new UserFriendlyException(
                    "End date should be empty for current position!"
                );
            }
        }
    }
}
