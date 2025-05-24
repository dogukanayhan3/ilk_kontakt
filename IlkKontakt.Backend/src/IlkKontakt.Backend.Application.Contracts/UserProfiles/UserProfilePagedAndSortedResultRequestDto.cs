using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class UserProfilePagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto
{
    public Guid? UserId { get; set; }
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
}