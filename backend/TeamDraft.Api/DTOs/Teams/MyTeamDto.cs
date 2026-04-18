namespace TeamDraft.Api.DTOs.Teams;

public class MyTeamDto
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;

    public TeamLeaderDto Leader { get; set; } = null!;
    public List<TeamMemberDto> Members { get; set; } = new();
}