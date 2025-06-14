using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Messages;

public class Message : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// The ID of the connection this message belongs to.
    /// </summary>
    public Guid ConnectionId { get; protected set; }

    /// <summary>
    /// The ID of the user who sent this message.
    /// </summary>
    public Guid SenderId { get; protected set; }

    /// <summary>
    /// The body text of the message.
    /// </summary>
    public string Text { get; protected set; }

    /// <summary>
    /// Whether the message has been marked as read.
    /// </summary>
    public bool IsRead { get; protected set; }

    // Parameterless constructor required by EF Core
    protected Message() { }

    /// <summary>
    /// Creates a new Message instance.
    /// </summary>
    /// <param name="id">Unique identifier for the message.</param>
    /// <param name="connectionId">ID of the connection thread.</param>
    /// <param name="senderId">ID of the message sender.</param>
    /// <param name="text">Message content.</param>
    public Message(Guid connectionId, Guid senderId, string text)
    {
        ConnectionId = connectionId;
        SenderId = senderId;
        Text = text;
        IsRead = false;
    }

    /// <summary>
    /// Marks this message as read.
    /// </summary>
    public void MarkAsRead() => IsRead = true;
}
