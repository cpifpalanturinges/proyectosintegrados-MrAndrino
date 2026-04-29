using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Controllers;

[ApiController]
[Route("api/admin/system")]
[Authorize(Roles = "Admin,Coordinator")]
public class AdminSystemController : ControllerBase
{
    private const string DefaultProfilePhotoPath = "/images/default-profile.png";

    private readonly AppDbContext _context;
    private readonly IPhotoService _photoService;

    public AdminSystemController(AppDbContext context, IPhotoService photoService)
    {
        _context = context;
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
                    u.PhotoPath != DefaultProfilePhotoPath
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
}