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

namespace IlkKontakt.Backend.UserProfiles
{
    public class EducationAppService : ApplicationService, IEducationAppService
    {
        private readonly IRepository<Education, Guid> _repository;
        private readonly IRepository<UserProfile, Guid> _profileRepository;

        public EducationAppService(
            IRepository<Education, Guid> repository,
            IRepository<UserProfile, Guid> profileRepository)
        {
            _repository = repository;
            _profileRepository = profileRepository;
        }

        public async Task<EducationDto> GetAsync(Guid id)
        {
            var education = await _repository.GetAsync(id);
            return ObjectMapper.Map<Education, EducationDto>(education);
        }

        public async Task<PagedResultDto<EducationDto>> GetListAsync(
            EducationPagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            var query = queryable
                .WhereIf(input.ProfileId.HasValue, x => x.ProfileId == input.ProfileId)
                .WhereIf(
                    !string.IsNullOrWhiteSpace(input.InstutionName),
                    x => x.InstutionName.Contains(input.InstutionName)
                )
                .WhereIf(
                    input.Degree.HasValue,
                    x => x.Degree == input.Degree.Value
                )
                .WhereIf(
                    input.EarliestStartDate.HasValue,
                    x => x.StartDate >= input.EarliestStartDate.Value
                )
                .WhereIf(
                    input.LatestStartDate.HasValue,
                    x => x.StartDate <= input.LatestStartDate.Value
                )
                .WhereIf(
                    input.EarliestEndDate.HasValue,
                    x => x.EndDate >= input.EarliestEndDate.Value
                )
                .WhereIf(
                    input.LatestEndDate.HasValue,
                    x => x.EndDate <= input.LatestEndDate.Value
                )
                .WhereIf(
                    input.MinimumGPA.HasValue,
                    x => x.GPA >= input.MinimumGPA.Value
                )
                .WhereIf(
                    input.MaximumGPA.HasValue,
                    x => x.GPA <= input.MaximumGPA.Value
                );

            var totalCount = await AsyncExecuter.CountAsync(query);

            query = query
                .OrderBy(input.Sorting ?? $"{nameof(Education.StartDate)} desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var educations = await AsyncExecuter.ToListAsync(query);

            return new PagedResultDto<EducationDto>(
                totalCount,
                ObjectMapper.Map<List<Education>, List<EducationDto>>(educations)
            );
        }

        public async Task<PagedResultDto<EducationDto>> GetListByProfileAsync(Guid profileId)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .Where(x => x.ProfileId == profileId)
                .OrderByDescending(x => x.StartDate);

            var educations = await AsyncExecuter.ToListAsync(query);
            var totalCount = educations.Count;

            return new PagedResultDto<EducationDto>(
                totalCount,
                ObjectMapper.Map<List<Education>, List<EducationDto>>(educations)
            );
        }

        public async Task<EducationDto> CreateAsync(CreateUpdateEducationDto input)
        {
            await ValidateEducationAsync(input);

            var education = ObjectMapper.Map<CreateUpdateEducationDto, Education>(input);
            await _repository.InsertAsync(education);
            
            return ObjectMapper.Map<Education, EducationDto>(education);
        }

        public async Task<EducationDto> UpdateAsync(Guid id, CreateUpdateEducationDto input)
        {
            await ValidateEducationAsync(input);

            var education = await _repository.GetAsync(id);

            if (education.ProfileId != input.ProfileId)
            {
                throw new UserFriendlyException("Cannot change ProfileId of education!");
            }

            ObjectMapper.Map(input, education);
            await _repository.UpdateAsync(education);
            
            return ObjectMapper.Map<Education, EducationDto>(education);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        private async Task ValidateEducationAsync(CreateUpdateEducationDto input)
        {
            // Check if profile exists
            if (!await _profileRepository.AnyAsync(x => x.Id == input.ProfileId))
            {
                throw new UserFriendlyException("Profile not found!");
            }

            // Validate Institution Name
            if (string.IsNullOrWhiteSpace(input.InstutionName))
            {
                throw new UserFriendlyException("Institution name cannot be empty!");
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

            // Validate GPA
            if (input.GPA.HasValue && (input.GPA.Value < 0 || input.GPA.Value > 4.0))
            {
                throw new UserFriendlyException("GPA must be between 0 and 4.0!");
            }
        }
    }
}
