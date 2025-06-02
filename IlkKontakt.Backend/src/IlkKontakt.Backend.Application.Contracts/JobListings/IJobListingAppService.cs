using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.JobListings;

public interface IJobListingAppService :
    ICrudAppService< // Defines CRUD methods
        JobListingDto, // Used to show job listings
        Guid, // Primary key of the job listing entity
        PagedAndSortedResultRequestDto, // Used for paging/sorting
        CreateUpdateJobListingDto> // Used to create/update a job listing
{
    Task<PagedResultDto<JobListingDto>> GetListByCreatorAsync(PagedAndSortedResultRequestDto input);
}
