using System;

namespace IlkKontakt.Backend.Notifications;

public class CreateNotificationDto
{
    public Guid UserId { get; set; } // Can be Admin's own ID for broadcasts
    public string Message { get; set; }
    public NotificationType Type { get; set; }
}