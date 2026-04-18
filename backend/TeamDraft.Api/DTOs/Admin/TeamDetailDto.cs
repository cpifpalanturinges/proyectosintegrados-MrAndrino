namespace TeamDraft.Api.DTOs.Admin;

public class TeamDetailDto
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;

    public TeamUserItemDto Leader { get; set; } = null!;
    public List<TeamUserItemDto> Members { get; set; } = new();
}

public class TeamUserItemDto
{
    public int UserId { get; set; }
    public int? PickId { get; set; }
    public int? PickOrder { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhotoPath { get; set; }
}