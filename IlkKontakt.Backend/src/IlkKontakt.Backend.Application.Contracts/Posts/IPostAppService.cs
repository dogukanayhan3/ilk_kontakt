using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Posts;

public interface IPostAppService : IApplicationService
{
    Task<PostDto> GetAsync(Guid id);
    Task<PagedResultDto<PostDto>> GetListAsync(PostPagedAndSortedResultRequestDto input);
    Task<PostDto> CreateAsync(CreateUpdatePostDto input);
    Task<PostDto> UpdateAsync(Guid id, CreateUpdatePostDto input);
    Task DeleteAsync(Guid id);

    // new operations
    Task LikeAsync(Guid postId, LikePostDto input);
    Task UnlikeAsync(Guid postId, LikePostDto input);
    Task<CommentDto> AddCommentAsync(Guid postId, AddCommentDto input);
}
