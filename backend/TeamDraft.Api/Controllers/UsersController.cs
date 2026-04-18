using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Teams;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me/team")]
    public async Task<ActionResult<MyTeamDto>> GetMyTeam()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (user.Role is "Admin" or "Coordinator")
        {
            return NotFound("This user does not have a team.");
        }

        var team = user.Role switch
        {
            "Leader" => await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Picks)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(t => t.LeaderUserId == user.UserId),

            "Participant" when user.AssignedTeamId is not null => await _context.Teams
                .Include(t => t.Leader)
                .Include(t => t.Picks)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(t => t.TeamId == user.AssignedTeamId),

            _ => null
        };

        if (team is null)
        {
            return NotFound("This user does not have a team.");
        }

        var response = new MyTeamDto
        {
            TeamId = team.TeamId,
            Name = team.Name,
            Leader = new TeamLeaderDto
            {
                UserId = team.Leader.UserId,
                Username = team.Leader.Username,
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
                .Select(p => new TeamMemberDto
                {
                    UserId = p.User.UserId,
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