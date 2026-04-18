namespace TeamDraft.Api.DTOs.Admin;

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Studies { get; set; } = string.Empty;

    public int? Skill1 { get; set; }
    public int? Skill2 { get; set; }
    public int? Skill3 { get; set; }
    public int? Skill4 { get; set; }
}