using Microsoft.AspNetCore.Http;

namespace TeamDraft.Api.DTOs.Auth;

public class RegisterRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public IFormFile? Photo { get; set; } = null!;

    public int? Skill1 { get; set; }
    public int? Skill2 { get; set; }
    public int? Skill3 { get; set; }
    public int? Skill4 { get; set; }

    public string? Studies { get; set; } = string.Empty;
    public bool IsLeader { get; set; }
    public string? TeamName { get; set; }
}