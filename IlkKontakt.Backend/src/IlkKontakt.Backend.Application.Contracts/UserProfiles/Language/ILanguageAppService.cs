using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.UserProfiles.Language;

public interface ILanguageAppService :
    ICrudAppService<
    LanguageDto,
    Guid,
    PagedResultRequestDto,
    CreateUpdateLanguageDto>
{
    
}