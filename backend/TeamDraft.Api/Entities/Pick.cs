namespace TeamDraft.Api.Entities;

public class Pick
{
    public int PickId { get; set; }

    public int TeamId { get; set; }
    public int UserId { get; set; }

    public int PickOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsCancelled { get; set; }

    public Team Team { get; set; } = null!;
    public User User { get; set; } = null!;
}