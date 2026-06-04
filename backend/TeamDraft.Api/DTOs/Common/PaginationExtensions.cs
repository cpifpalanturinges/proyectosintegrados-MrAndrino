using Microsoft.EntityFrameworkCore;

namespace TeamDraft.Api.DTOs.Common;

public static class PaginationExtensions
{
    public static async Task<PagedResultDto<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int page,
        int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize switch
        {
            < 1 => 12,
            > 50 => 50,
            _ => pageSize
        };

        var totalItems = await query.CountAsync();
        var totalPages = totalItems == 0
            ? 0
            : (int)Math.Ceiling(totalItems / (double)pageSize);

        if (totalPages > 0 && page > totalPages)
        {
            page = totalPages;
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages
        };
    }
}
