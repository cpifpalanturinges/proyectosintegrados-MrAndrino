namespace TeamDraft.Api.DTOs.Admin;

public class PickHistoryItemDto
{
    public int PickId { get; set; }

    public int TeamId { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhotoPath { get; set; }

    public int PickOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsCancelled { get; set; }
}