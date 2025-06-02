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

public class MessageAppService : ApplicationService, IMessageAppService
{
    private readonly IRepository<Message, Guid> _repository;

    public MessageAppService(IRepository<Message, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<MessageDto> GetAsync(Guid id)
    {
        var message = await _repository.GetAsync(id);
        return ObjectMapper.Map<Message, MessageDto>(message);
    }

    public async Task<PagedResultDto<MessageDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await _repository.GetQueryableAsync();
        var query = queryable
            .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? "CreationTime" : input.Sorting)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var messages = await AsyncExecuter.ToListAsync(query);
        var totalCount = await AsyncExecuter.CountAsync(queryable);

        return new PagedResultDto<MessageDto>(
            totalCount,
            ObjectMapper.Map<List<Message>, List<MessageDto>>(messages)
        );
    }

    public async Task<MessageDto> CreateAsync(CreateUpdateMessageDto input)
    {
        var message = ObjectMapper.Map<CreateUpdateMessageDto, Message>(input);
        await _repository.InsertAsync(message);
        return ObjectMapper.Map<Message, MessageDto>(message);
    }

    public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateMessageDto input)
    {
        var message = await _repository.GetAsync(id);
        ObjectMapper.Map(input, message);
        await _repository.UpdateAsync(message);
        return ObjectMapper.Map<Message, MessageDto>(message);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}

