using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using System.Linq;
using IlkKontakt.Backend.JobListings;
using IlkKontakt.Backend.Notifications;


namespace IlkKontakt.Backend.JobApplications;

public class JobApplicationAppService :
    CrudAppService<
        JobApplication,
        JobApplicationDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateJobApplicationDto>,
    IJobApplicationAppService
{
    private readonly ICurrentUser _currentUser;
    private readonly INotificationAppService _notificationAppService;
    private readonly IRepository<JobListing, Guid> _jobListingRepository;

    public JobApplicationAppService(
        IRepository<JobApplication, Guid> repository,
        ICurrentUser currentUser,
        INotificationAppService notificationAppService,
        IRepository<JobListing, Guid> jobListingRepository
        ) 
        : base(repository)
    {
        _currentUser = currentUser;
        _notificationAppService = notificationAppService;
        _jobListingRepository = jobListingRepository;
    }

    public override async Task<JobApplicationDto> CreateAsync(CreateJobApplicationDto input)
    {
        var applicantId = _currentUser.Id;

        if (applicantId == null)
        {
            throw new UserFriendlyException("You must be logged in to apply for a job.");
        }
        
        var query = await Repository.GetQueryableAsync();

        var exists = query.Any(x =>
            x.JobListingId == input.JobListingId &&
            x.ApplicantId == applicantId.Value);

        if (exists)
        {
            throw new UserFriendlyException("You have already applied for this job.");
        }

        // ✅ Create and save job application
        var entity = new JobApplication(input.JobListingId, applicantId.Value);
        await Repository.InsertAsync(entity, autoSave: true);

        // ✅ Get job listing details
        var jobListing = await _jobListingRepository.GetAsync(entity.JobListingId);

        // ✅ Send notification to job listing creator (if not the same as applicant)
        if (jobListing.CreatorId != applicantId)
        {
            if (jobListing.CreatorId == null)
            {
                throw new UserFriendlyException("Job listing has no creator associated.");
            }

            var notificationDto = new CreateNotificationDto
            {
                UserId = jobListing.CreatorId.Value, // ✅ now it's Guid, not Guid?
                Message = $"You received a new application for your job listing: '{jobListing.Title}'.",
                Type = NotificationType.JobApplicationReceived
            };

            await _notificationAppService.CreateAsync(notificationDto);
        }

        return MapToGetOutputDto(entity);
    }


    public async Task<List<JobApplicationDto>> GetMyApplicationsAsync()
    {
        var userId = _currentUser.Id;

        if (userId == null)
        {
            throw new UserFriendlyException("You must be logged in to view your applications.");
        }

        var query = await Repository.GetQueryableAsync();

        var filtered = query.Where(x => x.ApplicantId == userId.Value);

        var list = await AsyncExecuter.ToListAsync(filtered);

        return ObjectMapper.Map<List<JobApplication>, List<JobApplicationDto>>(list);
    }
    
    public async Task<JobApplicationDto> SetStatusAsync(Guid id, UpdateJobApplicationStatusDto input)
    {
        var jobApplication = await Repository.GetAsync(id);
        var jobListing = await _jobListingRepository.GetAsync(jobApplication.JobListingId);

        jobApplication.Status = input.Status;

        // Notify applicant if status changed to Accepted or Rejected
        if (input.Status == JobApplicationStatus.Accepted)
        {
            // Notify the applicant
            await _notificationAppService.CreateAsync(new CreateNotificationDto
            {
                UserId = jobApplication.ApplicantId,
                Message = $"Your application for job '{jobListing.Title}' has been accepted.",
                Type = NotificationType.JobApplicationAccepted
            });
        }
        else if (input.Status == JobApplicationStatus.Rejected)
        {
            await _notificationAppService.CreateAsync(new CreateNotificationDto
            {
                UserId = jobApplication.ApplicantId,
                Message = $"Your application for job '{jobListing.Title}' has been rejected.",
                Type = NotificationType.JobApplicationRejected
            });
        }

        await Repository.UpdateAsync(jobApplication);
        return MapToGetOutputDto(jobApplication);
    }
}