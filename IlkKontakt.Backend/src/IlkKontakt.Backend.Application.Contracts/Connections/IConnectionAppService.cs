using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Connections;

public interface IConnectionAppService : 
    ICrudAppService<
        ConnectionDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateConnectionDto,
        UpdateConnectionDto>
{
}
