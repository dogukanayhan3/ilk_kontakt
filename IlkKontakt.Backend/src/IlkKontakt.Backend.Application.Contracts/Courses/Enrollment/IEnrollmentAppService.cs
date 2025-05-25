using System;
using System.Collections.Generic;
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
}