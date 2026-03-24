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

        var existingAdmin = await context.Users
            .FirstOrDefaultAsync(u => u.Username == adminUsername);

        if (existingAdmin is not null)
        {
            return;
        }

        var adminUser = new User
        {
            Username = adminUsername,
            Role = "Admin"
        };

        adminUser.PasswordHash = passwordService.HashPassword(adminUser, adminPassword);

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
    }
}