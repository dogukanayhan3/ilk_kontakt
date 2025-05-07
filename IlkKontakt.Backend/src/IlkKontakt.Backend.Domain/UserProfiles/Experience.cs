using System;
using IlkKontakt.Backend.UserProfiles;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.UserProfiles
{
    public class Experience : AuditedEntity<Guid>
    {
        public Guid ProfileId { get; set; }
        public string Title { get; set; }
        public string CompanyName { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentPosition { get; set; }
        public string Description { get; set; }
        public EmploymentType EmploymentType { get; set; }
    }
}