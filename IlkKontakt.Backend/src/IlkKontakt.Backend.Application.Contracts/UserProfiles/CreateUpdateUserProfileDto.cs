using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles;

public class CreateUpdateUserProfileDto
{
    public string? About { get; set; }
    [Required]
    public string Email { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string UserName { get; set; }
    [Required]
    public string PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime? Birthday { get; set; }
}