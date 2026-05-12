namespace TeamDraft.Api.DTOs.Teams;

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

    public string? Studies { get; set; }
    public int? Skill1 { get; set; }
    public int? Skill2 { get; set; }
    public int? Skill3 { get; set; }
    public int? Skill4 { get; set; }
}