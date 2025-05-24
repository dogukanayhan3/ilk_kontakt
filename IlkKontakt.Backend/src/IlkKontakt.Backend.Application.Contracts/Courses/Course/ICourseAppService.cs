using System;
using System.Collections.Generic;
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
    Task<PagedResultDto<CourseDto>> GetAllCoursesAsync(
        CoursePagedAndSortedResultRequestDto input);
    
    Task<PagedResultDto<CourseDto>> GetPublishedCoursesAsync(
        CoursePagedAndSortedResultRequestDto input);
    
    Task<CourseDto> GetPublicAsync(Guid id);
}