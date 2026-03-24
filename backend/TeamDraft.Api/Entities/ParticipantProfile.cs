namespace TeamDraft.Api.Entities;

public class ParticipantProfile
{
    public int ParticipantProfileId { get; set; }
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhotoPath { get; set; } = string.Empty;
    public int Skill1 { get; set; }
    public int Skill2 { get; set; }
    public int Skill3 { get; set; }
    public int Skill4 { get; set; }
    public string Studies { get; set; } = string.Empty;
    public bool IsLeader { get; set; }

    public int? AssignedTeamId { get; set; }

    public User User { get; set; } = null!;
    public Team? AssignedTeam { get; set; }
}