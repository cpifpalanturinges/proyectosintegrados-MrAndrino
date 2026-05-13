using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Picks;
using TeamDraft.Api.Entities;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PicksController : ControllerBase
{
    private readonly AppDbContext _context;

    public PicksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<PickResultDto>> CreatePick(CreatePickDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var leaderUserId))
        {
            return Unauthorized();
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var leader = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == leaderUserId);

            if (leader is null)
            {
                return NotFound("User not found.");
            }

            if (leader.Role != "Leader")
            {
                return Forbid();
            }

            var team = await _context.Teams
                .Include(t => t.Picks)
                .FirstOrDefaultAsync(t => t.LeaderUserId == leader.UserId);

            if (team is null)
            {
                return BadRequest("Leader does not have a team.");
            }

            var participant = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == dto.UserId);

            if (participant is null)
            {
                return NotFound("Participant not found.");
            }

            if (participant.Role != "Participant")
            {
                return BadRequest("Only participants can be picked.");
            }

            if (participant.AssignedTeamId is not null)
            {
                return BadRequest("Participant already assigned.");
            }

            var assignedRows = await _context.Database.ExecuteSqlInterpolatedAsync($@"
                UPDATE Users
                SET AssignedTeamId = {team.TeamId}
                WHERE UserId = {participant.UserId}
                  AND Role = {"Participant"}
                  AND AssignedTeamId IS NULL
            ");

            if (assignedRows != 1)
            {
                await transaction.RollbackAsync();
                return BadRequest("Participant already assigned.");
            }

            var nextPickOrder = team.Picks
                .Select(p => p.PickOrder)
                .DefaultIfEmpty(0)
                .Max() + 1;

            var pick = new Pick
            {
                TeamId = team.TeamId,
                UserId = participant.UserId,
                PickOrder = nextPickOrder,
                CreatedAt = DateTime.UtcNow,
                IsCancelled = false
            };

            _context.Picks.Add(pick);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var response = new PickResultDto
            {
                TeamId = team.TeamId,
                TeamName = team.Name,
                UserId = participant.UserId,
                PickOrder = pick.PickOrder,
                FirstName = participant.FirstName,
                LastName = participant.LastName,
                PhotoPath = participant.PhotoPath
            };

            return Ok(response);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return BadRequest("Pick could not be completed. Please refresh and try again.");
        }
    }
}