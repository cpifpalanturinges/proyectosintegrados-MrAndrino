namespace TeamDraft.Api.Entities;

public class Team
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int LeaderUserId { get; set; }

    public User Leader { get; set; } = null!;
    public ICollection<Pick> Picks { get; set; } = new List<Pick>();
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
}