using System;
using Volo.Abp.Application.Dtos;

namespace IlkKontakt.Backend.ContactUss;

public class ContactUsDto : EntityDto<Guid>
{
    public Guid contact_id { get; set; }
    public string name { get; set; }
    public string email { get; set; }
    public string message { get; set; }
}

