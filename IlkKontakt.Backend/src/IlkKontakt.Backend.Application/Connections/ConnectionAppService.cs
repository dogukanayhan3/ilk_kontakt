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
        var senderId   = _currentUser.GetId();
        var receiverId = input.ReceiverId;

        if (receiverId == senderId)
        {
            throw new BusinessException("You cannot send a connection to yourself!");
        }

        // See if there's any pre‐existing row sender→receiver
        var existing = await Repository.FirstOrDefaultAsync(c =>
            c.SenderId   == senderId &&
            c.ReceiverId == receiverId
        );

        if (existing != null)
        {
            switch (existing.Status)
            {
                case ConnectionStatus.Pending:
                    throw new BusinessException("A connection request is already pending.");

                case ConnectionStatus.Accepted:
                    throw new BusinessException("You are already connected with this user.");

                case ConnectionStatus.Rejected:
                    // Delete that old rejected row
                    await Repository.DeleteAsync(existing.Id);
                    break;
                default:
                    break;
            }
        }

        // Now insert a brand‐new connection
        var newConn = new Connection(senderId, receiverId);
        await Repository.InsertAsync(newConn);
        return MapToGetOutputDto(newConn);
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

    public async Task<PagedResultDto<ConnectionDto>> GetUserConnectionsAsync(
        PagedAndSortedResultRequestDto input)
    {
        var userId = _currentUser.GetId();

        var query = await Repository.GetQueryableAsync();
        // Get all connections where current user is either sender or receiver
        query = query.Where(c => c.SenderId == userId || c.ReceiverId == userId);

        var total = await AsyncExecuter.CountAsync(query);

        var pagedQuery = query
            .OrderBy(input.Sorting ?? "CreationTime desc")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var entities = await AsyncExecuter.ToListAsync(pagedQuery);

        var dtoList = ObjectMapper.Map<List<Connection>, List<ConnectionDto>>(entities);

        return new PagedResultDto<ConnectionDto>(total, dtoList);
    }
    
    public override async Task DeleteAsync(Guid id)
    {
        var entity = await Repository.GetAsync(id);
        await Repository.DeleteAsync(entity);
    }
}
