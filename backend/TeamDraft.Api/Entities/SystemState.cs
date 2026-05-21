namespace TeamDraft.Api.Entities;

public class SystemState
{
    public int SystemStateId { get; set; }

    public bool IsDraftOpen { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}