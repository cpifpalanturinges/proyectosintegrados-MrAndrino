namespace TeamDraft.Api.DTOs.Participants;

public class AvailableParticipantDto
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhotoPath { get; set; } = string.Empty;
    public string? Studies { get; set; } = string.Empty;

    public int? Skill1 { get; set; }
    public int? Skill2 { get; set; }
    public int? Skill3 { get; set; }
    public int? Skill4 { get; set; }
}