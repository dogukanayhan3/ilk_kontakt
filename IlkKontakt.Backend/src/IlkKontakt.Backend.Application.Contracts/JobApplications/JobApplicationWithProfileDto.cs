using System;
using IlkKontakt.Backend.JobApplications;
using IlkKontakt.Backend.UserProfiles;

public class JobApplicationWithProfileDto
{
    public Guid ApplicationId { get; set; }
    public DateTime CreationTime { get; set; }
    public JobApplicationStatus Status { get; set; }
    public Guid ApplicantId { get; set; }

    // profile fields
    public string UserName      { get; set; }
    public string Email         { get; set; }
    public string PhoneNumber   { get; set; }

    // latest experience & education
    public ExperienceDto LatestExperience { get; set; }
    public EducationDto  LatestEducation  { get; set; }
}