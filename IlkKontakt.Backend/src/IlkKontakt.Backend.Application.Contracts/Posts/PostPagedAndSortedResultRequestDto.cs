using System;
using Volo.Abp.Application.Dtos;

public class PostPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? CreatorUserId { get; set; }
    public DateTime? PublishDateStart { get; set; }
    public DateTime? PublishDateEnd { get; set; }
}