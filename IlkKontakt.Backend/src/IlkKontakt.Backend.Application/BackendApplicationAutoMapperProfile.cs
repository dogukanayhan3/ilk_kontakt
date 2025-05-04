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
        
        CreateMap<Post, PostDto>()
            .ForMember(d => d.UserLikes,
                opt => opt.MapFrom(s => s.UserLikes))
            .ForMember(d => d.NumberOfLikes,
                opt => opt.MapFrom(s => s.NumberOfLikes))
            .ForMember(d => d.UserComments,
                opt => opt.MapFrom(s => s.UserComments));

        CreateMap<CreateUpdatePostDto, Post>()
            .ForMember(d => d.UserLikes,    // clears likes on a create/update
                opt => opt.Ignore())
            .ForMember(d => d.UserComments,
                opt => opt.Ignore());

        CreateMap<Comment, CommentDto>();
    }
}
