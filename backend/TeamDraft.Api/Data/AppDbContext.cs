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
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Pick> Picks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Team>()
            .HasOne(t => t.Leader)
            .WithOne(u => u.Team)
            .HasForeignKey<Team>(t => t.LeaderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Participant>()
            .HasOne(p => p.AssignedTeam)
            .WithMany(t => t.Participants)
            .HasForeignKey(p => p.AssignedTeamId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Picks)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Pick>()
            .HasOne(p => p.Participant)
            .WithMany(p => p.Picks)
            .HasForeignKey(p => p.ParticipantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}