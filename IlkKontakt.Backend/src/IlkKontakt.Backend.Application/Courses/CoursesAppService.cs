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
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Courses
{
    public class CourseAppService : ApplicationService, ICourseAppService
    {
        private readonly IRepository<Course, Guid> _courseRepository;
        private readonly IRepository<Instructor, Guid> _instructorRepository;

        public CourseAppService(
            IRepository<Course, Guid> courseRepository,
            IRepository<Instructor, Guid> instructorRepository
        )
        {
            _courseRepository = courseRepository;
            _instructorRepository = instructorRepository;
        }

        public async Task<CourseDto> GetAsync(Guid id)
        {
            var course = await _courseRepository.GetAsync(id);
            var userId = CurrentUser.GetId();
            if (course.InstructorId != userId)
            {
                throw new AbpAuthorizationException(
                    "You are not allowed to view this course."
                );
            }

            return ObjectMapper.Map<Course, CourseDto>(course);
        }

        public async Task<PagedResultDto<CourseDto>> GetListAsync(
            CoursePagedAndSortedResultRequestDto input
        )
        {
            var userId = CurrentUser.GetId();
            var instr = await _instructorRepository.FirstOrDefaultAsync(
                i => i.UserId == userId
            );
            if (instr == null)
            {
                return new PagedResultDto<CourseDto>(0, new List<CourseDto>());
            }

            var queryable = await _courseRepository.GetQueryableAsync();
            var query = queryable
                .Where(c => c.InstructorId == instr.Id)
                .WhereIf(
                    !input.Title.IsNullOrWhiteSpace(),
                    c => c.Title.Contains(input.Title)
                )
                .WhereIf(
                    input.IsPublished.HasValue,
                    c => c.IsPublished == input.IsPublished.Value
                );

            var totalCount = await AsyncExecuter.CountAsync(query);
            var list = await AsyncExecuter.ToListAsync(
                query
                    .OrderBy(
                        input.Sorting ?? $"{nameof(Course.CreationTime)} desc"
                    )
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<CourseDto>(
                totalCount,
                ObjectMapper.Map<List<Course>, List<CourseDto>>(list)
            );
        }

        // New method to get all courses (independent from current user)
        public async Task<PagedResultDto<CourseDto>> GetAllCoursesAsync(
            CoursePagedAndSortedResultRequestDto input
        )
        {
            var queryable = await _courseRepository.GetQueryableAsync();
            var query = queryable
                .WhereIf(
                    !input.Title.IsNullOrWhiteSpace(),
                    c => c.Title.Contains(input.Title)
                )
                .WhereIf(
                    input.IsPublished.HasValue,
                    c => c.IsPublished == input.IsPublished.Value
                );

            var totalCount = await AsyncExecuter.CountAsync(query);
            var list = await AsyncExecuter.ToListAsync(
                query
                    .OrderBy(
                        input.Sorting ?? $"{nameof(Course.CreationTime)} desc"
                    )
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<CourseDto>(
                totalCount,
                ObjectMapper.Map<List<Course>, List<CourseDto>>(list)
            );
        }

        // Method to get all published courses (public view)
        public async Task<PagedResultDto<CourseDto>> GetPublishedCoursesAsync(
            CoursePagedAndSortedResultRequestDto input
        )
        {
            var queryable = await _courseRepository.GetQueryableAsync();
            var query = queryable
                .Where(c => c.IsPublished == true) // Only published courses
                .WhereIf(
                    !input.Title.IsNullOrWhiteSpace(),
                    c => c.Title.Contains(input.Title)
                );

            var totalCount = await AsyncExecuter.CountAsync(query);
            var list = await AsyncExecuter.ToListAsync(
                query
                    .OrderBy(
                        input.Sorting ?? $"{nameof(Course.CreationTime)} desc"
                    )
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<CourseDto>(
                totalCount,
                ObjectMapper.Map<List<Course>, List<CourseDto>>(list)
            );
        }

        // Method to get any course by ID (for public viewing)
        public async Task<CourseDto> GetPublicAsync(Guid id)
        {
            var course = await _courseRepository.GetAsync(id);
            
            // Only allow viewing published courses publicly
            if (!course.IsPublished)
            {
                throw new AbpAuthorizationException(
                    "This course is not available for public viewing."
                );
            }

            return ObjectMapper.Map<Course, CourseDto>(course);
        }

        public async Task<CourseDto> CreateAsync(CreateUpdateCourseDto input)
        {
            var userId = CurrentUser.GetId();
            var instr = await _instructorRepository.FirstOrDefaultAsync(
                i => i.UserId == userId
            );
            if (instr == null)
            {
                throw new BusinessException(
                    "You must be an instructor to create a course."
                );
            }

            var course = ObjectMapper.Map<CreateUpdateCourseDto, Course>(input);
            course.InstructorId = instr.Id;

            await _courseRepository.InsertAsync(course, autoSave: true);

            return ObjectMapper.Map<Course, CourseDto>(course);
        }

        public async Task<CourseDto> UpdateAsync(
            Guid id,
            CreateUpdateCourseDto input
        )
        {
            var userId = CurrentUser.GetId();
            var instr = await _instructorRepository.FirstOrDefaultAsync(
                i => i.UserId == userId
            );
            if (instr == null)
            {
                throw new BusinessException(
                    "You must be an instructor to update a course."
                );
            }

            var course = await _courseRepository.GetAsync(id);
            if (course.InstructorId != instr.Id)
            {
                throw new AbpAuthorizationException(
                    "You are not allowed to update this course."
                );
            }

            ObjectMapper.Map(input, course);
            // preserve instructor
            course.InstructorId = instr.Id;

            await _courseRepository.UpdateAsync(course, autoSave: true);

            return ObjectMapper.Map<Course, CourseDto>(course);
        }

        public Task DeleteAsync(Guid id)
        {
            var userId = CurrentUser.GetId();
            return _courseRepository.DeleteAsync(
                c => c.Id == id && c.InstructorId == userId,
                autoSave: true
            );
        }
    }
}
