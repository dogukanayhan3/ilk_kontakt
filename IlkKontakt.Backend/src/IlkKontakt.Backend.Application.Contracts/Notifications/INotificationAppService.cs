using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Notifications;

public interface INotificationAppService : 
    ICrudAppService<
        NotificationDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateNotificationDto>
{
    Task MarkAsReadAsync(Guid id);
}

