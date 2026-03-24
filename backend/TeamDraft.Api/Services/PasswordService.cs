using Microsoft.AspNetCore.Identity;
using TeamDraft.Api.Entities;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Services;

public class PasswordService : IPasswordService
{
    private readonly PasswordHasher<User> _passwordHasher;

    public PasswordService()
    {
        _passwordHasher = new PasswordHasher<User>();
    }

    public string HashPassword(User user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(User user, string hashedPassword, string providedPassword)
    {
        var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);

        return result == PasswordVerificationResult.Success
            || result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}