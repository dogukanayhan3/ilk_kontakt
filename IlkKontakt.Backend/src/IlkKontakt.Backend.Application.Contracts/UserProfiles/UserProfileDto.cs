using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.UserProfiles;

public class UserProfileDto : AuditedEntityDto<Guid>
{
    public Guid UserId { get; set; }
    public string About { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string ProfilePictureUrl { get; set; }
    public DateTime Birthday { get; set; }
}