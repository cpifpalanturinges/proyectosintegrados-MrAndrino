using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public AdminController(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    [HttpPost("picks/{pickId}/undo")]
    public async Task<ActionResult<UndoPickResultDto>> UndoPick(int pickId)
    {
        var pick = await _context.Picks
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PickId == pickId);

        if (pick is null)
        {
            return NotFound("Pick not found.");
        }

        if (pick.IsCancelled)
        {
            return BadRequest("Pick is already cancelled.");
        }

        pick.IsCancelled = true;
        pick.User.AssignedTeamId = null;

        await _context.SaveChangesAsync();

        var response = new UndoPickResultDto
        {
            PickId = pick.PickId,
            UserId = pick.UserId,
            Message = "Pick undone successfully."
        };

        return Ok(response);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserListDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserListDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Role = u.Role,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhotoPath = u.PhotoPath
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("users/{userId}")]
    public async Task<ActionResult<UserDetailDto>> GetUserById(int userId)
    {
        var user = await _context.Users
            .Include(u => u.AssignedTeam)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        var response = new UserDetailDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Role = user.Role,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhotoPath = user.PhotoPath,
            Studies = user.Studies,
            Skill1 = user.Skill1,
            Skill2 = user.Skill2,
            Skill3 = user.Skill3,
            Skill4 = user.Skill4,
            AssignedTeamId = user.AssignedTeamId,
            AssignedTeamName = user.AssignedTeam != null ? user.AssignedTeam.Name : null
        };

        return Ok(response);
    }

    [HttpGet("teams")]
    public async Task<ActionResult<List<TeamListDto>>> GetTeams()
    {
        var teams = await _context.Teams
            .Include(t => t.Leader)
            .Include(t => t.Picks)
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

    [HttpGet("teams/{teamId}")]
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
                PhotoPath = team.Leader.PhotoPath
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
                    PhotoPath = p.User.PhotoPath
                })
                .ToList()
        };

        return Ok(response);
    }

    [HttpPut("users/{userId}/password")]
    public async Task<IActionResult> UpdateUserPassword(int userId, UpdateUserPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest("New password is required.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        user.PasswordHash = _passwordService.HashPassword(user, dto.NewPassword);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("users/{userId}")]
    public async Task<IActionResult> UpdateUser(int userId, UpdateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName))
        {
            return BadRequest("First name is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.LastName))
        {
            return BadRequest("Last name is required.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (user.Role is "Participant" or "Leader")
        {
            var skills = new[] { dto.Skill1, dto.Skill2, dto.Skill3, dto.Skill4 };

            if (skills.Any(skill => skill is null))
            {
                return BadRequest("All skills are required for participants and leaders.");
            }

            if (skills.Any(skill => skill < 1 || skill > 5))
            {
                return BadRequest("All skills must be between 1 and 5.");
            }

            if (string.IsNullOrWhiteSpace(dto.Studies))
            {
                return BadRequest("Studies are required for participants and leaders.");
            }
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Studies = dto.Studies;
        user.Skill1 = dto.Skill1;
        user.Skill2 = dto.Skill2;
        user.Skill3 = dto.Skill3;
        user.Skill4 = dto.Skill4;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}