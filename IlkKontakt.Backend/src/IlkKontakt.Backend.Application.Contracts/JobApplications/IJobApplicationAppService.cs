using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.JobApplications;

public interface IJobApplicationAppService : ICrudAppService<
    JobApplicationDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateJobApplicationDto>
{
    Task<List<JobApplicationDto>> GetMyApplicationsAsync();
    
    Task<PagedResultDto<JobApplicationWithProfileDto>> GetByJobIdAsync(Guid jobId, PagedAndSortedResultRequestDto input);
}