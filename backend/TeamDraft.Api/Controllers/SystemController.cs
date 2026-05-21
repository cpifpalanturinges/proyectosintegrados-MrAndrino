using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.System;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/system")]
[Authorize]
public class SystemController : ControllerBase
{
    private readonly AppDbContext _context;

    public SystemController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("status")]
    public async Task<ActionResult<SystemStatusDto>> GetStatus()
    {
        var systemState = await _context.SystemStates
            .FirstOrDefaultAsync(s => s.SystemStateId == 1);

        var response = new SystemStatusDto
        {
            IsDraftOpen = systemState?.IsDraftOpen ?? false,
            UpdatedAt = systemState?.UpdatedAt ?? DateTime.UtcNow
        };

        return Ok(response);
    }
}