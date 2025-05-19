using System;

namespace IlkKontakt.Backend.UserProfiles;

public class CreateUpdateEducationDto
{
    public Guid ProfileId { get; set; }
    public String InstutionName { get; set; }
    public EducationDegree Degree { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public float? GPA { get; set; }
    public String? Description { get; set; }
}