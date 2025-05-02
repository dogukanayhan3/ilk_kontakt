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

        /*if (await _postRepository.GetCountAsync() <= 0)
        {
            var adminUser = await _userRepository.FirstOrDefaultAsync(u => u.UserName == "admin");
            var demoUser = await _userRepository.FirstOrDefaultAsync(u => u.UserName == "demo");
            var guestUser = await _userRepository.FirstOrDefaultAsync(u => u.UserName == "guest");

            if (adminUser != null)
            {
                await _postRepository.InsertAsync(
                    new Post
                    {
                        CreatorUserId = adminUser.Id,
                        Content = "Filler cok yalniz...",
                        NumberOfLikes = 45,
                        PublishDate = DateTime.UtcNow.AddDays(-2)
                    },
                    autoSave: true
                );
            }

            if (demoUser != null)
            {
                await _postRepository.InsertAsync(
                    new Post
                    {
                        CreatorUserId = demoUser.Id,
                    Content = "issiz kalmka mi uzereyiz genjler????!?!?!?!",
                        NumberOfLikes = 12,
                        PublishDate = DateTime.UtcNow.AddDays(-1)
                    },
                    autoSave: true
                );
            }

            if (guestUser != null)
            {
                await _postRepository.InsertAsync(
                    new Post
                    {
                        CreatorUserId = guestUser.Id,
                        Content = "Merhaba, bu platformu yeni kesfettim. (ben bi npcyim)",
                        NumberOfLikes = 3,
                        PublishDate = DateTime.UtcNow
                    },
                    autoSave: true
                );
            }

        }*/
    }
}