using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Chat;

public class ChatSession : AuditedAggregateRoot<Guid>
{
    public Guid User1Id { get; set; }
    public Guid User2Id { get; set; }

    public DateTime StartedAt { get; set; }

    // Navigational property: Bu sohbetin tüm mesajları
    public virtual ICollection<Message> Messages { get; set; }

    private ChatSession()
    {
        Messages = new List<Message>();
    }

    public ChatSession(Guid id, Guid user1Id, Guid user2Id, DateTime startedAt)
        : base(id)
    {
        User1Id = user1Id;
        User2Id = user2Id;
        StartedAt = startedAt;
        Messages = new List<Message>();
    }
}

