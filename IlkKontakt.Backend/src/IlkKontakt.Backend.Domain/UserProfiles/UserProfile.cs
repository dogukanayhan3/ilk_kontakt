using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Profile;

public class Profile : AuditedEntity<Guid>
{
    public Guid UserId { get; set; }
    public string About { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public string ProfilePictureUrl { get; set; }
    public DateTime Birthday { get; set; }
}