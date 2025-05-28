using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.Contact;

public class ContactUsDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Message { get; set; }
}

