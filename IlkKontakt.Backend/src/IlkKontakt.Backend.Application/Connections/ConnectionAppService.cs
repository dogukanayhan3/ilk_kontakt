using System;
using System.Threading.Tasks;
using IlkKontakt.Backend.Connections;
using IlkKontakt.Backend.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Volo.Abp.Authorization;


namespace IlkKontakt.Backend.Connections;

[Authorize(BackendPermissions.Connection.Default)]
public class ConnectionAppService : 
    CrudAppService<
        Connection,
        ConnectionDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateConnectionDto,
        UpdateConnectionDto>,
    IConnectionAppService
{
    private readonly ICurrentUser _currentUser;

    public ConnectionAppService(
        IRepository<Connection, Guid> repository,
        ICurrentUser currentUser)
        : base(repository)
    {
        _currentUser = currentUser;
    }

    public override async Task<ConnectionDto> CreateAsync(CreateConnectionDto input)
    {
        var senderId = _currentUser.GetId(); // returns Guid, throws if not authenticated// ABP’s current user
        var entity = new Connection(senderId, input.ReceiverId);
        await Repository.InsertAsync(entity);
        return MapToGetOutputDto(entity);
    }

    public override async Task<ConnectionDto> UpdateAsync(Guid id, UpdateConnectionDto input)
    {
        var entity = await Repository.GetAsync(id);
        if (input.Status == ConnectionStatus.Accepted) entity.Accept();
        else if (input.Status == ConnectionStatus.Rejected) entity.Reject();

        await Repository.UpdateAsync(entity);
        return MapToGetOutputDto(entity);
    }
}
