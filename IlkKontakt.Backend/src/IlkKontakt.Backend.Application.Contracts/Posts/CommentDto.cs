using System;
using Volo.Abp.Application.Dtos;

public class CommentDto : AuditedEntityDto<Guid>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; }
    public DateTime CreationTime { get; set; }
}