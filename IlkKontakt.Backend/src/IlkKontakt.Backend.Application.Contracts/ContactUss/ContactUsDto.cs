using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.ContactUs;

public class ContactUsDto : AuditedAggregateRoot<Guid>
{
    public Guid ContactId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Message { get; set; }
}

