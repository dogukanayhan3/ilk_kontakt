using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Courses;

public class InstructorDto : AuditedEntityDto<Guid>
{
    public Guid UserId { get; set; }
}