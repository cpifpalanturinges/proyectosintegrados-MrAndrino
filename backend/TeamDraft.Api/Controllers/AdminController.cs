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
[Route("api/admin")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IPhotoService _photoService;

    public AdminController(AppDbContext context, IPasswordService passwordService, IPhotoService photoService)
    {
        _context = context;
        _passwordService = passwordService;
        _photoService = photoService;
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
    public async Task<ActionResult<List<UserListDto>>> GetUsers([FromQuery] string? search)
    {
        var query = _context.Users
            .Where(u => u.Role == "Leader" || u.Role == "Participant");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(u =>
                u.FirstName!.ToLower().Contains(s) ||
                u.LastName!.ToLower().Contains(s)
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

        if (!CanManageTargetUser(user))
        {
            return Forbid();
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

        if (!CanManageTargetUser(user))
        {
            return Forbid();
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

    [HttpPost("coordinators")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateCoordinator([FromForm] CreateCoordinatorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
        {
            return BadRequest("Username is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Password is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.FirstName))
        {
            return BadRequest("First name is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.LastName))
        {
            return BadRequest("Last name is required.");
        }

        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == dto.Username);

        if (usernameExists)
        {
            return BadRequest("Username already exists.");
        }

        string? photoPath = null;

        try
        {
            if (dto.Photo is not null && dto.Photo.Length > 0)
            {
                photoPath = await _photoService.SavePhotoAsync(dto.Photo);
            }

            var user = new User
            {
                Username = dto.Username,
                Role = "Coordinator",
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhotoPath = photoPath
            };

            user.PasswordHash = _passwordService.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Coordinator created successfully." });
        }
        catch
        {
            if (!string.IsNullOrWhiteSpace(photoPath))
            {
                _photoService.DeletePhoto(photoPath);
            }

            throw;
        }
    }

    [HttpGet("coordinators")]
    public async Task<ActionResult<List<UserListDto>>> GetCoordinators([FromQuery] string? search)
    {
        var query = _context.Users
            .Where(u => u.Role == "Coordinator");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(u =>
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s)
            );
        }

        var coordinators = await query
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

        return Ok(coordinators);
    } 

    [HttpPut("teams/{teamId}")]
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

        team.Name = dto.Name;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("users/{userId}/photo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateUserPhoto(int userId, IFormFile photo)
    {
        if (photo is null || photo.Length == 0)
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
            newPhotoPath = await _photoService.SavePhotoAsync(photo);

            if (!string.IsNullOrWhiteSpace(user.PhotoPath))
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

    [HttpDelete("users/{userId}/photo")]
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

        if (!string.IsNullOrWhiteSpace(user.PhotoPath))
        {
            _photoService.DeletePhoto(user.PhotoPath);
        }

        // ruta de imagen por defecto
        user.PhotoPath = "/images/default-profile.png";

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("users/{userId}")]
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
                user.PhotoPath != "/images/default-profile.png")
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

    [HttpPost("reset")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetSystem()
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var usersToDelete = await _context.Users
                .Where(u => u.Role != "Admin")
                .ToListAsync();

            var photoPathsToDelete = usersToDelete
                .Where(u =>
                    !string.IsNullOrWhiteSpace(u.PhotoPath) &&
                    u.PhotoPath != "/images/default-profile.png"
                )
                .Select(u => u.PhotoPath!)
                .ToList();

            var picks = await _context.Picks.ToListAsync();
            var teams = await _context.Teams.ToListAsync();

            _context.Picks.RemoveRange(picks);
            await _context.SaveChangesAsync();

            foreach (var user in usersToDelete)
            {
                user.AssignedTeamId = null;
            }

            await _context.SaveChangesAsync();

            _context.Teams.RemoveRange(teams);
            await _context.SaveChangesAsync();

            _context.Users.RemoveRange(usersToDelete);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            foreach (var photoPath in photoPathsToDelete)
            {
                _photoService.DeletePhoto(photoPath);
            }

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