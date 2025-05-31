using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Volo.Abp;
using System.Linq.Dynamic.Core; // ✅ Needed for OrderBy(string)

namespace IlkKontakt.Backend.Notifications;

public class NotificationAppService :
    CrudAppService<
        Notification,
        NotificationDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateNotificationDto>,
    INotificationAppService
{
    private readonly ICurrentUser _currentUser;

    public NotificationAppService(
        IRepository<Notification, Guid> repository,
        ICurrentUser currentUser)
        : base(repository)
    {
        _currentUser = currentUser;
    }

    public override async Task<NotificationDto> CreateAsync(CreateNotificationDto input)
    {
        var userId = _currentUser.GetId();

        // Create the entity using its constructor
        var entity = new Notification(userId, input.Message, input.Type);

        // ID will be set by ABP automatically
        await Repository.InsertAsync(entity, autoSave: true);

        return MapToGetOutputDto(entity);
    }


    public override async Task<PagedResultDto<NotificationDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = _currentUser.GetId();
        var query = (await Repository.GetQueryableAsync())
            .Where(n => n.UserId == userId)
            .AsQueryable(); // ✅ Ensure compatibility with dynamic LINQ

        var totalCount = await AsyncExecuter.CountAsync(query);

        var items = await AsyncExecuter.ToListAsync(
            query
                .OrderBy(input.Sorting ?? "CreationTime desc") // ✅ Dynamic sort string
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
        );

        var dtoList = ObjectMapper.Map<List<Notification>, List<NotificationDto>>(items);

        return new PagedResultDto<NotificationDto>(totalCount, dtoList);
    }
    
    public async Task MarkAsReadAsync(Guid id)
    {
        var userId = _currentUser.GetId();
        var notification = await Repository.GetAsync(id);

        if (notification.UserId != userId)
        {
            throw new BusinessException("You are not allowed to modify this notification.");
        }

        notification.MarkAsRead();
        await Repository.UpdateAsync(notification);
    }
}

