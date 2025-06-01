using System;
using System.Threading.Tasks;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.JobListings;
using IlkKontakt.Backend.Posts;
using IlkKontakt.Backend.UserProfiles;
using Microsoft.AspNetCore.Identity;
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
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IIdentityRoleRepository _roleRepository;

    public BackendDataSeederContributor(
        IRepository<Book, Guid> bookRepository,
        IRepository<Post, Guid> postRepository,
        IRepository<IdentityUser, Guid> userRepository,
        IRepository<UserProfile, Guid> profileRepository,
        IRepository<Experience, Guid> experienceRepository,
        IRepository<Education, Guid> educationRepository,
        IRepository<JobListing, Guid> joblistingRepository,
        UserManager<IdentityUser> userManager,
        IIdentityRoleRepository roleRepository)
    {
        _bookRepository = bookRepository;
        _postRepository = postRepository;
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _experienceRepository = experienceRepository;
        _educationRepository = educationRepository;
        _joblistingRepository = joblistingRepository;
        _userManager = userManager;
        _roleRepository = roleRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        // Seed Users first
        await SeedUsersAsync();

        // Seed Profile and Experience (updated to use seeded users)
        await SeedProfileAndExperienceAsync();

        await SeedJobListingsAsync();
    }

    private async Task SeedUsersAsync()
    {
        // Check if we already have enough users (skip if more than 10 users exist)
        if (await _userRepository.GetCountAsync() > 10)
        {
            return;
        }

        // Get admin role
        var adminRole = await _roleRepository.FindByNormalizedNameAsync("ADMIN");
        if (adminRole == null)
        {
            return; // Admin role doesn't exist, skip user creation
        }

        var userData = new[]
        {
            new { FirstName = "Ahmet", LastName = "Yılmaz", City = "İstanbul" },
            new { FirstName = "Ayşe", LastName = "Kaya", City = "Ankara" },
            new { FirstName = "Mehmet", LastName = "Demir", City = "İzmir" },
            new { FirstName = "Fatma", LastName = "Şahin", City = "Bursa" },
            new { FirstName = "Ali", LastName = "Çelik", City = "Antalya" },
            new { FirstName = "Zeynep", LastName = "Arslan", City = "Adana" },
            new { FirstName = "Mustafa", LastName = "Koç", City = "Gaziantep" },
            new { FirstName = "Elif", LastName = "Özkan", City = "Konya" },
            new { FirstName = "Emre", LastName = "Aydın", City = "Mersin" },
            new { FirstName = "Selin", LastName = "Polat", City = "Eskişehir" }
        };

        for (int i = 0; i < 10; i++)
        {
            var userDataItem = userData[i];
            var userName = $"user{i + 1:D2}";
            var email = $"user{i + 1:D2}@ilkkontakt.com";

            // Check if user already exists
            var existingUser = await _userManager.FindByNameAsync(userName);
            if (existingUser != null)
            {
                continue; // Skip if user already exists
            }

            // Create new user
            var user = new IdentityUser(
                id: Guid.NewGuid(),
                userName: userName,
                email: email,
                tenantId: null
            );

            // Set user properties
            user.Name = userDataItem.FirstName;
            user.Surname = userDataItem.LastName;
            user.SetEmailConfirmed(true);

            // Create user with password
            var result = await _userManager.CreateAsync(user, "Test123!");

            if (result.Succeeded)
            {
                // Assign admin role to the user
                await _userManager.AddToRoleAsync(user, "admin");
            }
        }
    }

    private async Task SeedProfileAndExperienceAsync()
    {
        // Check if profiles already exist
        if (await _profileRepository.GetCountAsync() > 0)
        {
            return;
        }

        // Get all users (including the newly created ones)
        var users = await _userRepository.GetListAsync();
        
        var random = new Random();
        var aboutTexts = new[]
        {
            "Yazılım geliştirme alanında deneyimli, yenilikçi çözümler üreten bir profesyonel.",
            "Frontend ve backend teknolojilerinde uzman, kullanıcı deneyimini ön planda tutan geliştirici.",
            "Agile metodolojileri benimseyen, takım çalışmasına yatkın yazılım mühendisi.",
            "Modern web teknolojileri ile ölçeklenebilir uygulamalar geliştiren deneyimli developer.",
            "Full-stack geliştirici olarak hem frontend hem backend projelerinde aktif rol alan uzman.",
            "Mobil ve web uygulamaları geliştirme konusunda 5+ yıl deneyimli yazılım geliştirici.",
            "DevOps kültürünü benimseyen, CI/CD süreçlerinde deneyimli sistem mimarı.",
            "Kullanıcı odaklı tasarım anlayışı ile modern arayüzler geliştiren UI/UX developer.",
            "Mikroservis mimarisi ve cloud teknolojilerinde uzmanlaşmış backend geliştirici.",
            "Açık kaynak projelere katkıda bulunan, sürekli öğrenmeye odaklı yazılım uzmanı."
        };

        var addresses = new[]
        {
            "Beşiktaş, İstanbul",
            "Çankaya, Ankara", 
            "Konak, İzmir",
            "Nilüfer, Bursa",
            "Muratpaşa, Antalya",
            "Seyhan, Adana",
            "Şahinbey, Gaziantep",
            "Selçuklu, Konya",
            "Mezitli, Mersin",
            "Odunpazarı, Eskişehir"
        };

        var phoneNumbers = new[]
        {
            "+90 532 123 4567",
            "+90 533 234 5678",
            "+90 534 345 6789",
            "+90 535 456 7890",
            "+90 536 567 8901",
            "+90 537 678 9012",
            "+90 538 789 0123",
            "+90 539 890 1234",
            "+90 541 901 2345",
            "+90 542 012 3456"
        };

        var userData = new[]
        {
            new { FirstName = "Ahmet", LastName = "Yılmaz" },
            new { FirstName = "Ayşe", LastName = "Kaya" },
            new { FirstName = "Mehmet", LastName = "Demir" },
            new { FirstName = "Fatma", LastName = "Şahin" },
            new { FirstName = "Ali", LastName = "Çelik" },
            new { FirstName = "Zeynep", LastName = "Arslan" },
            new { FirstName = "Mustafa", LastName = "Koç" },
            new { FirstName = "Elif", LastName = "Özkan" },
            new { FirstName = "Emre", LastName = "Aydın" },
            new { FirstName = "Selin", LastName = "Polat" }
        };

        for (int i = 0; i < Math.Min(users.Count, 10); i++)
        {
            var user = users[i];
            var birthYear = random.Next(1985, 2000);
            var birthMonth = random.Next(1, 13);
            var birthDay = random.Next(1, 29);

            // Use the predefined names if available, otherwise use user's existing name
            var firstName = i < userData.Length ? userData[i].FirstName : (user.Name ?? $"User{i + 1}");
            var lastName = i < userData.Length ? userData[i].LastName : (user.Surname ?? "Surname");

            // Create profile
            var profile = await _profileRepository.InsertAsync(
                new UserProfile
                {
                    UserId = user.Id,
                    About = aboutTexts[i % aboutTexts.Length],
                    Name = firstName,
                    Surname = lastName,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = phoneNumbers[i % phoneNumbers.Length],
                    Address = addresses[i % addresses.Length],
                    ProfilePictureUrl = $"https://ui-avatars.com/api/?name={firstName}+{lastName}&size=200&background=random",
                    Birthday = new DateTime(birthYear, birthMonth, birthDay)
                },
                autoSave: true
            );

            // Create sample experience for each user
            await CreateSampleExperienceAsync(profile.Id, i);
            
            // Create sample education for each user
            await CreateSampleEducationAsync(profile.Id, i);
        }
    }

    private async Task CreateSampleExperienceAsync(Guid profileId, int userIndex)
{
    var random = new Random();
    var startYear = random.Next(2018, 2022);
    var startMonth = random.Next(1, 13);

    // Only first 3 users (Ahmet, Ayşe, Mehmet) work in software development
    if (userIndex < 3)
    {
        // Software Development Industry
        var techCompanies = new[]
        {
            "TechCorp İstanbul", "Yazılım A.Ş.", "Digital Solutions"
        };

        var techPositions = new[]
        {
            "Senior Software Engineer", "Frontend Developer", "Backend Developer"
        };

        var techLocations = new[]
        {
            "İstanbul, Türkiye", "Ankara, Türkiye", "İzmir, Türkiye"
        };

        var techDescriptions = new[]
        {
            "• React.js ve Node.js ile modern web uygulamaları geliştirme\n• RESTful API tasarımı ve implementasyonu\n• Agile metodolojileri ile proje yönetimi",
            "• Vue.js framework'ü ile responsive web arayüzleri\n• TypeScript kullanarak tip güvenli kod geliştirme\n• Jest ile unit test yazımı",
            "• .NET Core ile mikroservis mimarisi geliştirme\n• Docker containerization ve Kubernetes orchestration\n• Azure cloud platformu entegrasyonu"
        };

        await _experienceRepository.InsertAsync(
            new Experience
            {
                ProfileId = profileId,
                Title = techPositions[userIndex],
                CompanyName = techCompanies[userIndex],
                Location = techLocations[userIndex],
                StartDate = new DateTime(startYear, startMonth, 1),
                EndDate = userIndex == 0 ? null : new DateTime(startYear + 2, startMonth, 28), // Only Ahmet has current position
                IsCurrentPosition = userIndex == 0,
                Description = techDescriptions[userIndex],
                EmploymentType = EmploymentType.FullTime
            },
            autoSave: true
        );

        // Add previous tech experience for Ahmet
        if (userIndex == 0)
        {
            await _experienceRepository.InsertAsync(
                new Experience
                {
                    ProfileId = profileId,
                    Title = "Junior Developer",
                    CompanyName = "StartUp Co.",
                    Location = "İstanbul, Türkiye",
                    StartDate = new DateTime(startYear - 2, 1, 1),
                    EndDate = new DateTime(startYear - 1, 12, 31),
                    IsCurrentPosition = false,
                    Description = "• Web uygulamaları geliştirme\n• Bug fixing ve maintenance\n• Agile development practices",
                    EmploymentType = EmploymentType.FullTime
                },
                autoSave: true
            );
        }
    }
    else
    {
        // Other Industries (users 4-10: Fatma, Ali, Zeynep, Mustafa, Elif, Emre, Selin)
        var nonTechData = new[]
        {
            // Fatma - Healthcare
            new {
                Company = "Bursa Şehir Hastanesi",
                Position = "Hemşire",
                Location = "Bursa, Türkiye",
                Description = "• Hasta bakımı ve tedavi süreçlerinde aktif rol alma\n• Tıbbi cihazların kullanımı ve bakımı\n• Hasta kayıtlarının tutulması ve raporlama",
                PreviousCompany = "Özel Medicana Hastanesi",
                PreviousPosition = "Stajyer Hemşire"
            },
            // Ali - Finance/Banking
            new {
                Company = "Garanti BBVA",
                Position = "Kredi Analisti",
                Location = "Antalya, Türkiye",
                Description = "• Kurumsal kredilerin risk analizi ve değerlendirmesi\n• Finansal raporların hazırlanması\n• Müşteri portföyü yönetimi ve takibi",
                PreviousCompany = "Akbank",
                PreviousPosition = "Gişe Müşteri Temsilcisi"
            },
            // Zeynep - Marketing/Digital Marketing
            new {
                Company = "Publicis İstanbul",
                Position = "Dijital Pazarlama Uzmanı",
                Location = "İstanbul, Türkiye",
                Description = "• Sosyal medya kampanyalarının planlanması ve yürütülmesi\n• Google Ads ve Facebook Ads yönetimi\n• İçerik pazarlama stratejilerinin geliştirilmesi",
                PreviousCompany = "Ogilvy Türkiye",
                PreviousPosition = "Pazarlama Asistanı"
            },
            // Mustafa - Manufacturing/Engineering
            new {
                Company = "ASELSAN",
                Position = "Proje Mühendisi",
                Location = "Ankara, Türkiye",
                Description = "• Savunma sanayi projelerinde sistem tasarımı\n• Teknik dokümantasyon hazırlama\n• Kalite kontrol ve test süreçlerinin yönetimi",
                PreviousCompany = "ROKETSAN",
                PreviousPosition = "Tasarım Mühendisi"
            },
            // Elif - Education
            new {
                Company = "Konya Meram Belediyesi",
                Position = "Sınıf Öğretmeni",
                Location = "Konya, Türkiye",
                Description = "• İlkokul düzeyinde eğitim-öğretim faaliyetleri\n• Öğrenci gelişim raporlarının hazırlanması\n• Veli görüşmeleri ve eğitim danışmanlığı",
                PreviousCompany = "Özel Bahçeşehir Koleji",
                PreviousPosition = "Stajyer Öğretmen"
            },
            // Emre - Sales/Business Development
            new {
                Company = "Coca-Cola İçecek",
                Position = "Satış Temsilcisi",
                Location = "Mersin, Türkiye",
                Description = "• Bölgesel satış hedeflerinin planlanması ve takibi\n• Müşteri ilişkileri yönetimi ve geliştirme\n• Pazar analizi ve rakip takibi",
                PreviousCompany = "Ülker Bisküvi",
                PreviousPosition = "Saha Satış Uzmanı"
            },
            // Selin - Human Resources
            new {
                Company = "Türk Telekom",
                Position = "İnsan Kaynakları Uzmanı",
                Location = "Ankara, Türkiye",
                Description = "• Personel işe alım süreçlerinin yönetimi\n• Çalışan performans değerlendirmeleri\n• Eğitim programlarının planlanması ve koordinasyonu",
                PreviousCompany = "Vodafone Türkiye",
                PreviousPosition = "İK Asistanı"
            }
        };

        var dataIndex = userIndex - 3; // Adjust index for non-tech users
        var userData = nonTechData[dataIndex];

        // Current position
        await _experienceRepository.InsertAsync(
            new Experience
            {
                ProfileId = profileId,
                Title = userData.Position,
                CompanyName = userData.Company,
                Location = userData.Location,
                StartDate = new DateTime(startYear, startMonth, 1),
                EndDate = dataIndex < 2 ? null : new DateTime(startYear + 2, startMonth, 28), // First 2 non-tech users have current positions
                IsCurrentPosition = dataIndex < 2,
                Description = userData.Description,
                EmploymentType = EmploymentType.FullTime
            },
            autoSave: true
        );

        // Add previous experience for some users
        if (dataIndex % 2 == 0)
        {
            await _experienceRepository.InsertAsync(
                new Experience
                {
                    ProfileId = profileId,
                    Title = userData.PreviousPosition,
                    CompanyName = userData.PreviousCompany,
                    Location = userData.Location,
                    StartDate = new DateTime(startYear - 2, 1, 1),
                    EndDate = new DateTime(startYear - 1, 12, 31),
                    IsCurrentPosition = false,
                    Description = "• Sektörel deneyim kazanma\n• Temel iş süreçlerini öğrenme\n• Takım çalışması ve koordinasyon",
                    EmploymentType = EmploymentType.FullTime
                },
                autoSave: true
            );
        }
    }
}

    private async Task CreateSampleEducationAsync(Guid profileId, int userIndex)
    {
        var universities = new[]
        {
            "İstanbul Teknik Üniversitesi", "Orta Doğu Teknik Üniversitesi", "Boğaziçi Üniversitesi",
            "Bilkent Üniversitesi", "Hacettepe Üniversitesi", "Ankara Üniversitesi",
            "Ege Üniversitesi", "Gazi Üniversitesi", "Yıldız Teknik Üniversitesi", "Sabancı Üniversitesi"
        };

        var highSchools = new[]
        {
            "İstanbul Anadolu Lisesi", "Ankara Fen Lisesi", "İzmir Fen Lisesi",
            "Bursa Anadolu Lisesi", "Antalya Fen Lisesi", "Adana Anadolu Lisesi",
            "Gaziantep Fen Lisesi", "Konya Anadolu Lisesi", "Mersin Fen Lisesi", "Eskişehir Anadolu Lisesi"
        };

        // High School
        await _educationRepository.InsertAsync(
            new Education
            {
                ProfileId = profileId,
                InstutionName = highSchools[userIndex % highSchools.Length],
                Degree = EducationDegree.HighSchoolDiploma,
                StartDate = new DateTime(2006 + userIndex, 9, 1),
                EndDate = new DateTime(2010 + userIndex, 6, 15),
                GPA = 3.2f + (userIndex * 0.1f),
                Description = "Fen bilimleri ağırlıklı eğitim"
            },
            autoSave: true
        );

        // Bachelor's Degree
        await _educationRepository.InsertAsync(
            new Education
            {
                ProfileId = profileId,
                InstutionName = universities[userIndex % universities.Length],
                Degree = EducationDegree.BachelorOfScience,
                StartDate = new DateTime(2010 + userIndex, 9, 1),
                EndDate = new DateTime(2014 + userIndex, 6, 15),
                GPA = 3.0f + (userIndex * 0.08f),
                Description = "Bilgisayar Mühendisliği"
            },
            autoSave: true
        );

        // Master's Degree for some users
        if (userIndex % 3 == 0)
        {
            await _educationRepository.InsertAsync(
                new Education
                {
                    ProfileId = profileId,
                    InstutionName = universities[userIndex % universities.Length],
                    Degree = EducationDegree.MasterOfScience,
                    StartDate = new DateTime(2014 + userIndex, 9, 1),
                    EndDate = new DateTime(2016 + userIndex, 6, 15),
                    GPA = 3.5f + (userIndex * 0.05f),
                    Description = "Yazılım Mühendisliği"
                },
                autoSave: true
            );
        }
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
}