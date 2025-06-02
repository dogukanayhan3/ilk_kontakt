using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace IlkKontakt.Backend.Chat;

public interface IMessageAppService :
    ICrudAppService< // CRUD işlemlerini tanımlar
        MessageDto, // Mesajları göstermek için kullanılır
        Guid, // Message entity'nin primary key tipi
        PagedAndSortedResultRequestDto, // Sayfalama ve sıralama için kullanılır
        CreateUpdateMessageDto> // Mesaj oluşturma/güncelleme için kullanılır
{
}

