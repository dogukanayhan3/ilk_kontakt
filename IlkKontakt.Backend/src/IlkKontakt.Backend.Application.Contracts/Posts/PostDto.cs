using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Posts;

public class PostDto : AuditedEntityDto<Guid>
{
    public Guid CreatorUserId { get; set; }
    
    public string Content { get; set; }
    
    public int NumberOfLikes { get; set; }
    
    public DateTime PublishDate { get; set; }
}