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
using IlkKontakt.Backend.Notifications;
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
    private readonly INotificationAppService _notificationAppService;

    public ConnectionAppService(
        IRepository<Connection, Guid> repository,
        ICurrentUser currentUser,
        INotificationAppService notificationAppService)
        : base(repository)
    {
        _currentUser = currentUser;
        _notificationAppService = notificationAppService;
    }

    public override async Task<ConnectionDto> CreateAsync(CreateConnectionDto input)
    {
        var senderId   = _currentUser.GetId();
        var receiverId = input.ReceiverId;

        if (receiverId == senderId)
        {
            throw new BusinessException("Kendinize bağlantı isteği gönderemezsiniz!");
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
                    throw new BusinessException("Zaten beklemede olan bir bağlantı isteği var.");

                case ConnectionStatus.Accepted:
                    throw new BusinessException("Bu kullanıcıyla zaten bağlantınız var.");

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
        
        // ✅ Send notification to receiver
        await _notificationAppService.CreateAsync(new CreateNotificationDto
        {
            UserId = receiverId,
            Message = "You have a new connection request.",
            Type = NotificationType.ConnectionRequest // Define this in your enum
        });
        
        return MapToGetOutputDto(newConn);
    }

    public override async Task<ConnectionDto> UpdateAsync(Guid id, UpdateConnectionStatusDto input)
    {
        var entity = await Repository.GetAsync(id);

        if (input.Status == ConnectionStatus.Accepted)
        {
            entity.Accept();

            // ✅ Notify the original sender that the request was accepted
            await _notificationAppService.CreateAsync(new CreateNotificationDto
            {
                UserId = entity.SenderId,
                Message = "Your connection request has been accepted.",
                Type = NotificationType.ConnectionAccepted // Add to enum
            });
        }
        else if (input.Status == ConnectionStatus.Rejected)
        {
            entity.Reject();
            // (Optional) notify sender about rejection if you want
        }

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

    public async Task<PagedResultDto<ConnectionDto>> GetAcceptedConnectionsAsync(Guid userId, PagedAndSortedResultRequestDto input)
    {
        var query = await Repository.GetQueryableAsync();
        query = query.Where(c =>
            (c.SenderId   == userId || c.ReceiverId == userId)
            && c.Status   == ConnectionStatus.Accepted);

        var total = await AsyncExecuter.CountAsync(query);

        var list = await AsyncExecuter.ToListAsync(
            query
                .OrderBy(input.Sorting ?? "CreationTime desc")
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
        );

        var dtoList = ObjectMapper.Map<List<Connection>, List<ConnectionDto>>(list);
        return new PagedResultDto<ConnectionDto>(total, dtoList);
    }


    public override async Task DeleteAsync(Guid id)
    {
        var entity = await Repository.GetAsync(id);
        await Repository.DeleteAsync(entity);
    }
}
