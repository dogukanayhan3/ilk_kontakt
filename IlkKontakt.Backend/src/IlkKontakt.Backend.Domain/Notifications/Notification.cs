using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Timing;

namespace IlkKontakt.Backend.Notifications;

public class Notification : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public string Message { get; private set; }
    public NotificationType Type { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime CreationTime { get; private set; }

    public Notification(Guid userId, string message, NotificationType type)
    {
        UserId = userId;
        Message = message;
        Type = type;
        IsRead = false;
        CreationTime = DateTime.UtcNow;
    }

    public void MarkAsRead() => IsRead = true;
}
