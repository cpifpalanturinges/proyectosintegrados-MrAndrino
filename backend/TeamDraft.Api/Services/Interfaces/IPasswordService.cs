using TeamDraft.Api.Entities;

namespace TeamDraft.Api.Services.Interfaces;

public interface IPasswordService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string hashedPassword, string providedPassword);
}