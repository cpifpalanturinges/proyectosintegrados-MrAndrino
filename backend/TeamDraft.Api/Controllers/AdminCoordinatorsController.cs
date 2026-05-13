using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;
using TeamDraft.Api.Entities;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/admin/coordinators")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminCoordinatorsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IPhotoService _photoService;

    public AdminCoordinatorsController(
        AppDbContext context,
        IPasswordService passwordService,
        IPhotoService photoService)
    {
        _context = context;
        _passwordService = passwordService;
        _photoService = photoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListDto>>> GetCoordinators([FromQuery] string? search)
    {
        var query = _context.Users
            .Where(u => u.Role == "Coordinator");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(u =>
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s) ||
                u.Username.ToLower().Contains(s)
            );
        }

        var coordinators = await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
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

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateCoordinator([FromForm] CreateCoordinatorDto dto)
    {
        var username = NormalizeUsername(dto.Username);

        if (string.IsNullOrWhiteSpace(username))
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
            .AnyAsync(u => u.Username == username);

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
                Username = username,
                Role = "Coordinator",
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                PhotoPath = photoPath ?? "/images/default-profile.png"
            };

            user.PasswordHash = _passwordService.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Coordinator created successfully." });
        }
        catch (DbUpdateException exception) when (IsDuplicateUsernameException(exception))
        {
            if (!string.IsNullOrWhiteSpace(photoPath))
            {
                _photoService.DeletePhoto(photoPath);
            }

            return BadRequest("Username already exists.");
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

    private static string NormalizeUsername(string? username)
    {
        return username?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    private static bool IsDuplicateUsernameException(DbUpdateException exception)
    {
        return exception.InnerException is MySqlException mysqlException &&
               mysqlException.Number == 1062;
    }
}