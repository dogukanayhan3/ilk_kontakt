using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IlkKontakt.Backend.Notifications;
using IlkKontakt.Backend.Permissions; // Assuming this namespace exists
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Entities; // Required for EntityNotFoundException
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.Users;
// using Microsoft.EntityFrameworkCore; // No longer needed for FirstOrDefaultAsync here
using Volo.Abp.Linq; // Required for IAsyncQueryableExecuter (usually via ApplicationService base)
using Volo.Abp.Timing; // For IClock

namespace IlkKontakt.Backend.Posts // Match your namespace
{
    // [Authorize(BackendPermissions.Posts.Default)] // Uncomment when permissions are set up
    public class PostAppService : ApplicationService, IPostAppService // ApplicationService provides AsyncExecuter
    {
        private readonly IRepository<Post, Guid> _repository;
        private readonly IGuidGenerator _guidGenerator;
        private readonly IRepository<IdentityUser, Guid> _userRepository;
        private readonly IClock _clock;
        private readonly INotificationAppService _notificationAppService;
        
        public PostAppService(
            IRepository<Post, Guid> repository,
            IRepository<IdentityUser, Guid> userRepository,
            IGuidGenerator guidGenerator,
            IClock clock,
            INotificationAppService notificationAppService)  // Add this
        {
            _repository = repository;
            _guidGenerator = guidGenerator;
            _userRepository = userRepository;
            _clock = clock;
            _notificationAppService = notificationAppService;    // Assign here
        }

        public async Task<PostDto> GetAsync(Guid id)
        {
            // 1. Get the IQueryable with details
            var queryable = await _repository.WithDetailsAsync(p => p.UserComments);

            // 2. Apply the filter for the specific ID
            queryable = queryable.Where(p => p.Id == id);

            // 3. Execute the query asynchronously using AsyncExecuter
            var post = await AsyncExecuter.FirstOrDefaultAsync(queryable);

            if (post == null)
            {
                throw new EntityNotFoundException(typeof(Post), id);
            }

            // --- Mapping and Username Population Logic (Remains the same) ---
            var dto = ObjectMapper.Map<Post, PostDto>(post);
            var userIds = new HashSet<Guid> { post.CreatorUserId };
            userIds.UnionWith(post.UserComments.Select(c => c.UserId));
            var users = await GetUserDictionaryAsync(userIds);

            dto.CreatorUserId = post.CreatorUserId;
            if (users.TryGetValue(post.CreatorUserId, out var postOwnerUsername))
            {
                dto.UserName = postOwnerUsername;
            }
            else { dto.UserName = "<unknown>"; }

            foreach (var commentDto in dto.UserComments)
            {
                 if (users.TryGetValue(commentDto.UserId, out var commenterUsername))
                 { commentDto.UserName = commenterUsername; }
                 else { commentDto.UserName = "<unknown>"; }
            }
            dto.UserLikes = post.UserLikes;
            dto.NumberOfLikes = post.UserLikes.Count;
            // --- End Mapping ---

            return dto;
        }

        // GetListAsync remains the same as it correctly uses AsyncExecuter.ToListAsync/CountAsync

        public async Task<PagedResultDto<PostDto>> GetListAsync(
            PostPagedAndSortedResultRequestDto input)
        {
            // 1. Initial Query (Include Comments)
             var queryable = await _repository.WithDetailsAsync(p => p.UserComments);

            // 2. Apply Filtering
            queryable = queryable
                .WhereIf(input.CreatorUserId.HasValue, p => p.CreatorUserId == input.CreatorUserId)
                .WhereIf(input.PublishDateStart.HasValue, p => p.PublishDate >= input.PublishDateStart)
                .WhereIf(input.PublishDateEnd.HasValue, p => p.PublishDate <= input.PublishDateEnd);

            // 3. Apply Sorting
             queryable = queryable.OrderByDescending(p => p.PublishDate); // Example sort

            // 4. Get Total Count
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            // 5. Apply Paging
            queryable = queryable.Skip(input.SkipCount).Take(input.MaxResultCount);

            // 6. Execute Query
            var queryResult = await AsyncExecuter.ToListAsync(queryable);

            // 7. Map to DTOs
            var postDtos = ObjectMapper.Map<List<Post>, List<PostDto>>(queryResult);

            // --- Populate Usernames Efficiently (Remains the same) ---
            var userIds = new HashSet<Guid>();
            foreach (var post in queryResult)
            {
                userIds.Add(post.CreatorUserId);
                userIds.UnionWith(post.UserComments.Select(c => c.UserId));
            }
            var users = await GetUserDictionaryAsync(userIds);

            foreach (var dto in postDtos)
            {
                 var originalPost = queryResult.First(p => p.Id == dto.Id);
                 dto.CreatorUserId = originalPost.CreatorUserId;
                 if (users.TryGetValue(originalPost.CreatorUserId, out var postOwnerUsername))
                 { dto.UserName = postOwnerUsername; }
                 else { dto.UserName = "<unknown>"; }

                 foreach (var commentDto in dto.UserComments)
                 {
                     if (users.TryGetValue(commentDto.UserId, out var commenterUsername))
                     { commentDto.UserName = commenterUsername; }
                     else { commentDto.UserName = "<unknown>"; }
                 }
                 dto.UserLikes = originalPost.UserLikes;
                 dto.NumberOfLikes = originalPost.UserLikes.Count;
            }
            // --- End Populate Usernames ---

            return new PagedResultDto<PostDto>(totalCount, postDtos);
        }


        // Helper method remains the same
        private async Task<Dictionary<Guid, string>> GetUserDictionaryAsync(IEnumerable<Guid> userIds)
        {
            var distinctIds = userIds.Where(id => id != Guid.Empty).Distinct().ToList();
            if (!distinctIds.Any()) { return new Dictionary<Guid, string>(); }
            var users = await _userRepository.GetListAsync(u => distinctIds.Contains(u.Id));
            return users.ToDictionary(u => u.Id, u => u.UserName ?? "<no username>");
        }

        // CreateAsync remains the same
        public async Task<PostDto> CreateAsync(CreateUpdatePostDto input)
        {
            var post = ObjectMapper.Map<CreateUpdatePostDto, Post>(input);
            post.CreatorUserId = CurrentUser.GetId();
            post.PublishDate = _clock.Now;
            post = await _repository.InsertAsync(post, autoSave: true);
            var dto = ObjectMapper.Map<Post, PostDto>(post);
            dto.UserName = CurrentUser.UserName;
            dto.UserLikes = new List<Guid>();
            dto.NumberOfLikes = 0;
            dto.UserComments = new List<CommentDto>();
            return dto;
        }


        public async Task<PostDto> UpdateAsync(Guid id, CreateUpdatePostDto input)
        {
            // 1. Get the IQueryable with details
            var queryable = await _repository.WithDetailsAsync(p => p.UserComments);

            // 2. Apply the filter for the specific ID
            queryable = queryable.Where(p => p.Id == id);

            // 3. Execute the query asynchronously using AsyncExecuter
            var post = await AsyncExecuter.FirstOrDefaultAsync(queryable);

             if (post == null)
            {
                throw new EntityNotFoundException(typeof(Post), id);
            }

            // Authorization check (optional)
            // if (post.CreatorUserId != CurrentUser.GetId()) { ... }

            // Update content
            post.Content = input.Content;

            post = await _repository.UpdateAsync(post, autoSave: true);

            // --- Mapping and Username Population Logic (Remains the same) ---
            var dto = ObjectMapper.Map<Post, PostDto>(post);
            var userIds = new HashSet<Guid> { post.CreatorUserId };
            userIds.UnionWith(post.UserComments.Select(c => c.UserId));
            var users = await GetUserDictionaryAsync(userIds);

            dto.CreatorUserId = post.CreatorUserId;
            if (users.TryGetValue(post.CreatorUserId, out var postOwnerUsername))
            { dto.UserName = postOwnerUsername; }
            else { dto.UserName = "<unknown>"; }

            foreach (var commentDto in dto.UserComments)
            {
                 if (users.TryGetValue(commentDto.UserId, out var commenterUsername))
                 { commentDto.UserName = commenterUsername; }
                 else { commentDto.UserName = "<unknown>"; }
            }
            dto.UserLikes = post.UserLikes;
            dto.NumberOfLikes = post.UserLikes.Count;
            // --- End Mapping ---

            return dto;
        }

        // DeleteAsync remains the same
        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id, autoSave: true);
        }

        // LikeAsync remains the same
        public async Task LikeAsync(Guid postId, LikePostDto input)
        {
            var post = await _repository.GetAsync(postId);
            var currentUserId = CurrentUser.GetId();
            var postCreatorUserId = post.CreatorUserId;

            post.AddLike(currentUserId);
            await _repository.UpdateAsync(post, autoSave: true);

            // Send notification if the liker is not the owner
            if (postCreatorUserId != currentUserId)
            {
                var message = $"{CurrentUser.UserName} liked your post.";
                var notificationDto = new CreateNotificationDto
                {
                    UserId = postCreatorUserId,
                    Message = message,
                    Type = NotificationType.PostLiked
                };
                await _notificationAppService.CreateAsync(notificationDto);
            }
            
        }

        // UnlikeAsync remains the same
        public async Task UnlikeAsync(Guid postId, LikePostDto input)
        {
            var post = await _repository.GetAsync(postId);
            post.RemoveLike(CurrentUser.GetId());
            await _repository.UpdateAsync(post, autoSave: true);
        }

        // AddCommentAsync remains the same
        public async Task<CommentDto> AddCommentAsync(
            Guid postId,
            AddCommentDto input)
        {
            var post = await _repository.GetAsync(postId);
            var currentUserId = CurrentUser.GetId();
            var postCreatorUserId = post.CreatorUserId;
            
            var comment = post.AddComment(CurrentUser.GetId(), input.Content, _guidGenerator);
            await _repository.UpdateAsync(post, autoSave: true);
            
            if (postCreatorUserId != currentUserId)
            {
                var message = $"{CurrentUser.UserName} commented on your post.";
                var notificationDto = new CreateNotificationDto
                {
                    UserId = postCreatorUserId,
                    Message = message,
                    Type = NotificationType.PostCommented
                };
                await _notificationAppService.CreateAsync(notificationDto);
            }
            
            var commentDto = ObjectMapper.Map<Comment, CommentDto>(comment);
            commentDto.UserName = CurrentUser.UserName;
            return commentDto;
        }
    }
}
