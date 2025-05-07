using System;
using System.Threading.Tasks;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Posts;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Identity.Settings;

namespace IlkKontakt.Backend;

public class BackendDataSeederContributor
    : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<Post, Guid> _postRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;
    public BackendDataSeederContributor(
        IRepository<Book, Guid> bookRepository,
        IRepository<Post, Guid> postRepository,
        IRepository<IdentityUser, Guid> userRepository
        )

    {
        _bookRepository = bookRepository;
        _postRepository = postRepository;
        _userRepository = userRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _bookRepository.GetCountAsync() <= 0)
        {
            await _bookRepository.InsertAsync(
                new Book
                {
                    Name = "1984",
                    Type = BookType.Dystopia,
                    PublishDate = new DateTime(1949, 6, 8),
                    Price = 19.84f
                },
                autoSave: true
            );

            await _bookRepository.InsertAsync(
                new Book
                {
                    Name = "The Hitchhiker's Guide to the Galaxy",
                    Type = BookType.ScienceFiction,
                    PublishDate = new DateTime(1995, 9, 27),
                    Price = 42.0f
                },
                autoSave: true
            );
        }
    }
}