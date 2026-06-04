using TeamDraft.Api.DTOs.Common;

namespace TeamDraft.Api.DTOs.Admin;

public class UserListQueryDto : PaginationQueryDto
{
    public string? Search { get; set; }
    public string? Role { get; set; }
}
