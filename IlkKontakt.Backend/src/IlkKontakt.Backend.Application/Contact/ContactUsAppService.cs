using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using System.Linq.Dynamic.Core;

namespace IlkKontakt.Backend.Contact;

public class ContactUsAppService : ApplicationService, IContactUsAppService
{
    private readonly IRepository<ContactUs, Guid> _repository;

    public ContactUsAppService(IRepository<ContactUs, Guid> repository)
    {
        _repository = repository;
    }

    public async Task<ContactUsDto> GetAsync(Guid id)
    {
        var contact = await _repository.GetAsync(id);
        return ObjectMapper.Map<ContactUs, ContactUsDto>(contact);
    }

    public async Task<PagedResultDto<ContactUsDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await _repository.GetQueryableAsync();
        var query = queryable
            .OrderBy(input.Sorting.IsNullOrWhiteSpace() ? "name" : input.Sorting)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

        var contacts = await AsyncExecuter.ToListAsync(query);
        var totalCount = await AsyncExecuter.CountAsync(queryable);

        return new PagedResultDto<ContactUsDto>(
            totalCount,
            ObjectMapper.Map<List<ContactUs>, List<ContactUsDto>>(contacts)
        );
    }

    public async Task<ContactUsDto> CreateAsync(CreateUpdateContactUsDto input)
    {
        var contact = ObjectMapper.Map<CreateUpdateContactUsDto, ContactUs>(input);
        await _repository.InsertAsync(contact);
        return ObjectMapper.Map<ContactUs, ContactUsDto>(contact);
    }

    public async Task<ContactUsDto> UpdateAsync(Guid id, CreateUpdateContactUsDto input)
    {
        var contact = await _repository.GetAsync(id);
        ObjectMapper.Map(input, contact);
        await _repository.UpdateAsync(contact);
        return ObjectMapper.Map<ContactUs, ContactUsDto>(contact);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
    }
}

