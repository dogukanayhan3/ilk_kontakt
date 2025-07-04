using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using System.Linq.Dynamic.Core;

namespace IlkKontakt.Backend.JobListings
{
    public class JobListingAppService : ApplicationService, IJobListingAppService
    {
        private readonly IRepository<JobListing, Guid> _repository;

        public JobListingAppService(IRepository<JobListing, Guid> repository)
        {
            _repository = repository;
        }

        public async Task<JobListingDto> GetAsync(Guid id)
        {
            var jobListing = await _repository.GetAsync(id);
            return ObjectMapper.Map<JobListing, JobListingDto>(jobListing);
        }

        public async Task<PagedResultDto<JobListingDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? "Title" : input.Sorting)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var jobListings = await AsyncExecuter.ToListAsync(query);
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            return new PagedResultDto<JobListingDto>(
                totalCount,
                ObjectMapper.Map<List<JobListing>, List<JobListingDto>>(jobListings)
            );
        }

        public async Task<JobListingDto> CreateAsync(CreateUpdateJobListingDto input)
        {
            var jobListing = ObjectMapper.Map<CreateUpdateJobListingDto, JobListing>(input);
            await _repository.InsertAsync(jobListing);
            return ObjectMapper.Map<JobListing, JobListingDto>(jobListing);
        }

        public async Task<JobListingDto> UpdateAsync(Guid id, CreateUpdateJobListingDto input)
        {
            var jobListing = await _repository.GetAsync(id);
            ObjectMapper.Map(input, jobListing);
            await _repository.UpdateAsync(jobListing);
            return ObjectMapper.Map<JobListing, JobListingDto>(jobListing);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }
        
        public async Task<PagedResultDto<JobListingDto>> GetListByCreatorAsync(PagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();
            var query = queryable
                .Where(x => x.CreatorId == CurrentUser.Id)
                .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? "Title" : input.Sorting)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var jobListings = await AsyncExecuter.ToListAsync(query);
            var totalCount = await AsyncExecuter.CountAsync(queryable.Where(x => x.CreatorId == CurrentUser.Id));

            return new PagedResultDto<JobListingDto>(
                totalCount,
                ObjectMapper.Map<List<JobListing>, List<JobListingDto>>(jobListings)
            );
        }
    }
}
