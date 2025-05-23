using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Courses
{
  public class InstructorAppService : ApplicationService, IInstructorAppService
  {
    private readonly IRepository<Instructor, Guid> _instructorRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public InstructorAppService(
      IRepository<Instructor, Guid> instructorRepository,
      IRepository<IdentityUser, Guid> userRepository)
    {
      _instructorRepository = instructorRepository;
      _userRepository       = userRepository;
    }

    public async Task<InstructorDto> GetAsync(Guid id)
    {
      var instructor = await _instructorRepository.GetAsync(id);
      // Ensure it belongs to current user
      if (instructor.UserId != CurrentUser.GetId())
      {
        throw new AbpAuthorizationException(
          "You are not allowed to view this instructor."
        );
      }

      return ObjectMapper.Map<Instructor, InstructorDto>(instructor);
    }

    public async Task<PagedResultDto<InstructorDto>> GetListAsync(
      InstructorPagedAndSortedResultRequestDto input)
    {
      var userId    = CurrentUser.GetId();
      var queryable = await _instructorRepository.GetQueryableAsync();
      var query     = queryable.Where(ins => ins.UserId == userId);

      var totalCount = await AsyncExecuter.CountAsync(query);

      var list = await AsyncExecuter.ToListAsync(
        query
          .OrderBy(input.Sorting ?? $"{nameof(Instructor.CreationTime)} desc")
          .Skip(input.SkipCount)
          .Take(input.MaxResultCount)
      );

      return new PagedResultDto<InstructorDto>(
        totalCount,
        ObjectMapper.Map<List<Instructor>, List<InstructorDto>>(list)
      );
    }

    public async Task<InstructorDto> CreateAsync(
      CreateUpdateInstructorDto input)
    {
      var userId = CurrentUser.GetId();

      // Prevent duplicate instructor for current user
      if (await _instructorRepository.AnyAsync(i => i.UserId == userId))
      {
        throw new BusinessException(
          "IlkKontakt.Instructor.DuplicateUser"
        );
      }

      // Map & insert
      var instructor = ObjectMapper.Map<
        CreateUpdateInstructorDto,
        Instructor>(input);
      instructor.UserId = userId;

      await _instructorRepository.InsertAsync(
        instructor,
        autoSave: true
      );

      return ObjectMapper.Map<Instructor, InstructorDto>(
        instructor
      );
    }

    public async Task<InstructorDto> UpdateAsync(
      Guid id,
      CreateUpdateInstructorDto input)
    {
      var userId     = CurrentUser.GetId();
      var instructor = await _instructorRepository.GetAsync(id);

      // Only owner can update
      if (instructor.UserId != userId)
      {
        throw new AbpAuthorizationException(
          "You are not allowed to update this instructor."
        );
      }

      ObjectMapper.Map(input, instructor);
      // ensure we don't accidentally change owner
      instructor.UserId = userId;

      await _instructorRepository.UpdateAsync(
        instructor,
        autoSave: true
      );

      return ObjectMapper.Map<Instructor, InstructorDto>(
        instructor
      );
    }

    public Task DeleteAsync(Guid id)
    {
      return _instructorRepository.DeleteAsync(
        ins => ins.Id == id && ins.UserId == CurrentUser.GetId(),
        autoSave: true
      );
    }
  }
}
