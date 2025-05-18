using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.UserProfiles;

public class Language : AuditedEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public string LanguageName { get; set; }
    public LanguageProficiency LanguageProficiency { get; set; }
}