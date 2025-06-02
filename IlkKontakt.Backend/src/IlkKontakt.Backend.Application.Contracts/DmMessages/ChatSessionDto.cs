using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Chat;

public class ChatSessionDto : AuditedEntityDto<Guid>
{
    public Guid User1Id { get; set; }

    public Guid User2Id { get; set; }

    public DateTime StartedAt { get; set; }

    // Opsiyonel: Chat içindeki mesajlar da DTO içinde dönebilir
    public List<MessageDto> Messages { get; set; }
}

