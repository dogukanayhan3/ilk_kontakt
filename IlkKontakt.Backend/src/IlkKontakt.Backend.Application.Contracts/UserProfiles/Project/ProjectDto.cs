using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles.Project;

public class ProjectDto : AuditedEntityDto<Guid>
{
    public Guid ProfileId { get; set; }
    public String ProjectName { get; set; }
    public String Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public String? ProjectUrl { get; set; }
}