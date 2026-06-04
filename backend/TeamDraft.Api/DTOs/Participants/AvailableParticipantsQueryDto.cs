using TeamDraft.Api.DTOs.Common;

namespace TeamDraft.Api.DTOs.Participants;

public class AvailableParticipantsQueryDto : PaginationQueryDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; }
}
