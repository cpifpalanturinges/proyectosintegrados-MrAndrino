namespace TeamDraft.Api.DTOs.Admin;

public class TeamListDto
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;

    public int LeaderUserId { get; set; }
    public string LeaderName { get; set; } = string.Empty;

    public int MembersCount { get; set; }
}