using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.Contact;

public class ContactUs : AuditedAggregateRoot<Guid>
{
    public string Name { get; set; }

    public string Email { get; set; }

    public string Message { get; set; }
}
