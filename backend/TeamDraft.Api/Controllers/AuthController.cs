using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Auth;
using TeamDraft.Api.Entities;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordService _passwordService;
    private readonly IPhotoService _photoService;

    public AuthController(
        AppDbContext context,
        IJwtTokenService jwtTokenService,
        IPasswordService passwordService,
        IPhotoService photoService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _passwordService = passwordService;
        _photoService = photoService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user is null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var isPasswordValid = _passwordService.VerifyPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (!isPasswordValid)
        {
            return Unauthorized("Invalid credentials.");
        }

        var token = _jwtTokenService.GenerateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Username = user.Username,
            Role = user.Role
        };

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.AssignedTeam)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound("User not found.");
        }

        var response = new CurrentUserDto
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
            AssignedTeamName = user.AssignedTeam?.Name
        };

        return Ok(response);
    }
    
    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromForm] RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest("Username is required.");
        }

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            return BadRequest("First name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            return BadRequest("Last name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Password is required.");
        }

        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == request.Username);

        if (usernameExists)
        {
            return BadRequest("Username is already taken.");
        }

        if (request.IsLeader && string.IsNullOrWhiteSpace(request.TeamName))
        {
            return BadRequest("Team name is required for leaders.");
        }

        if (request.Photo is null || request.Photo.Length == 0)
        {
            return BadRequest("Photo is required.");
        }

        var skills = new[] { request.Skill1, request.Skill2, request.Skill3, request.Skill4 };

        if (skills.Any(skill => skill is null))
        {
            return BadRequest("All skills are required.");
        }

        if (skills.Any(skill => skill < 1 || skill > 5))
        {
            return BadRequest("All skills must be between 1 and 5.");
        }

        if (string.IsNullOrWhiteSpace(request.Studies))
        {
            return BadRequest("Studies are required.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        string? photoPath = null;

        try
        {
            photoPath = await _photoService.SavePhotoAsync(request.Photo);

            var userRole = request.IsLeader ? "Leader" : "Participant";

            var user = new User
            {
                Username = request.Username,
                Role = userRole,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhotoPath = photoPath,
                Skill1 = request.Skill1,
                Skill2 = request.Skill2,
                Skill3 = request.Skill3,
                Skill4 = request.Skill4,
                Studies = request.Studies
            };

            user.PasswordHash = _passwordService.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (request.IsLeader)
            {
                var team = new Team
                {
                    Name = request.TeamName!,
                    LeaderUserId = user.UserId
                };

                _context.Teams.Add(team);
                await _context.SaveChangesAsync();

                user.AssignedTeamId = team.TeamId;
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            var token = _jwtTokenService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Role = user.Role
            };

            return Ok(response);
        }
        catch
        {
            await transaction.RollbackAsync();

            if (!string.IsNullOrWhiteSpace(photoPath))
            {
                _photoService.DeletePhoto(photoPath);
            }

            throw;
        }
    }
}