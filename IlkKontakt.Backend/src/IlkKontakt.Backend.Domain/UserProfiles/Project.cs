using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.UserProfiles;

public class Project : AuditedEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public String ProjectName { get; set; }
    public String Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public String? ProjectUrl { get; set; }
}