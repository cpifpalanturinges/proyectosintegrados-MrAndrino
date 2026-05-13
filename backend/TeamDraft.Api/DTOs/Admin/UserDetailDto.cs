namespace TeamDraft.Api.DTOs.Admin;

public class UserDetailDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhotoPath { get; set; }
    public string? Studies { get; set; }

    public int? Skill1 { get; set; }
    public int? Skill2 { get; set; }
    public int? Skill3 { get; set; }
    public int? Skill4 { get; set; }

    public int? AssignedTeamId { get; set; }
    public string? AssignedTeamName { get; set; }

    public int? PickId { get; set; }
}