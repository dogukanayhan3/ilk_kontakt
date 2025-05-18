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
    public class LanguageAppService : ApplicationService, ILanguageAppService
    {
        private readonly IRepository<Language, Guid> _repository;
        private readonly IRepository<UserProfile, Guid> _profileRepository;

        public LanguageAppService(
            IRepository<Language, Guid> repository,
            IRepository<UserProfile, Guid> profileRepository)
        {
            _repository = repository;
            _profileRepository = profileRepository;
        }

        public async Task<LanguageDto> GetAsync(Guid id)
        {
            var entity = await _repository.GetAsync(id);
            return ObjectMapper.Map<Language, LanguageDto>(entity);
        }

        public async Task<PagedResultDto<LanguageDto>> GetListAsync(
            PagedResultRequestDto input)
        {
            var query = await _repository.GetQueryableAsync();
            var total = await AsyncExecuter.CountAsync(query);
            var list = await AsyncExecuter.ToListAsync(
                query
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );
            var dtos = ObjectMapper.Map<List<Language>, List<LanguageDto>>(list);
            return new PagedResultDto<LanguageDto>(total, dtos);
        }

        public async Task<PagedResultDto<LanguageDto>> GetListByProfileAsync(
            Guid profileId)
        {
            var query = (await _repository.GetQueryableAsync())
                .Where(x => x.ProfileId == profileId)
                .OrderBy(x => x.LanguageName);
            var list = await AsyncExecuter.ToListAsync(query);
            var dtos = ObjectMapper.Map<List<Language>, List<LanguageDto>>(list);
            return new PagedResultDto<LanguageDto>(list.Count, dtos);
        }

        public async Task<LanguageDto> CreateAsync(CreateUpdateLanguageDto input)
        {
            await ValidateLanguageAsync(input);
            var entity = ObjectMapper.Map<CreateUpdateLanguageDto, Language>(input);
            await _repository.InsertAsync(entity, autoSave: true);
            return ObjectMapper.Map<Language, LanguageDto>(entity);
        }

        public async Task<LanguageDto> UpdateAsync(
            Guid id,
            CreateUpdateLanguageDto input)
        {
            await ValidateLanguageAsync(input);
            var entity = await _repository.GetAsync(id);
            if (entity.ProfileId != input.ProfileId)
            {
                throw new UserFriendlyException(
                    "Cannot change ProfileId of a language record!");
            }
            ObjectMapper.Map(input, entity);
            await _repository.UpdateAsync(entity, autoSave: true);
            return ObjectMapper.Map<Language, LanguageDto>(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id, autoSave: true);
        }

        private async Task ValidateLanguageAsync(CreateUpdateLanguageDto input)
        {
            if (!await _profileRepository.AnyAsync(x => x.Id == input.ProfileId))
            {
                throw new UserFriendlyException("Profile not found!");
            }
            if (string.IsNullOrWhiteSpace(input.LanguageName))
            {
                throw new UserFriendlyException("LanguageName cannot be empty!");
            }
            // Proficiency is an enum with [Required], no further checks
        }
    }
}
