using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Courses;

public interface IInstructorAppService : 
    ICrudAppService<
        InstructorDto,
        Guid,
        InstructorPagedAndSortedResultRequestDto,
        CreateUpdateInstructorDto>
{
}