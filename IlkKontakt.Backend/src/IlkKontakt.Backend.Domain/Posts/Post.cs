using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Posts;

public class Post : AuditedAggregateRoot<Guid>
{
    public Guid CreatorUserId { get; set; }
    public string Content { get; set; }
    public int NumberOfLikes { get; set; } = 0;
    public DateTime PublishDate { get; set; } = DateTime.UtcNow;
}