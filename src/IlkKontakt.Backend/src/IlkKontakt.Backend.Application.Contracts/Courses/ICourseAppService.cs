using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Courses;

public interface ICourseAppService : 
    ICrudAppService<
        CourseDto,
        Guid,
        CoursePagedAndSortedResultRequestDto,
        CreateUpdateCourseDto>
{
    Task<List<CourseDto>> GetByInstructorIdAsync(Guid instructorId);
} 