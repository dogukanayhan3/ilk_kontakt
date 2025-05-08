using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using IlkKontakt.Backend.Books;
using IlkKontakt.Backend.Posts;
using IlkKontakt.Backend.UserProfiles;
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
    public DbSet<Post> Posts { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Experience> Experiences { get; set; }

    #region Entities from the modules

    /* Notice: We only implemented IIdentityProDbContext and ISaasDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityProDbContext and ISaasDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

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
        
        builder.Entity<Book>(b =>
        {
            b.ToTable(BackendConsts.DbTablePrefix + "Books",
                BackendConsts.DbSchema);
            b.ConfigureByConvention(); 
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
        });
        
        /* Configure your own tables/entities inside here */

        //builder.Entity<YourEntity>(b =>
        //{
        //    b.ToTable(BackendConsts.DbTablePrefix + "YourEntities", BackendConsts.DbSchema);
        //    b.ConfigureByConvention(); //auto configure for the base class props
        //    //...
        //});
        
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
                    v => JsonSerializer.Deserialize<List<Guid>>(v, (JsonSerializerOptions?)null) ?? new List<Guid>() // Handle potential null on deserialize
                )
                .HasColumnType("jsonb")
                .HasColumnName("UserLikes")
                .IsRequired()
                .HasDefaultValueSql("'[]'::jsonb")
                // ****** ADD THIS VALUE COMPARER ******
                .Metadata.SetValueComparer(new ValueComparer<IReadOnlyCollection<Guid>>(
                    (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()), // Compare sequences
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),      // Generate hash code
                    c => c.ToList()));                                                          // Create snapshot
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

    }
}
