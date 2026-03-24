namespace TeamDraft.Api.DTOs.Auth;

public class CurrentUserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}