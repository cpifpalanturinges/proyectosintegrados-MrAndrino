namespace TeamDraft.Api.DTOs.Common;

public class PaginationQueryDto
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 12;
    private const int MaxPageSize = 50;

    private int _page = DefaultPage;
    private int _pageSize = DefaultPageSize;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? DefaultPage : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }
}
