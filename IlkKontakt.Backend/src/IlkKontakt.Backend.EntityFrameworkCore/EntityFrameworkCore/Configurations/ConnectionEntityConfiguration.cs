using IlkKontakt.Backend.Connections;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.Identity;

namespace IlkKontakt.Backend.EntityFrameworkCore.Configurations;

public class ConnectionEntityConfiguration 
    : IEntityTypeConfiguration<Connection>
{
    public void Configure(EntityTypeBuilder<Connection> builder)
    {
        builder.ToTable("AppConnections");
        builder.ConfigureByConvention(); // id, auditing columns

        builder.Property(c => c.SenderId).IsRequired();
        builder.Property(c => c.ReceiverId).IsRequired();
        builder.Property(c => c.Status).IsRequired();

        // Prevent duplicate requests
        builder.HasIndex(c => new { c.SenderId, c.ReceiverId })
            .IsUnique();

        // FKs to AbpUsers
        builder.HasOne<IdentityUser>()
            .WithMany()
            .HasForeignKey(c => c.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne<IdentityUser>()
            .WithMany()
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
