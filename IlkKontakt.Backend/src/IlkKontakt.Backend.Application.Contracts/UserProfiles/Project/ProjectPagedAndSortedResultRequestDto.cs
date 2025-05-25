using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles
{
    public class ProjectPagedAndSortedResultRequestDto
        : PagedAndSortedResultRequestDto
    {
        public Guid? ProfileId { get; set; }
        public string? ProjectName { get; set; }
        public DateTime? EarliestStartDate { get; set; }
        public DateTime? LatestStartDate { get; set; }
        public DateTime? EarliestEndDate { get; set; }
        public DateTime? LatestEndDate { get; set; }
    }
}