using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Connections;
using IlkKontakt.Backend.Posts;
using IlkKontakt.Backend.UserProfiles;
using IlkKontakt.Backend.Courses;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.BlobStoring.Database.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using IlkKontakt.Backend.JobListings;
using IlkKontakt.Backend.Contact;
using IlkKontakt.Backend.JobApplications;
using IlkKontakt.Backend.Messages;
using IlkKontakt.Backend.Notifications;

namespace IlkKontakt.Backend.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class BackendDbContext :
    AbpDbContext<BackendDbContext>,
    ITenantManagementDbContext,
    IIdentityDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    public DbSet<Book> Books { get; set; }
    public DbSet<JobListing> JobListings{ get; set; }
    public DbSet<ContactUs> ContactUs { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Experience> Experiences { get; set; }
    public DbSet<Education> Educations { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<Project> Project { get; set; } 
    public DbSet<Skill> Skill { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Instructor> Instructors { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Connection> Connections { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<JobApplication> JobApplications { get; set; } 
    public DbSet<Message> Messages { get; set; }

    
    #region Entities from the modules

    // Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public BackendDbContext(DbContextOptions<BackendDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureFeatureManagement();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureTenantManagement();
        builder.ConfigureBlobStoring();
        
        builder.Entity<Message>(b =>
        {
            // Specify the table name (and schema, if you use one)
            b.ToTable("Messages");

            // Configure primary key, audit properties, etc.
            b.ConfigureByConvention();

            // Property mappings
            b.Property(m => m.ConnectionId)
                .IsRequired();

            b.Property(m => m.SenderId)
                .IsRequired();

            b.Property(m => m.Text)
                .IsRequired()
                .HasMaxLength(2000);

            b.Property(m => m.IsRead)
                .IsRequired();

            // Index for faster lookups by connection
            b.HasIndex(m => m.ConnectionId)
                .HasDatabaseName("IX_Messages_ConnectionId");

            b.HasOne<Connection>()
                .WithMany()
                .HasForeignKey(c => c.ConnectionId);
            
            b.HasOne<IdentityUser>()
                .WithMany()
                .HasForeignKey(c => c.SenderId);
        });

        
        builder.Entity<JobApplication>(b =>
        {
            b.ToTable("JobApplications");

            b.ConfigureByConvention(); // sets up auditing fields

            b.HasIndex(x => x.ApplicantId);
            b.HasIndex(x => x.JobListingId);
            b.Property(x => x.Status);
        });
        
        builder.Entity<Notification>(b =>
        {
            b.ToTable("Notifications");
            b.ConfigureByConvention();
            b.Property(n => n.Message).IsRequired().HasMaxLength(512);
        });

        
        builder.Entity<Connection>(b =>
        {
                b.ToTable("Connections");
                b.ConfigureByConvention(); // id, auditing columns

                b.Property(c => c.SenderId).IsRequired();
                b.Property(c => c.ReceiverId).IsRequired();
                b.Property(c => c.Status).IsRequired();

                // Prevent duplicate requests
                b.HasIndex(c => new { c.SenderId, c.ReceiverId })
                    .IsUnique();

                // FKs to AbpUsers
                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(c => c.SenderId)
                    .OnDelete(DeleteBehavior.NoAction);

                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(c => c.ReceiverId)
                    .OnDelete(DeleteBehavior.NoAction);
        });

            builder.Entity<Post>(b =>
            {
                b.ToTable("Posts");
                b.ConfigureByConvention();

                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(p => p.CreatorUserId)
                    .IsRequired();

                b.Property(p => p.Content)
                    .HasMaxLength(512);

                b.Property(p => p.UserLikes)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions?)null) ??
                             new List<Guid>() // Handle potential null on deserialize
                    )
                    .HasColumnType("jsonb")
                    .HasColumnName("UserLikes")
                    .IsRequired()
                    .HasDefaultValueSql("'[]'::jsonb")
                    // ****** ADD THIS VALUE COMPARER ******
                    .Metadata.SetValueComparer(new ValueComparer<IReadOnlyCollection<Guid>>(
                        (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()), // Compare sequences
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), // Generate hash code
                        c => c.ToList())); // Create snapshot
                // ****** END OF ADDED LINE ******

                // Map UserComments as a single JSONB column of Comment objects
                b.OwnsMany(
                    p => p.UserComments,
                    cb =>
                    {
                        // Do not configure keys on JSON collections
                        cb.Property(c => c.UserId);
                        cb.Property(c => c.Content).HasColumnType("text");
                        cb.Property(c => c.CreationTime);

                        cb.ToJson("UserComments");
                    });
            });

            builder.Entity<UserProfile>(b =>
            {
                b.ToTable("UserProfiles"); // Table name

                b.HasKey(x => x.Id);

                b.Property(x => x.UserId)
                    .IsRequired();

                b.Property(x => x.Name)
                    .HasMaxLength(128);

                b.Property(x => x.Surname)
                    .HasMaxLength(128);

                b.Property(x => x.UserName)
                    .HasMaxLength(128);

                b.Property(x => x.Email)
                    .IsRequired()
                    .HasMaxLength(64);

                b.Property(x => x.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(16);

                b.Property(x => x.Birthday)
                    .IsRequired();

                b.Property(x => x.About)
                    .HasMaxLength(2000);

                b.Property(x => x.Address)
                    .HasMaxLength(256);

                b.Property(x => x.ProfilePictureUrl);

                b.HasIndex(x => x.UserId).IsUnique();

                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Experience>(b =>
            {
                b.ToTable("Experiences");
                b.ConfigureByConvention();
                b.Property(x => x.Title).IsRequired().HasMaxLength(128);
                b.Property(x => x.CompanyName).IsRequired().HasMaxLength(128);
                b.Property(x => x.Location).IsRequired().HasMaxLength(128);
                b.Property(x => x.Description).IsRequired().HasMaxLength(1500);
                b.HasOne<UserProfile>()
                    .WithMany()
                    .HasForeignKey(x => x.ProfileId)
                    .IsRequired();
            });

            builder.Entity<Education>(b =>
            {
                b.ToTable("Educations");
                b.ConfigureByConvention();

                b.Property(x => x.InstutionName)
                    .IsRequired()
                    .HasMaxLength(128);

                b.Property(x => x.Degree)
                    .IsRequired()
                    .HasMaxLength(128);

                b.Property(x => x.StartDate)
                    .IsRequired();

                b.Property(x => x.EndDate);

                b.Property(x => x.GPA)
                    .HasPrecision(5, 2);

                b.Property(x => x.Description)
                    .HasMaxLength(1500);

                b.HasOne<UserProfile>()
                    .WithMany()
                    .HasForeignKey(x => x.ProfileId)
                    .IsRequired();
            });

            builder.Entity<Project>(b =>
                {
                    b.ToTable("Projects");
                    b.ConfigureByConvention();

                    b.Property(x => x.ProjectName)
                        .IsRequired()
                        .HasMaxLength(128);

                    b.Property(x => x.Description)
                        .IsRequired()
                        .HasMaxLength(512);

                    b.HasOne<UserProfile>()
                        .WithMany()
                        .HasForeignKey(x => x.ProfileId)
                        .IsRequired();
                }
            );

            builder.Entity<Language>(b =>
                {
                    b.ToTable("Languages");
                    b.ConfigureByConvention();

                    b.Property(x => x.LanguageName)
                        .IsRequired()
                        .HasMaxLength(64);

                    b.HasOne<UserProfile>()
                        .WithMany()
                        .HasForeignKey(x => x.ProfileId)
                        .IsRequired();
                }
            );

            builder.Entity<Skill>(b =>
                {
                    b.ToTable("Skills");
                    b.ConfigureByConvention();

                    b.Property(x => x.SkillName)
                        .IsRequired()
                        .HasMaxLength(64);

                    b.HasOne<UserProfile>()
                        .WithMany()
                        .HasForeignKey(x => x.ProfileId)
                        .IsRequired();
                }
            );

            builder.Entity<Course>(b =>
            {
                b.ToTable("Courses");
                b.ConfigureByConvention();

                b.Property(x => x.Title)
                    .IsRequired()
                    .HasMaxLength(128);

                b.Property(x => x.Description)
                    .HasMaxLength(1500);

                b.HasOne<Instructor>()
                    .WithMany()
                    .HasForeignKey(x => x.InstructorId)
                    .IsRequired();
            });

            builder.Entity<Instructor>(b =>
            {
                b.ToTable("Instructors");
                b.ConfigureByConvention();

                b.Property(x => x.UserId)
                    .IsRequired();

                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .IsRequired();

                b.HasOne<UserProfile>()
                    .WithMany()
                    .HasForeignKey(x => x.InstructorUserProfileId);
            });

            builder.Entity<Enrollment>(b =>
            {
                b.ToTable("Enrollments");
                b.ConfigureByConvention();

                b.Property(x => x.UserId)
                    .IsRequired();

                b.Property(x => x.CourseId)
                    .IsRequired();

                b.Property(x => x.EnrollmentDate)
                    .IsRequired();

                b.HasOne<IdentityUser>()
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .IsRequired();

                b.HasOne<Course>()
                    .WithMany()
                    .HasForeignKey(x => x.CourseId)
                    .IsRequired();
            });

            builder.Entity<JobListing>(a =>
            {
                a.ToTable("JobListings",
                    BackendConsts.DbSchema);
                a.ConfigureByConvention();
                a.Property(y => y.Title).IsRequired().HasMaxLength(128);
                a.Property(y => y.Company).IsRequired().HasMaxLength(128);
                a.Property(y => y.Description).HasMaxLength(2000);
                a.Property(y => y.Location).HasMaxLength(256);
            });

            builder.Entity<ContactUs>(b =>
                {
                    b.ToTable("ContactUs");
                    b.ConfigureByConvention();
                    
                    b.Property(x => x.Name)
                        .IsRequired()
                        .HasMaxLength(128);
                    b.Property(x => x.Email)
                        .IsRequired()
                        .HasMaxLength(64);
                    b.Property(x=>x.Message)
                        .IsRequired()
                        .HasMaxLength(1000);
                }
            );

    }
}
