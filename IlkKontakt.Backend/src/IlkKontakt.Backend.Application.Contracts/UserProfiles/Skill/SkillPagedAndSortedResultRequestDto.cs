using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles
{
    public class SkillPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
    {
        public Guid? ProfileId { get; set; }
        public string? SkillName { get; set; }
        public SkillProficiency? SkillProficiency { get; set; }
    }
}