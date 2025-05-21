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
    public class SkillAppService : ApplicationService, ISkillAppService
    {
        private readonly IRepository<Skill, Guid> _repository;
        private readonly IRepository<UserProfile, Guid> _profileRepository;

        public SkillAppService(
            IRepository<Skill, Guid> repository,
            IRepository<UserProfile, Guid> profileRepository)
        {
            _repository = repository;
            _profileRepository = profileRepository;
        }

        public async Task<SkillDto> GetAsync(Guid id)
        {
            var entity = await _repository.GetAsync(id);
            return ObjectMapper.Map<Skill, SkillDto>(entity);
        }

        public async Task<PagedResultDto<SkillDto>> GetListAsync(
            SkillPagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            var query = queryable
                .WhereIf(input.ProfileId.HasValue,
                    x => x.ProfileId == input.ProfileId.Value)
                .WhereIf(!string.IsNullOrWhiteSpace(input.SkillName),
                    x => x.SkillName.Contains(input.SkillName))
                .WhereIf(input.SkillProficiency.HasValue,
                    x => x.SkillProficiency == input.SkillProficiency.Value);

            var totalCount = await AsyncExecuter.CountAsync(query);

            query = query
                .OrderBy(input.Sorting ?? $"{nameof(Skill.SkillName)} asc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var list = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<Skill>, List<SkillDto>>(list);

            return new PagedResultDto<SkillDto>(totalCount, dtos);
        }

        public async Task<PagedResultDto<SkillDto>> GetListByProfileAsync(
            Guid profileId)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .Where(x => x.ProfileId == profileId)
                .OrderBy($"{nameof(Skill.SkillName)} asc");

            var list = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<Skill>, List<SkillDto>>(list);

            return new PagedResultDto<SkillDto>(list.Count, dtos);
        }

        public async Task<SkillDto> CreateAsync(CreateUpdateSkillDto input)
        {
            await ValidateSkillAsync(input);
            var entity = ObjectMapper.Map<CreateUpdateSkillDto, Skill>(input);
            await _repository.InsertAsync(entity, autoSave: true);
            return ObjectMapper.Map<Skill, SkillDto>(entity);
        }

        public async Task<SkillDto> UpdateAsync(
            Guid id,
            CreateUpdateSkillDto input)
        {
            await ValidateSkillAsync(input);
            var entity = await _repository.GetAsync(id);
            if (entity.ProfileId != input.ProfileId)
            {
                throw new UserFriendlyException(
                    "Cannot change ProfileId of a skill record!");
            }
            ObjectMapper.Map(input, entity);
            await _repository.UpdateAsync(entity, autoSave: true);
            return ObjectMapper.Map<Skill, SkillDto>(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id, autoSave: true);
        }

        private async Task ValidateSkillAsync(CreateUpdateSkillDto input)
        {
            if (!await _profileRepository.AnyAsync(x => x.Id == input.ProfileId))
            {
                throw new UserFriendlyException("Profile not found!");
            }
            if (string.IsNullOrWhiteSpace(input.SkillName))
            {
                throw new UserFriendlyException("SkillName cannot be empty!");
            }
            // Proficiency is an enum with [Required], no further checks
        }
    }
}
