using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Chat;

public interface IChatSessionAppService :
    ICrudAppService< // Defines CRUD methods
        ChatSessionDto, // Used to show chat sessions
        Guid, // Primary key of the chat session entity
        PagedAndSortedResultRequestDto, // Used for paging/sorting
        CreateUpdateChatSessionDto> // Used to create/update a chat session
{
}

