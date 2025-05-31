using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Notifications;

public class NotificationDto : EntityDto<Guid>
{
    public string Message { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreationTime { get; set; }
}