using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using IlkKontakt.Backend.Permissions;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using System.Linq.Dynamic.Core;

namespace IlkKontakt.Backend.Chat;

public class ChatSessionAppService : ApplicationService, IChatSessionAppService
{
    private readonly IRepository<ChatSession, Guid> _repository;

    public ChatSessionAppService(IRepository<ChatSession, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<ChatSessionDto> GetAsync(Guid id)
    {
        var session = await _repository.GetAsync(id);
        return ObjectMapper.Map<ChatSession, ChatSessionDto>(session);
    }

    public async Task<PagedResultDto<ChatSessionDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await _repository.GetQueryableAsync();
        var query = queryable
            .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? "StartedAt" : input.Sorting)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var sessions = await AsyncExecuter.ToListAsync(query);
        var totalCount = await AsyncExecuter.CountAsync(queryable);

        return new PagedResultDto<ChatSessionDto>(
            totalCount,
            ObjectMapper.Map<List<ChatSession>, List<ChatSessionDto>>(sessions)
        );
    }

    public async Task<ChatSessionDto> CreateAsync(CreateUpdateChatSessionDto input)
    {
        var session = ObjectMapper.Map<CreateUpdateChatSessionDto, ChatSession>(input);
        await _repository.InsertAsync(session);
        return ObjectMapper.Map<ChatSession, ChatSessionDto>(session);
    }

    public async Task<ChatSessionDto> UpdateAsync(Guid id, CreateUpdateChatSessionDto input)
    {
        var session = await _repository.GetAsync(id);
        ObjectMapper.Map(input, session);
        await _repository.UpdateAsync(session);
        return ObjectMapper.Map<ChatSession, ChatSessionDto>(session);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}

