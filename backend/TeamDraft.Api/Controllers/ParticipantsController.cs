using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Participants;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParticipantsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ParticipantsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("available")]
    public async Task<ActionResult<List<AvailableParticipantDto>>> GetAvailable([FromQuery] AvailableParticipantsQueryDto query)
    {
        var participantsQuery = _context.Users
            .Where(u => u.Role == "Participant" && u.AssignedTeamId == null);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            participantsQuery = participantsQuery.Where(u =>
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        participantsQuery = query.SortBy?.ToLower() switch
        {
            "skill1" => participantsQuery.OrderByDescending(u => u.Skill1).ThenBy(u => u.FirstName).ThenBy(u => u.LastName),
            "skill2" => participantsQuery.OrderByDescending(u => u.Skill2).ThenBy(u => u.FirstName).ThenBy(u => u.LastName),
            "skill3" => participantsQuery.OrderByDescending(u => u.Skill3).ThenBy(u => u.FirstName).ThenBy(u => u.LastName),
            "skill4" => participantsQuery.OrderByDescending(u => u.Skill4).ThenBy(u => u.FirstName).ThenBy(u => u.LastName),
            _ => participantsQuery
                .OrderByDescending(u => (u.Skill1 ?? 0) + (u.Skill2 ?? 0) + (u.Skill3 ?? 0) + (u.Skill4 ?? 0))
                .ThenBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
        };

        var participants = await participantsQuery
            .Select(u => new AvailableParticipantDto
            {
                UserId = u.UserId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhotoPath = u.PhotoPath,
                Studies = u.Studies,
                Skill1 = u.Skill1,
                Skill2 = u.Skill2,
                Skill3 = u.Skill3,
                Skill4 = u.Skill4
            })
            .ToListAsync();

        return Ok(participants);
    }
}