using System;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Posts;

public interface IPostAppService :
    ICrudAppService<PostDto, Guid, PostPagedAndSortedResultRequestDto, CreateUpdatePostDto>
    
{
    
}