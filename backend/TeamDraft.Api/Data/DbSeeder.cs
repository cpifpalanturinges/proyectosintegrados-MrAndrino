using Microsoft.EntityFrameworkCore;
using TeamDraft.Api.Entities;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(AppDbContext context, IPasswordService passwordService)
    {
        const string adminUsername = "admin";
        const string adminPassword = "Admin123!";
        const string defaultPhotoPath = "/images/default-profile.png";

        var existingAdmin = await context.Users
            .FirstOrDefaultAsync(u => u.Username == adminUsername);

        if (existingAdmin is not null)
        {
            var hasChanges = false;

            if (string.IsNullOrWhiteSpace(existingAdmin.FirstName))
            {
                existingAdmin.FirstName = "Admin";
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(existingAdmin.LastName))
            {
                existingAdmin.LastName = "TeamDraft";
                hasChanges = true;
            }

            if (string.IsNullOrWhiteSpace(existingAdmin.PhotoPath) ||
                existingAdmin.PhotoPath.StartsWith("/uploads/photos/"))
            {
                existingAdmin.PhotoPath = defaultPhotoPath;
                hasChanges = true;
            }

            if (existingAdmin.Role != "Admin")
            {
                existingAdmin.Role = "Admin";
                hasChanges = true;
            }

            if (hasChanges)
            {
                await context.SaveChangesAsync();
            }

            return;
        }

        var adminUser = new User
        {
            Username = adminUsername,
            Role = "Admin",
            FirstName = "Admin",
            LastName = "TeamDraft",
            PhotoPath = defaultPhotoPath
        };

        adminUser.PasswordHash = passwordService.HashPassword(adminUser, adminPassword);

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
    }
}