using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Posts;

// PostDto.cs
public class PostDto : AuditedEntityDto<Guid>
{
    public string Content { get; set; }
    public IReadOnlyCollection<Guid> UserLikes { get; set; }
    public int NumberOfLikes { get; set; }
    public IReadOnlyCollection<CommentDto> UserComments { get; set; }
    public DateTime PublishDate { get; set; }
}
