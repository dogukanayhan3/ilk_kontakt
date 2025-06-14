using System;

namespace IlkKontakt.Backend.Messages;

public class MessageDto
{
    public Guid Id { get; set; }

    public Guid ConnectionId { get; set; }

    public Guid SenderId { get; set; }

    public string Text { get; set; }

    public DateTime CreationTime { get; set; }
}
