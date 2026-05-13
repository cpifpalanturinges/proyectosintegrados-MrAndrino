using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;
using TeamDraft.Api.Entities;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminUsersController : ControllerBase
{
    private const string DefaultProfilePhotoPath = "/images/default-profile.png";

    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IPhotoService _photoService;

    public AdminUsersController(
        AppDbContext context,
        IPasswordService passwordService,
        IPhotoService photoService)
    {
        _context = context;
        _passwordService = passwordService;
        _photoService = photoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListDto>>> GetUsers([FromQuery] string? search)
    {
        var query = _context.Users
            .Where(u => u.Role == "Leader" || u.Role == "Participant");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(u =>
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s)
            );
        }

        var users = await query
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

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserDetailDto>> GetUserById(int userId)
    {
        var user = await _context.Users
            .Include(u => u.AssignedTeam)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (!CanManageTargetUser(user))
        {
            return Forbid();
        }

        var activePickId = await _context.Picks
            .Where(p => p.UserId == user.UserId && !p.IsCancelled)
            .Select(p => (int?)p.PickId)
            .FirstOrDefaultAsync();

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
            AssignedTeamName = user.AssignedTeam?.Name,
            PickId = activePickId
        };

        return Ok(response);
    }

    [HttpPut("{userId}/password")]
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

        if (!CanManageTargetUser(user))
        {
            return Forbid();
        }

        user.PasswordHash = _passwordService.HashPassword(user, dto.NewPassword);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{userId}")]
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

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (!CanManageTargetUser(user))
        {
            return Forbid();
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

    [HttpPut("{userId}/photo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateUserPhoto(int userId, [FromForm] UpdateUserPhotoDto dto)
    {
        if (dto.Photo is null || dto.Photo.Length == 0)
        {
            return BadRequest("Photo is required.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (!CanManageTargetUser(user))
        {
            return Forbid();
        }

        string? newPhotoPath = null;

        try
        {
            newPhotoPath = await _photoService.SavePhotoAsync(dto.Photo);

            if (!string.IsNullOrWhiteSpace(user.PhotoPath) &&
                user.PhotoPath != DefaultProfilePhotoPath)
            {
                _photoService.DeletePhoto(user.PhotoPath);
            }

            user.PhotoPath = newPhotoPath;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch
        {
            if (!string.IsNullOrWhiteSpace(newPhotoPath))
            {
                _photoService.DeletePhoto(newPhotoPath);
            }

            throw;
        }
    }

    [HttpDelete("{userId}/photo")]
    public async Task<IActionResult> ResetUserPhoto(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (!CanManageTargetUser(user))
        {
            return Forbid();
        }

        if (!string.IsNullOrWhiteSpace(user.PhotoPath) &&
            user.PhotoPath != DefaultProfilePhotoPath)
        {
            _photoService.DeletePhoto(user.PhotoPath);
        }

        user.PhotoPath = DefaultProfilePhotoPath;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        if (currentUserId.Value == userId)
        {
            return BadRequest("You cannot delete your own account.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        if (!CanManageTargetUser(user))
        {
            return Forbid();
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            if (user.Role == "Leader")
            {
                var team = await _context.Teams
                    .Include(t => t.Picks)
                        .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(t => t.LeaderUserId == user.UserId);

                if (team is not null)
                {
                    foreach (var pick in team.Picks)
                    {
                        pick.User.AssignedTeamId = null;
                    }

                    user.AssignedTeamId = null;

                    await _context.SaveChangesAsync();

                    _context.Picks.RemoveRange(team.Picks);
                    _context.Teams.Remove(team);

                    await _context.SaveChangesAsync();
                }
            }

            if (user.Role == "Participant")
            {
                var userPicks = await _context.Picks
                    .Where(p => p.UserId == user.UserId)
                    .ToListAsync();

                _context.Picks.RemoveRange(userPicks);
                user.AssignedTeamId = null;

                await _context.SaveChangesAsync();
            }

            if (!string.IsNullOrWhiteSpace(user.PhotoPath) &&
                user.PhotoPath != DefaultProfilePhotoPath)
            {
                _photoService.DeletePhoto(user.PhotoPath);
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return userId;
    }

    private bool CanManageTargetUser(User targetUser)
    {
        if (User.IsInRole("Admin"))
        {
            return true;
        }

        if (!User.IsInRole("Coordinator"))
        {
            return false;
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return false;
        }

        if (targetUser.Role == "Admin")
        {
            return false;
        }

        if (targetUser.Role == "Coordinator" && targetUser.UserId != currentUserId.Value)
        {
            return false;
        }

        return true;
    }
}