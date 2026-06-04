using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using TeamDraft.Api.Data;
using TeamDraft.Api.DTOs.Admin;
using TeamDraft.Api.DTOs.Common;
using TeamDraft.Api.DTOs.System;
using TeamDraft.Api.Entities;
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

    [HttpGet("status")]
    public async Task<ActionResult<SystemStatusDto>> GetStatus()
    {
        var systemState = await GetOrCreateSystemStateAsync();

        return Ok(MapSystemStatus(systemState));
    }

    [HttpPost("draft/open")]
    public async Task<ActionResult<SystemStatusDto>> OpenDraft()
    {
        var systemState = await GetOrCreateSystemStateAsync();

        systemState.IsDraftOpen = true;
        systemState.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapSystemStatus(systemState));
    }

    [HttpPost("draft/pause")]
    public async Task<ActionResult<SystemStatusDto>> PauseDraft()
    {
        var systemState = await GetOrCreateSystemStateAsync();

        systemState.IsDraftOpen = false;
        systemState.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapSystemStatus(systemState));
    }

    [HttpGet("picks")]
    public async Task<ActionResult<PagedResultDto<PickHistoryItemDto>>> GetPicksHistory([FromQuery] PickHistoryQueryDto query)
    {
        var picksQuery = _context.Picks
            .Include(p => p.Team)
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.PickId)
            .Select(p => new PickHistoryItemDto
            {
                PickId = p.PickId,
                TeamId = p.TeamId,
                TeamName = p.Team.Name,
                UserId = p.UserId,
                FirstName = p.User.FirstName,
                LastName = p.User.LastName,
                PhotoPath = p.User.PhotoPath,
                PickOrder = p.PickOrder,
                CreatedAt = p.CreatedAt,
                IsCancelled = p.IsCancelled
            });

        var picks = await picksQuery.ToPagedResultAsync(query.Page, query.PageSize);

        return Ok(picks);
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

            var systemState = await GetOrCreateSystemStateAsync();
            systemState.IsDraftOpen = false;
            systemState.UpdatedAt = DateTime.UtcNow;

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

    [HttpGet("picks/latest-active")]
    public async Task<ActionResult<PickHistoryItemDto?>> GetLatestActivePick()
    {
        var latestPick = await _context.Picks
            .Include(p => p.Team)
            .Include(p => p.User)
            .Where(p => !p.IsCancelled)
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.PickId)
            .Select(p => new PickHistoryItemDto
            {
                PickId = p.PickId,
                TeamId = p.TeamId,
                TeamName = p.Team.Name,
                UserId = p.UserId,
                FirstName = p.User.FirstName,
                LastName = p.User.LastName,
                PhotoPath = p.User.PhotoPath,
                PickOrder = p.PickOrder,
                CreatedAt = p.CreatedAt,
                IsCancelled = p.IsCancelled
            })
            .FirstOrDefaultAsync();

        return Ok(latestPick);
    }

    private async Task<SystemState> GetOrCreateSystemStateAsync()
    {
        var systemState = await _context.SystemStates
            .FirstOrDefaultAsync(s => s.SystemStateId == 1);

        if (systemState is not null)
        {
            return systemState;
        }

        systemState = new SystemState
        {
            SystemStateId = 1,
            IsDraftOpen = false,
            UpdatedAt = DateTime.UtcNow
        };

        _context.SystemStates.Add(systemState);
        await _context.SaveChangesAsync();

        return systemState;
    }

    private static SystemStatusDto MapSystemStatus(SystemState systemState)
    {
        return new SystemStatusDto
        {
            IsDraftOpen = systemState.IsDraftOpen,
            UpdatedAt = systemState.UpdatedAt
        };
    }
}