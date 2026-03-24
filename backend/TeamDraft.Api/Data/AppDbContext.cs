using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Entities;

namespace TeamDraft.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<ParticipantProfile> ParticipantProfiles { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Pick> Picks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .HasOne(u => u.ParticipantProfile)
            .WithOne(p => p.User)
            .HasForeignKey<ParticipantProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Team>()
            .HasOne(t => t.Leader)
            .WithMany()
            .HasForeignKey(t => t.LeaderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Team>()
            .Property(t => t.Name)
            .HasMaxLength(100);

        modelBuilder.Entity<ParticipantProfile>()
            .Property(p => p.FirstName)
            .HasMaxLength(100);

        modelBuilder.Entity<ParticipantProfile>()
            .Property(p => p.LastName)
            .HasMaxLength(150);

        modelBuilder.Entity<ParticipantProfile>()
            .Property(p => p.PhotoPath)
            .HasMaxLength(500);

        modelBuilder.Entity<ParticipantProfile>()
            .Property(p => p.Studies)
            .HasMaxLength(200);

        modelBuilder.Entity<ParticipantProfile>()
            .HasOne(p => p.AssignedTeam)
            .WithMany(t => t.Members)
            .HasForeignKey(p => p.AssignedTeamId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Picks)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.ParticipantProfile)
            .WithMany()
            .HasForeignKey(p => p.ParticipantProfileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}