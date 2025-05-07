using System;
using System.Threading.Tasks;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Posts;
using IlkKontakt.Backend.UserProfiles;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace IlkKontakt.Backend;

public class BackendDataSeederContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<Post, Guid> _postRepository;
    private readonly IRepository<IdentityUser, Guid> _userRepository;
    private readonly IRepository<UserProfile, Guid> _profileRepository;
    private readonly IRepository<Experience, Guid> _experienceRepository;

    public BackendDataSeederContributor(
        IRepository<Book, Guid> bookRepository,
        IRepository<Post, Guid> postRepository,
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<UserProfile, Guid> profileRepository,
        IRepository<Experience, Guid> experienceRepository)
    {
        _bookRepository = bookRepository;
        _postRepository = postRepository;
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _experienceRepository = experienceRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        // Existing book seeding code
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

        // Seed Profile and Experience
        await SeedProfileAndExperienceAsync();
    }

    private async Task SeedProfileAndExperienceAsync()
    {
        // Check if profiles already exist
        if (await _profileRepository.GetCountAsync() > 0)
        {
            return;
        }

        // Get a user from the system
        var user = await _userRepository.FirstOrDefaultAsync();
        if (user == null)
        {
            return;
        }

        // Create profile
        var profile = await _profileRepository.InsertAsync(
            new UserProfile
            {
                UserId = user.Id,
                About = "Experienced software developer with a passion for technology",
                Email = user.Email,
                PhoneNumber = "+1234567890",
                Address = "123 Tech Street, Silicon Valley, CA",
                ProfilePictureUrl = "https://example.com/profile.jpg",
                Birthday = new DateTime(1990, 1, 1)
            },
            autoSave: true
        );

        // Create experiences
        await _experienceRepository.InsertAsync(
            new Experience
            {
                ProfileId = profile.Id,
                Title = "Senior Software Engineer",
                CompanyName = "Tech Giants Inc.",
                Location = "San Francisco, CA",
                StartDate = new DateTime(2020, 1, 1),
                EndDate = null,
                IsCurrentPosition = true,
                Description = "• Led development of cloud-native applications\n" +
                            "• Managed team of 5 developers\n" +
                            "• Implemented CI/CD pipelines",
                EmploymentType = EmploymentType.FullTime
            },
            autoSave: true
        );

        await _experienceRepository.InsertAsync(
            new Experience
            {
                ProfileId = profile.Id,
                Title = "Software Engineer",
                CompanyName = "Innovation Labs",
                Location = "Remote",
                StartDate = new DateTime(2018, 1, 1),
                EndDate = new DateTime(2019, 12, 31),
                IsCurrentPosition = false,
                Description = "• Developed microservices architecture\n" +
                            "• Implemented RESTful APIs\n" +
                            "• Optimized database performance",
                EmploymentType = EmploymentType.FullTime
            },
            autoSave: true
        );

        await _experienceRepository.InsertAsync(
            new Experience
            {
                ProfileId = profile.Id,
                Title = "Junior Developer",
                CompanyName = "StartUp Co",
                Location = "New York, NY",
                StartDate = new DateTime(2016, 6, 1),
                EndDate = new DateTime(2017, 12, 31),
                IsCurrentPosition = false,
                Description = "• Full-stack development\n" +
                            "• Bug fixing and maintenance\n" +
                            "• Agile development practices",
                EmploymentType = EmploymentType.FullTime
            },
            autoSave: true
        );
    }
}
