namespace TeamDraft.Api.DTOs.Picks;

public class PickResultDto
{
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;

    public int UserId { get; set; }
    public int PickOrder { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhotoPath { get; set; } = string.Empty;
}