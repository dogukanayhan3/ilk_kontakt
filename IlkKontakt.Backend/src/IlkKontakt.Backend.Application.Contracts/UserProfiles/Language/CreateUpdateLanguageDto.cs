using System;
using System.ComponentModel.DataAnnotations;

namespace IlkKontakt.Backend.UserProfiles.Language;

public class CreateUpdateLanguageDto
{
    public Guid ProfileId { get; set; }
    [Required]
    public string LanguageName { get; set; }
    [Required]
    public LanguageProficiency LanguageProficiency { get; set; }
}