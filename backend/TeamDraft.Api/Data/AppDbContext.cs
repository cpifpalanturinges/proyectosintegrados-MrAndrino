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
            .Property(u => u.FirstName)
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.LastName)
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

        modelBuilder.Entity<Team>()
            .HasOne(t => t.Leader)
            .WithMany()
            .HasForeignKey(t => t.LeaderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Team>()
            .Property(t => t.Name)
            .HasMaxLength(100);

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