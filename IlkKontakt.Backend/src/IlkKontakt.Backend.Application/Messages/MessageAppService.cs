using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Messages
{
    public class MessageAppService : CrudAppService<Message, MessageDto, Guid, PagedAndSortedResultRequestDto, CreateMessageDto>, IMessageAppService
    {
        private readonly ICurrentUser _currentUser;

        public MessageAppService(
            IRepository<Message, Guid> repository,
            ICurrentUser currentUser) : base(repository)
        {
            _currentUser = currentUser;
        }

        public override async Task<MessageDto> CreateAsync(CreateMessageDto input)
        {
            var senderId = _currentUser.GetId();
            
            var message = new Message(input.ConnectionId, senderId, input.Text);
            await Repository.InsertAsync(message);
            
            return ObjectMapper.Map<Message, MessageDto>(message);
        }

        /// <inheritdoc />
        public async Task<List<MessageDto>> GetConversationAsync(GetMessagesInput input)
        {
            var query = await Repository.GetQueryableAsync();
            query = query.Where(m => m.ConnectionId == input.ConnectionId)
                         .OrderBy(m => m.CreationTime);
            
            var messages = await AsyncExecuter.ToListAsync(query);
            return ObjectMapper.Map<List<Message>, List<MessageDto>>(messages);
        }

        protected override async Task<IQueryable<Message>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
        {
            var query = await Repository.GetQueryableAsync();
            return query;
        }
    }
}