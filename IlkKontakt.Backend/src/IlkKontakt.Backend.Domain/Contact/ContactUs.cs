using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace IlkKontakt.Backend.ContactUss;

public class ContactUs : AuditedAggregateRoot<Guid>
{
    public Guid contact_id { get; set; }
    public string name { get; set; }

    public string email { get; set; }

    public string message { get; set; }
}
