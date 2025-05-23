using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IlkKontakt.Backend.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using System.Linq;
using System.Linq.Dynamic.Core;
using Volo.Abp;
using Volo.Abp.Authorization;

namespace IlkKontakt.Backend.Connections;

public class ConnectionAppService : 
    CrudAppService<
        Connection,
        ConnectionDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateConnectionDto,
        UpdateConnectionStatusDto>,
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
        var senderId = _currentUser.GetId();
        if (input.ReceiverId == senderId)
        {
            throw new BusinessException("You cannot send a connection to yourself!");
        }

        var entity = new Connection(senderId, input.ReceiverId);
        await Repository.InsertAsync(entity);
        return MapToGetOutputDto(entity);
    }

    public override async Task<ConnectionDto> UpdateAsync(Guid id, UpdateConnectionStatusDto input)
    {
        var entity = await Repository.GetAsync(id);
        if (input.Status == ConnectionStatus.Accepted) entity.Accept();
        else if (input.Status == ConnectionStatus.Rejected) entity.Reject();

        await Repository.UpdateAsync(entity);
        return MapToGetOutputDto(entity);
    }
    
    public async Task<PagedResultDto<ConnectionDto>> GetIncomingListAsync(
        PagedAndSortedResultRequestDto input)
    {
        var userId = _currentUser.GetId();

        var query = await Repository.GetQueryableAsync();
        query = query.Where(c => c.ReceiverId == userId);

        var total = await AsyncExecuter.CountAsync(query);

        var pagedQuery = query
            .OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var entities = await AsyncExecuter.ToListAsync(pagedQuery);

        var dtoList = ObjectMapper.Map<List<Connection>, List<ConnectionDto>>(entities);

        return new PagedResultDto<ConnectionDto>(total, dtoList);
    }

    public async Task<PagedResultDto<ConnectionDto>> GetOutgoingListAsync(
        PagedAndSortedResultRequestDto input)
    {
        var userId = _currentUser.GetId();

        var query = await Repository.GetQueryableAsync();
        query = query.Where(c => c.SenderId == userId);

        var total = await AsyncExecuter.CountAsync(query);

        var pagedQuery = query
            .OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var entities = await AsyncExecuter.ToListAsync(pagedQuery);

        var dtoList = ObjectMapper.Map<List<Connection>, List<ConnectionDto>>(entities);

        return new PagedResultDto<ConnectionDto>(total, dtoList);
    }
}
