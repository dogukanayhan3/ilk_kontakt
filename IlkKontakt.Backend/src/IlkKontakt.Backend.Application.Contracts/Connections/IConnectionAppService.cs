using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using System.Threading.Tasks;


namespace IlkKontakt.Backend.Connections;

public interface IConnectionAppService : 
    ICrudAppService<
        ConnectionDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateConnectionDto,
        UpdateConnectionStatusDto>
{
    Task<PagedResultDto<ConnectionDto>> GetIncomingListAsync(PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<ConnectionDto>> GetOutgoingListAsync(PagedAndSortedResultRequestDto input);

}
