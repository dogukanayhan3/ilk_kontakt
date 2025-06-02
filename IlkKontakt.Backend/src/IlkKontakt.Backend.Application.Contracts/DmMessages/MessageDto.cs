using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Chat;

public class MessageDto : AuditedEntityDto<Guid>
{
    public Guid ChatSessionId { get; set; }

    public Guid SenderId { get; set; }

    public string Content { get; set; }
}

