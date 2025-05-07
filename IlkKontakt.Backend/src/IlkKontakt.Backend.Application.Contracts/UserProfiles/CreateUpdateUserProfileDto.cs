using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles;

public class CreateUpdateUserProfileDto
{
    [Required]
    public Guid UserId { get; set; }
    public string? About { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public string PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? ProfilePictureUrl { get; set; }
    [Required]
    public DateTime Birthday { get; set; }
}