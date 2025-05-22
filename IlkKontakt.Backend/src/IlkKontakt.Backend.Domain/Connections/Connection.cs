using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Connections;

public class Connection : AuditedAggregateRoot<Guid>
{
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public ConnectionStatus Status { get; set; }

    // EF Core ctor
    protected Connection() { }

    public Connection(Guid senderId, Guid receiverId)
    {
        SenderId = senderId;
        ReceiverId = receiverId;
        Status = ConnectionStatus.Pending;
    }

    public void Accept()   => Status = ConnectionStatus.Accepted;
    public void Reject()   => Status = ConnectionStatus.Rejected;
}
