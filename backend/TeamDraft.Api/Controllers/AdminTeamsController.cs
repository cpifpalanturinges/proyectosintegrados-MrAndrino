using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/admin/teams")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminTeamsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminTeamsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPut("{teamId:int}")]
    public async Task<IActionResult> UpdateTeam(int teamId, UpdateTeamDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Team name is required.");
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team is null)
        {
            return NotFound("Team not found.");
        }

        team.Name = dto.Name.Trim();

        await _context.SaveChangesAsync();

        return NoContent();
    }
}