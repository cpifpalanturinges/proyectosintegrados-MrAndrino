using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
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

    [HttpPost("picks/{pickId:int}/undo")]
    public async Task<ActionResult<UndoPickResultDto>> UndoPick(int pickId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        try
        {
            var pick = await _context.Picks
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PickId == pickId);

            if (pick is null)
            {
                await transaction.RollbackAsync();
                return NotFound("Pick not found.");
            }

            if (pick.IsCancelled)
            {
                await transaction.RollbackAsync();
                return BadRequest("Pick is already cancelled.");
            }

            if (pick.User.AssignedTeamId != pick.TeamId)
            {
                await transaction.RollbackAsync();
                return BadRequest("The participant is no longer assigned to this pick team.");
            }

            pick.IsCancelled = true;
            pick.User.AssignedTeamId = null;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var response = new UndoPickResultDto
            {
                PickId = pick.PickId,
                UserId = pick.UserId,
                Message = "Pick undone successfully."
            };

            return Ok(response);
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
                    u.PhotoPath != DefaultProfilePhotoPath
                )
                .Select(u => u.PhotoPath!)
                .Distinct()
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