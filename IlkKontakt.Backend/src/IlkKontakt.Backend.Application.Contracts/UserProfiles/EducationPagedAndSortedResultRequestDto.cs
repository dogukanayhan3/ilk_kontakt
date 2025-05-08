using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class EducationPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? ProfileId { get; set; }
    public String? InstutionName { get; set; }
    public EducationDegree? Degree { get; set; }
    public DateTime? EarliestStartDate { get; set; }
    public DateTime? EarliestEndDate { get; set; }
    public DateTime? LatestStartDate { get; set; }
    public DateTime? LatestEndDate { get; set; }
    public float? MinimumGPA { get; set; }
    public float? MaximumGPA { get; set; }
}