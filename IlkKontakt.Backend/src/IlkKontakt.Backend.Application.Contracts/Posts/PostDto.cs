using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Posts;

// PostDto.cs
public class PostDto : AuditedEntityDto<Guid>
{
    public Guid CreatorUserId { get; set; }
    public string UserName { get; set; }
    
    public string Content { get; set; }
    public IReadOnlyCollection<Guid> UserLikes { get; set; }
    public int NumberOfLikes { get; set; }
    public IReadOnlyCollection<CommentDto> UserComments { get; set; }
    
    public DateTime PublishDate { get; set; }
}
