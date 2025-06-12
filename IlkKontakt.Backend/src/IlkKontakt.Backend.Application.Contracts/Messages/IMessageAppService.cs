using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using System.Threading.Tasks;

namespace IlkKontakt.Backend.Messages;

public interface IMessageAppService :
    ICrudAppService<
        MessageDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateMessageDto>
{
    /// <summary>
    /// Gets all messages for a specific connection, sorted by creation time (oldest to newest)
    /// </summary>
    Task<List<MessageDto>> GetConversationAsync(GetMessagesInput input);
}