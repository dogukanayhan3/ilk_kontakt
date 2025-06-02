using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Chat;

public class Message : AuditedEntity<Guid>
{
    public Guid ChatSessionId { get; set; }

    public Guid SenderId { get; set; }

    public string Content { get; set; }

    // Navigational property (opsiyonel ama önerilir)
    public virtual ChatSession ChatSession { get; set; }

    private Message() { }

    public Message(Guid id, Guid chatSessionId, Guid senderId, string content)
        : base(id)
    {
        ChatSessionId = chatSessionId;
        SenderId = senderId;
        Content = content;
    }
}

