using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Posts;

public class Posts : AuditedAggregateRoot<Guid>
{
    public Guid CreatorUserId { get; set; }
    public string Content { get; set; }
    public int NumberOfLikes { get; set; }
    public DateTime PublishDate { get; set; }
}