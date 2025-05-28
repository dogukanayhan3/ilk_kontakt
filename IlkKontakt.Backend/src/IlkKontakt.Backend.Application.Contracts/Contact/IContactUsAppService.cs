using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Contact;

public interface IContactUsAppService :
    ICrudAppService< // CRUD metotlarını tanımlar
        ContactUsDto, // Verileri dışa aktarmak için kullanılır
        Guid, // ContactUs entity'sinin primary key tipi
        PagedAndSortedResultRequestDto, // Sayfalama ve sıralama için kullanılır
        CreateUpdateContactUsDto> // Oluşturma/güncelleme işlemleri için kullanılır
{

}

