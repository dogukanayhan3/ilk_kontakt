using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class LanguageDto : AuditedEntityDto<Guid>
{
    public Guid ProfileId { get; set; }
    public string LanguageName { get; set; }
    public LanguageProficiency LanguageProficiency { get; set; }
}