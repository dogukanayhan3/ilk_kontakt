using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using IlkKontakt.Backend.Notifications;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Courses
{
  public class EnrollmentAppService
    : ApplicationService, IEnrollmentAppService
  {
    private readonly IRepository<Enrollment, Guid> _enrollmentRepository;
    private readonly IRepository<Course, Guid> _courseRepository;
    private readonly INotificationAppService _notificationAppService;
    private readonly IRepository<Instructor, Guid> _instructorRepository;

    public EnrollmentAppService(
      IRepository<Enrollment, Guid> enrollmentRepository,
      IRepository<Course, Guid> courseRepository,
      INotificationAppService notificationAppService,
      IRepository<Instructor, Guid> instructorRepository)
    {
      _enrollmentRepository = enrollmentRepository;
      _courseRepository     = courseRepository;
      _notificationAppService = notificationAppService;
      _instructorRepository  = instructorRepository;
    }

    public async Task<EnrollmentDto> GetAsync(Guid id)
    {
      var enrollment = await _enrollmentRepository.GetAsync(id);
      if (enrollment.UserId != CurrentUser.GetId())
      {
        throw new AbpAuthorizationException(
          "You are not allowed to view this enrollment."
        );
      }

      return ObjectMapper.Map<Enrollment, EnrollmentDto>(enrollment);
    }

    public async Task<PagedResultDto<EnrollmentDto>> GetListAsync(
      EnrollmentPagedAndSortedResultRequestDto input)
    {
      var userId    = CurrentUser.GetId();
      var queryable = await _enrollmentRepository.GetQueryableAsync();

      var query = queryable
        .Where(e => e.UserId == userId)
        .WhereIf(input.CourseId.HasValue,
                 e => e.CourseId == input.CourseId.Value);

      var totalCount = await AsyncExecuter.CountAsync(query);

      var list = await AsyncExecuter.ToListAsync(
        query
          .OrderBy(input.Sorting
                   ?? $"{nameof(Enrollment.CreationTime)} desc")
          .Skip(input.SkipCount)
          .Take(input.MaxResultCount)
      );

      return new PagedResultDto<EnrollmentDto>(
        totalCount,
        ObjectMapper.Map<List<Enrollment>, List<EnrollmentDto>>(list)
      );
    }

    public async Task<EnrollmentDto> CreateAsync(
      CreateUpdateEnrollmentDto input)
    {
      var userId = CurrentUser.GetId();

      // Validate Course exists
      if (!await _courseRepository.AnyAsync(
            c => c.Id == input.CourseId))
      {
        throw new EntityNotFoundException(
          typeof(Course),
          input.CourseId
        );
      }

      // Prevent duplicate enrollment for current user
      if (await _enrollmentRepository.AnyAsync(e =>
            e.CourseId == input.CourseId &&
            e.UserId   == userId))
      {
        throw new BusinessException(
          "IlkKontakt.Enrollment.Duplicate"
        );
      }

      var enrollment = ObjectMapper.Map<
        CreateUpdateEnrollmentDto,
        Enrollment>(input);
      enrollment.UserId         = userId;
      enrollment.EnrollmentDate = Clock.Now;

      await _enrollmentRepository.InsertAsync(
        enrollment,
        autoSave: true
      );
      
      // 🆕 Notify Instructor
      var course = await _courseRepository.GetAsync(input.CourseId);
      var instructor = await _instructorRepository.GetAsync(course.InstructorId);
      if (instructor.UserId != userId)
      {
        await _notificationAppService.CreateAsync(new CreateNotificationDto
        {
          UserId = instructor.UserId,
          Message = "A new student has enrolled in your course.",
          Type = NotificationType.NewEnrollment
        });
      }

      return ObjectMapper.Map<Enrollment, EnrollmentDto>(
        enrollment
      );
    }

    public async Task<EnrollmentDto> UpdateAsync(
      Guid id,
      CreateUpdateEnrollmentDto input)
    {
      var userId     = CurrentUser.GetId();
      var enrollment = await _enrollmentRepository.GetAsync(id);

      if (enrollment.UserId != userId)
      {
        throw new AbpAuthorizationException(
          "You are not allowed to update this enrollment."
        );
      }

      // Re-validate Course if changed
      if (enrollment.CourseId != input.CourseId
          && !await _courseRepository.AnyAsync(
               c => c.Id == input.CourseId))
      {
        throw new EntityNotFoundException(
          typeof(Course),
          input.CourseId
        );
      }

      // Prevent duplicate
      if (await _enrollmentRepository.AnyAsync(e =>
            e.CourseId == input.CourseId &&
            e.UserId   == userId &&
            e.Id       != id))
      {
        throw new BusinessException(
          "IlkKontakt.Enrollment.Duplicate"
        );
      }

      ObjectMapper.Map(input, enrollment);
      // preserve owner
      enrollment.UserId = userId;

      await _enrollmentRepository.UpdateAsync(
        enrollment,
        autoSave: true
      );

      return ObjectMapper.Map<Enrollment, EnrollmentDto>(
        enrollment
      );
    }

    public Task DeleteAsync(Guid id)
    {
      return _enrollmentRepository.DeleteAsync(
        e => e.Id == id && e.UserId == CurrentUser.GetId(),
        autoSave: true
      );
    }
  }
}
