using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Entities;

namespace TeamDraft.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Pick> Picks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUsers(modelBuilder);
        ConfigureTeams(modelBuilder);
        ConfigurePicks(modelBuilder);
    }

    private static void ConfigureUsers(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasKey(u => u.UserId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.AssignedTeamId);

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(150);

        modelBuilder.Entity<User>()
            .Property(u => u.PhotoPath)
            .HasMaxLength(500);

        modelBuilder.Entity<User>()
            .Property(u => u.Studies)
            .HasMaxLength(200);

        modelBuilder.Entity<User>()
            .HasOne(u => u.AssignedTeam)
            .WithMany(t => t.Members)
            .HasForeignKey(u => u.AssignedTeamId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureTeams(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Team>()
            .HasKey(t => t.TeamId);

        modelBuilder.Entity<Team>()
            .HasIndex(t => t.Name)
            .IsUnique();

        modelBuilder.Entity<Team>()
            .HasIndex(t => t.LeaderUserId)
            .HasDatabaseName("IX_Teams_LeaderUserId");

        modelBuilder.Entity<Team>()
            .HasIndex(t => t.LeaderUserId)
            .IsUnique()
            .HasDatabaseName("UX_Teams_LeaderUserId");

        modelBuilder.Entity<Team>()
            .Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<Team>()
            .HasOne(t => t.Leader)
            .WithMany()
            .HasForeignKey(t => t.LeaderUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigurePicks(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pick>()
            .HasKey(p => p.PickId);

        modelBuilder.Entity<Pick>()
            .HasIndex(p => p.TeamId);

        modelBuilder.Entity<Pick>()
            .HasIndex(p => p.UserId);

        modelBuilder.Entity<Pick>()
            .HasIndex(p => new { p.TeamId, p.PickOrder })
            .IsUnique();

        modelBuilder.Entity<Pick>()
            .Property(p => p.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Picks)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}