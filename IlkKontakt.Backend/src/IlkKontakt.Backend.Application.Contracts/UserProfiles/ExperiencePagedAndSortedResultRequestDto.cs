using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class ExperiencePagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? ProfileId { get; set; }
    public string? Title { get; set; }
    public string? CompanyName { get; set; }
    public EmploymentType? EmploymentType { get; set; }
}