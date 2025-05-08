using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.UserProfiles;

public class Education : AuditedEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public String InstutionName { get; set; }
    public EducationDegree Degree { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public float GPA { get; set; }
    public String Description { get; set; }
}