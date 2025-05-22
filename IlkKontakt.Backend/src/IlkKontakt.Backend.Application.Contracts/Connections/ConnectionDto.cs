using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Connections;

public class ConnectionDto : EntityDto<Guid>
{
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public ConnectionStatus Status { get; set; }
    public DateTime CreationTime { get; set; }
    public DateTime? LastModificationTime { get; set; }
}
