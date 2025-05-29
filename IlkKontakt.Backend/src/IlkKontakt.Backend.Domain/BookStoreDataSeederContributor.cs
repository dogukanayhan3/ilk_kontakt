using System;
using System.Threading.Tasks;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.JobListings;
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
    private readonly IRepository<Education, Guid> _educationRepository;
    private readonly IRepository<JobListing, Guid> _joblistingRepository;

    public BackendDataSeederContributor(
        IRepository<Book, Guid> bookRepository,
        IRepository<Post, Guid> postRepository,
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<UserProfile, Guid> profileRepository,
        IRepository<Experience, Guid> experienceRepository,
        IRepository<Education, Guid> educationRepository,
        IRepository<JobListing, Guid> joblistingRepository)
    {
        _bookRepository = bookRepository;
        _postRepository = postRepository;
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _experienceRepository = experienceRepository;
        _educationRepository = educationRepository;
        _joblistingRepository = joblistingRepository;
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

        await SeedJobListingsAsync();
    }

    private async Task SeedJobListingsAsync()
    {
        if (await _joblistingRepository.GetCountAsync() > 0)
        {
            return;
        }
        
        var jobListings = new[]
            {
                new JobListing
                {
                    Title = "Senior Frontend Developer",
                    Company = "TechCorp İstanbul",
                    Description = @"Dinamik ve yenilikçi ekibimize katılacak deneyimli bir Senior Frontend Developer arıyoruz. 

                        Aranan Nitelikler:
                        • 5+ yıl React.js deneyimi
                        • TypeScript ile güçlü deneyim
                        • Modern CSS framework'leri (Tailwind, Styled Components)
                        • RESTful API entegrasyonu deneyimi
                        • Git ve Agile metodolojileri bilgisi
                        • Responsive ve mobile-first tasarım anlayışı

                        Sunduklarımız:
                        • Rekabetçi maaş paketi
                        • Esnek çalışma saatleri
                        • Uzaktan çalışma imkanı
                        • Kişisel gelişim bütçesi
                        • Sağlık sigortası
                        • Modern ofis ortamı

                        Projelerimizde React, TypeScript, Next.js ve modern frontend teknolojilerini kullanıyoruz. Kullanıcı deneyimini ön planda tutan, performans odaklı uygulamalar geliştiriyoruz.",
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    WorkType = WorkType.Hybrid,
                    Location = "İstanbul, Türkiye",
                    ExternalUrl = "https://techcorp.com/careers/senior-frontend-developer"
                },
                
                new JobListing
                {
                    Title = "Backend Developer (Node.js)",
                    Company = "StartupHub Ankara",
                    Description = @"Hızla büyüyen fintech startup'ımızda backend geliştirme ekibimizi güçlendirmek için Backend Developer arıyoruz.

                        Aranan Nitelikler:
                        • 3+ yıl Node.js deneyimi
                        • Express.js framework bilgisi
                        • MongoDB veya PostgreSQL deneyimi
                        • RESTful API tasarımı ve geliştirimi
                        • Docker ve containerization bilgisi
                        • AWS veya Azure cloud platformları deneyimi
                        • Mikroservis mimarisi anlayışı

                        Artı Değer:
                        • GraphQL deneyimi
                        • Redis cache sistemleri
                        • CI/CD pipeline kurulumu
                        • Kubernetes bilgisi

                        Sunduklarımız:
                        • Startup equity programı
                        • Tam uzaktan çalışma
                        • Teknoloji konferansları için destek
                        • Ücretsiz öğle yemeği (ofiste)
                        • Oyun odası ve dinlenme alanları

                        Finansal teknoloji alanında yenilikçi çözümler geliştiren ekibimizle birlikte çalışma fırsatı!",
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    WorkType = WorkType.Remote,
                    Location = "Ankara, Türkiye",
                    ExternalUrl = ""
                },
                
                new JobListing
                {
                    Title = "Software Engineering Intern",
                    Company = "Global Tech Solutions",
                    Description = @"Yazılım geliştirme alanında kariyer yapmak isteyen üniversite öğrencileri için staj programımız başlıyor!

                            Program Detayları:
                            • 6 aylık tam zamanlı staj programı
                            • Mentörlük desteği
                            • Gerçek projelerde çalışma fırsatı
                            • Eğitim ve workshop'lar
                            • Staj sonrası tam zamanlı iş fırsatı

                            Aranan Nitelikler:
                            • Bilgisayar Mühendisliği veya ilgili bölüm öğrencisi
                            • En az 2. sınıf öğrencisi
                            • Temel programlama bilgisi (Java, C#, Python, JavaScript)
                            • Nesne yönelimli programlama kavramları
                            • Veritabanı temel bilgisi
                            • İngilizce okuma-yazma yetisi
                            • Takım çalışmasına yatkınlık

                            Staj Sürecinde Öğrenecekleriniz:
                            • Modern web teknolojileri
                            • Agile/Scrum metodolojileri
                            • Version control sistemleri (Git)
                            • Test-driven development
                            • Code review süreçleri
                            • Proje yönetimi araçları

                            Staj ücreti: Aylık 8.000 TL
                            Lokasyon: İzmir Teknokent
                            Başlangıç: Haziran 2025",
                    ExperienceLevel = ExperienceLevel.Internship,
                    WorkType = WorkType.OnSite,
                    Location = "İzmir, Türkiye",
                    ExternalUrl = "https://globaltechsolutions.com/internship-program"
                }
            };

        await _joblistingRepository.InsertManyAsync(jobListings, autoSave: true);
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
                Name = "Dogukan",
                Surname = "Ayhan",
                UserName = user.UserName,
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
        
        if (await _educationRepository.GetCountAsync() <= 0)
        {
            // High School
            await _educationRepository.InsertAsync(
                new Education
                {
                    ProfileId = profile.Id,
                    InstutionName = "Central High School",
                    Degree = EducationDegree.HighSchoolDiploma,
                    StartDate = new DateTime(2006, 9, 1),
                    EndDate = new DateTime(2010, 6, 15),
                    GPA = 3.60f,
                    Description = "Graduated with honors"
                },
                autoSave: true
            );

            // Bachelor
            await _educationRepository.InsertAsync(
                new Education
                {
                    ProfileId = profile.Id,
                    InstutionName = "State University",
                    Degree = EducationDegree.BachelorOfScience,
                    StartDate = new DateTime(2010, 9, 1),
                    EndDate = new DateTime(2014, 6, 15),
                    GPA = 3.80f,
                    Description = "Major in Computer Science"
                },
                autoSave: true
            );

            // Master
            await _educationRepository.InsertAsync(
                new Education
                {
                    ProfileId = profile.Id,
                    InstutionName = "Tech Institute",
                    Degree = EducationDegree.MasterOfScience,
                    StartDate = new DateTime(2014, 9, 1),
                    EndDate = new DateTime(2016, 6, 15),
                    GPA = 3.90f,
                    Description = "Focus on Software Engineering"
                },
                autoSave: true
            );
        }
    }
}
