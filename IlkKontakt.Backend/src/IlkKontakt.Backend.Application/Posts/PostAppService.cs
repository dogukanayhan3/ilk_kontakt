using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using IlkKontakt.Backend.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Authorization;
using Volo.Abp.Users;

namespace IlkKontakt.Backend.Posts;

[Authorize(BackendPermissions.Posts.Default)]
public class PostAppService : ApplicationService, IPostAppService
{
    private readonly IRepository<Post, Guid> _repository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;

    public PostAppService(
        IRepository<Post, Guid> repository,
        IRepository<IdentityUser, Guid> userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<PostDto> GetAsync(Guid id)
    {
        var post = await _repository.GetAsync(id);
        return ObjectMapper.Map<Post, PostDto>(post);
    }

    public async Task<PagedResultDto<PostDto>> GetListAsync(PostPagedAndSortedResultRequestDto input)
    {
        IQueryable<Post> queryable = await _repository.GetQueryableAsync();

        var query = from post in queryable
                    select new { post };

        if (input.CreatorUserId != null)
        {
            query = query.Where(x => x.post.CreatorUserId == input.CreatorUserId);
        }
        
        if (input.PublishDateStart.HasValue)
        {
            query = query.Where(x => x.post.PublishDate >= input.PublishDateStart.Value);
        }

        if (input.PublishDateEnd.HasValue)
        {
            query = query.Where(x => x.post.PublishDate <= input.PublishDateEnd.Value);
        }

        var totalCount = await AsyncExecuter.CountAsync(query);

        if (!string.IsNullOrWhiteSpace(input.Sorting))
        {
            query = input.Sorting switch
            {
                "PublishDate DESC" => query.OrderByDescending(x => x.post.PublishDate),
                "PublishDate" => query.OrderBy(x => x.post.PublishDate),
                "NumberOfLikes DESC" => query.OrderByDescending(x => x.post.NumberOfLikes),
                "NumberOfLikes" => query.OrderBy(x => x.post.NumberOfLikes),
                _ => query.OrderByDescending(x => x.post.PublishDate),
            };
        }
        else
        {
            query = query.OrderByDescending(x => x.post.PublishDate);
        }

        query = query
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var queryResult = await AsyncExecuter.ToListAsync(query);

        var posts = queryResult.Select(x =>
        {
            var postDto = ObjectMapper.Map<Post, PostDto>(x.post);
            return postDto;
        }).ToList();

        return new PagedResultDto<PostDto>(totalCount, posts);
    }

    [Authorize(BackendPermissions.Posts.Create)]
    public async Task<PostDto> CreateAsync(CreateUpdatePostDto input)
    {
        var entity = ObjectMapper.Map<CreateUpdatePostDto, Post>(input);
        entity.CreatorUserId = CurrentUser.Id ?? throw new UserFriendlyException("User not authenticated");
        entity.PublishDate = DateTime.UtcNow;
        entity.NumberOfLikes = 0;
        entity = await _repository.InsertAsync(entity, autoSave: true);
        return ObjectMapper.Map<Post, PostDto>(entity);
    }


    [Authorize(BackendPermissions.Posts.Edit)]
    public async Task<PostDto> UpdateAsync(Guid id, CreateUpdatePostDto input)
    {
        var entity = await _repository.GetAsync(id);
        ObjectMapper.Map(input, entity);
        entity = await _repository.UpdateAsync(entity, autoSave: true);
        return ObjectMapper.Map<Post, PostDto>(entity);
    }

    [Authorize(BackendPermissions.Posts.Delete)]
    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}
