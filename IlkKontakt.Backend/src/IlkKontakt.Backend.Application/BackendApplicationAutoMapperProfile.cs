using AutoMapper;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Posts;

namespace IlkKontakt.Backend;

public class BackendApplicationAutoMapperProfile : Profile
{
    public BackendApplicationAutoMapperProfile()
    {
        CreateMap<Book, BookDto>();
        CreateMap<CreateUpdateBookDto, Book>();
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
        
        CreateMap<Post, PostDto>();
        CreateMap<CreateUpdatePostDto, Post>();
    }
}
