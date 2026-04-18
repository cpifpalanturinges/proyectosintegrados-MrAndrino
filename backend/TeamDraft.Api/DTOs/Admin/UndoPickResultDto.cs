namespace TeamDraft.Api.DTOs.Admin;

public class UndoPickResultDto
{
    public int PickId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
}