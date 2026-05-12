using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Teams;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeamsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TeamListDto>>> GetTeams([FromQuery] string? search)
    {
        var query = _context.Teams
            .Include(t => t.Leader)
            .Include(t => t.Picks)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(t =>
                t.Name.ToLower().Contains(s) ||
                t.Leader.FirstName.ToLower().Contains(s) ||
                t.Leader.LastName.ToLower().Contains(s)
            );
        }

        var teams = await query
            .OrderBy(t => t.Name)
            .Select(t => new TeamListDto
            {
                TeamId = t.TeamId,
                Name = t.Name,
                LeaderUserId = t.LeaderUserId,
                LeaderName = t.Leader.FirstName + " " + t.Leader.LastName,
                MembersCount = t.Picks.Count(p => !p.IsCancelled)
            })
            .ToListAsync();

        return Ok(teams);
    }

    [HttpGet("{teamId:int}")]
    public async Task<ActionResult<TeamDetailDto>> GetTeamById(int teamId)
    {
        var team = await _context.Teams
            .Include(t => t.Leader)
            .Include(t => t.Picks)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);

        if (team is null)
        {
            return NotFound("Team not found.");
        }

        var response = new TeamDetailDto
        {
            TeamId = team.TeamId,
            Name = team.Name,
            Leader = new TeamUserItemDto
            {
                UserId = team.Leader.UserId,
                PickId = null,
                PickOrder = null,
                FirstName = team.Leader.FirstName,
                LastName = team.Leader.LastName,
                PhotoPath = team.Leader.PhotoPath,
                Studies = team.Leader.Studies,
                Skill1 = team.Leader.Skill1,
                Skill2 = team.Leader.Skill2,
                Skill3 = team.Leader.Skill3,
                Skill4 = team.Leader.Skill4
            },
            Members = team.Picks
                .Where(p => !p.IsCancelled)
                .OrderBy(p => p.PickOrder)
                .Select(p => new TeamUserItemDto
                {
                    UserId = p.User.UserId,
                    PickId = p.PickId,
                    PickOrder = p.PickOrder,
                    FirstName = p.User.FirstName,
                    LastName = p.User.LastName,
                    PhotoPath = p.User.PhotoPath,
                    Studies = p.User.Studies,
                    Skill1 = p.User.Skill1,
                    Skill2 = p.User.Skill2,
                    Skill3 = p.User.Skill3,
                    Skill4 = p.User.Skill4
                })
                .ToList()
        };

        return Ok(response);
    }
}