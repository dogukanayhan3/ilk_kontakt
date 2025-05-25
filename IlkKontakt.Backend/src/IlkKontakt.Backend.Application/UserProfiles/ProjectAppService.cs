using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace IlkKontakt.Backend.UserProfiles
{
    public class ProjectAppService : ApplicationService, IProjectAppService
    {
        private readonly IRepository<Project, Guid> _repository;
        private readonly IRepository<UserProfile, Guid> _profileRepository;

        public ProjectAppService(
            IRepository<Project, Guid> repository,
            IRepository<UserProfile, Guid> profileRepository)
        {
            _repository = repository;
            _profileRepository = profileRepository;
        }

        public async Task<ProjectDto> GetAsync(Guid id)
        {
            var project = await _repository.GetAsync(id);
            return ObjectMapper.Map<Project, ProjectDto>(project);
        }

        public async Task<PagedResultDto<ProjectDto>> GetListAsync(
            ProjectPagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            var query = queryable
                .WhereIf(input.ProfileId.HasValue,
                    x => x.ProfileId == input.ProfileId.Value)
                .WhereIf(!string.IsNullOrWhiteSpace(input.ProjectName),
                    x => x.ProjectName.Contains(input.ProjectName))
                .WhereIf(input.EarliestStartDate.HasValue,
                    x => x.StartDate >= input.EarliestStartDate.Value)
                .WhereIf(input.LatestStartDate.HasValue,
                    x => x.StartDate <= input.LatestStartDate.Value)
                .WhereIf(input.EarliestEndDate.HasValue,
                    x => x.EndDate >= input.EarliestEndDate.Value)
                .WhereIf(input.LatestEndDate.HasValue,
                    x => x.EndDate <= input.LatestEndDate.Value);

            var totalCount = await AsyncExecuter.CountAsync(query);

            query = query
                .OrderBy(input.Sorting ?? $"{nameof(Project.StartDate)} desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var list = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<Project>, List<ProjectDto>>(list);

            return new PagedResultDto<ProjectDto>(totalCount, dtos);
        }

        public async Task<PagedResultDto<ProjectDto>> GetListByProfileAsync(
            Guid profileId)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .Where(x => x.ProfileId == profileId)
                .OrderBy($"{nameof(Project.StartDate)} desc");

            var list = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<Project>, List<ProjectDto>>(list);

            return new PagedResultDto<ProjectDto>(list.Count, dtos);
        }

        public async Task<ProjectDto> CreateAsync(CreateUpdateProjectDto input)
        {
            await ValidateProjectAsync(input);

            var project = ObjectMapper.Map<CreateUpdateProjectDto, Project>(input);
            await _repository.InsertAsync(project, autoSave: true);

            return ObjectMapper.Map<Project, ProjectDto>(project);
        }

        public async Task<ProjectDto> UpdateAsync(Guid id, CreateUpdateProjectDto input)
        {
            await ValidateProjectAsync(input);

            var project = await _repository.GetAsync(id);

            if (project.ProfileId != input.ProfileId)
            {
                throw new UserFriendlyException(
                    "Cannot change ProfileId of a project!");
            }

            ObjectMapper.Map(input, project);
            await _repository.UpdateAsync(project, autoSave: true);

            return ObjectMapper.Map<Project, ProjectDto>(project);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id, autoSave: true);
        }

        private async Task ValidateProjectAsync(CreateUpdateProjectDto input)
        {
            // 1) Profile must exist
            if (!await _profileRepository.AnyAsync(
                x => x.Id == input.ProfileId))
            {
                throw new UserFriendlyException("Profile not found!");
            }

            // 2) Required fields
            if (string.IsNullOrWhiteSpace(input.ProjectName))
            {
                throw new UserFriendlyException(
                    "ProjectName cannot be empty!");
            }

            if (string.IsNullOrWhiteSpace(input.Description))
            {
                throw new UserFriendlyException(
                    "Description cannot be empty!");
            }

            // 3) Date rules
            if (input.StartDate.HasValue &&
                input.StartDate.Value > DateTime.Now)
            {
                throw new UserFriendlyException(
                    "StartDate cannot be in the future!");
            }

            if (input.EndDate.HasValue &&
                input.StartDate.HasValue &&
                input.EndDate.Value < input.StartDate.Value)
            {
                throw new UserFriendlyException(
                    "EndDate cannot be earlier than StartDate!");
            }

            // 4) URL format (optional)
            if (!string.IsNullOrWhiteSpace(input.ProjectUrl) &&
                !Uri.IsWellFormedUriString(
                    input.ProjectUrl, UriKind.Absolute))
            {
                throw new UserFriendlyException(
                    "ProjectUrl is not a valid absolute URL!");
            }
        }
    }
}
