namespace TeamDraft.Api.Entities;

public class Team
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int LeaderUserId { get; set; }

    public User Leader { get; set; } = null!;
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Pick> Picks { get; set; } = new List<Pick>();
}