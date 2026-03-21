namespace TeamDraft.Api.Entities;

public class Participant
{
    public int ParticipantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Photo { get; set; } = string.Empty;
    public int Skill1 { get; set; }
    public int Skill2 { get; set; }
    public int Skill3 { get; set; }
    public int Skill4 { get; set; }
    public bool IsLeader { get; set; }
    public int? AssignedTeamId { get; set; }

    public Team? AssignedTeam { get; set; }
    public ICollection<Pick> Picks { get; set; } = new List<Pick>();
}