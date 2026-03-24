namespace TeamDraft.Api.Entities;

public class Team
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int LeaderUserId { get; set; }

    public User Leader { get; set; } = null!;
    public ICollection<ParticipantProfile> Members { get; set; } = new List<ParticipantProfile>();
    public ICollection<Pick> Picks { get; set; } = new List<Pick>();
}