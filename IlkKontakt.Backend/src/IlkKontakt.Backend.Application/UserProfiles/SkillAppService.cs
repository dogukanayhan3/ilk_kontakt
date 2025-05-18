using System;
using System.Collections.Generic;
using System.Linq;
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
            PagedResultRequestDto input)
        {
            var query = await _repository.GetQueryableAsync();
            var total = await AsyncExecuter.CountAsync(query);
            var list = await AsyncExecuter.ToListAsync(
                query
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );
            var dtos = ObjectMapper.Map<List<Skill>, List<SkillDto>>(list);
            return new PagedResultDto<SkillDto>(total, dtos);
        }

        public async Task<PagedResultDto<SkillDto>> GetListByProfileAsync(
            Guid profileId)
        {
            var query = (await _repository.GetQueryableAsync())
                .Where(x => x.ProfileId == profileId)
                .OrderBy(x => x.SkillName);
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
