using System;
using System.Linq;
using System.Threading.Tasks;
using IlkKontakt.Backend.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Posts
{
    // [Authorize(BackendPermissions.Posts.Default)]
    public class PostAppService : ApplicationService, IPostAppService
    {
        private readonly IRepository<Post, Guid> _repository;
        private readonly IGuidGenerator _guidGenerator;

        public PostAppService(
            IRepository<Post, Guid> repository,
            IGuidGenerator guidGenerator)
        {
            _repository = repository;
            _guidGenerator = guidGenerator;
        }

        public async Task<PostDto> GetAsync(Guid id)
        {
            var post = await _repository.GetAsync(id);
            return ObjectMapper.Map<Post, PostDto>(post);
        }

        public async Task<PagedResultDto<PostDto>> GetListAsync(
            PostPagedAndSortedResultRequestDto input)
        {
            var queryable = await _repository.GetQueryableAsync();

            // Project
            var query = from post in queryable
                        select new { post };

            // Filters
            if (input.CreatorUserId.HasValue)
            {
                query = query.Where(x => x.post.CreatorUserId == input.CreatorUserId.Value);
            }

            if (input.PublishDateStart.HasValue)
            {
                query = query.Where(x => x.post.PublishDate >= input.PublishDateStart.Value);
            }

            if (input.PublishDateEnd.HasValue)
            {
                query = query.Where(x => x.post.PublishDate <= input.PublishDateEnd.Value);
            }

            // Count
            var totalCount = await AsyncExecuter.CountAsync(query);

            // Sorting
            if (!string.IsNullOrWhiteSpace(input.Sorting))
            {
                query = input.Sorting switch
                {
                    "PublishDate DESC"    => query.OrderByDescending(x => x.post.PublishDate),
                    "PublishDate"         => query.OrderBy(x => x.post.PublishDate),
                    "NumberOfLikes DESC"  => query.OrderByDescending(x => x.post.NumberOfLikes),
                    "NumberOfLikes"       => query.OrderBy(x => x.post.NumberOfLikes),
                    _                      => query.OrderByDescending(x => x.post.PublishDate),
                };
            }
            else
            {
                query = query.OrderByDescending(x => x.post.PublishDate);
            }

            // Paging
            query = query
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            var queryResult = await AsyncExecuter.ToListAsync(query);

            // Map to DTOs
            var posts = queryResult
                .Select(x => ObjectMapper.Map<Post, PostDto>(x.post))
                .ToList();

            return new PagedResultDto<PostDto>(totalCount, posts);
        }

        // [Authorize(BackendPermissions.Posts.Create)]
        public async Task<PostDto> CreateAsync(CreateUpdatePostDto input)
        {
            var post = ObjectMapper.Map<CreateUpdatePostDto, Post>(input);
            post.CreatorUserId = CurrentUser.GetId();
            post.PublishDate   = DateTime.UtcNow;

            post = await _repository.InsertAsync(post, autoSave: true);

            return ObjectMapper.Map<Post, PostDto>(post);
        }

        // [Authorize(BackendPermissions.Posts.Edit)]
        public async Task<PostDto> UpdateAsync(Guid id, CreateUpdatePostDto input)
        {
            var post = await _repository.GetAsync(id);
            ObjectMapper.Map(input, post);
            post = await _repository.UpdateAsync(post, autoSave: true);
            return ObjectMapper.Map<Post, PostDto>(post);
        }

        // [Authorize(BackendPermissions.Posts.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        // --- Dedicated Like / Unlike / AddComment methods ---

        public async Task LikeAsync(Guid postId, LikePostDto input)
        {
            var post = await _repository.GetAsync(postId);
            post.AddLike(CurrentUser.GetId());
            await _repository.UpdateAsync(post, autoSave: true);
        }

        public async Task UnlikeAsync(Guid postId, LikePostDto input)
        {
            var post = await _repository.GetAsync(postId);
            post.RemoveLike(CurrentUser.GetId());
            await _repository.UpdateAsync(post, autoSave: true);
        }

        public async Task<CommentDto> AddCommentAsync(
            Guid postId,
            AddCommentDto input)
        {
            var post = await _repository.GetAsync(postId);

            var comment = post.AddComment(
                CurrentUser.GetId(),
                input.Content,
                _guidGenerator);

            await _repository.UpdateAsync(post, autoSave: true);

            return ObjectMapper.Map<Comment, CommentDto>(comment);
        }
    }
}
