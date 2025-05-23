using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Courses;

public interface IEnrollmentAppService : 
    ICrudAppService<
        EnrollmentDto,
        Guid,
        EnrollmentPagedAndSortedResultRequestDto,
        CreateUpdateEnrollmentDto>
{
    Task<List<EnrollmentDto>> GetByUserIdAsync(Guid userId);
    Task<List<EnrollmentDto>> GetByCourseIdAsync(Guid courseId);
    Task<bool> IsEnrolledAsync(Guid courseId, Guid userId);
} 