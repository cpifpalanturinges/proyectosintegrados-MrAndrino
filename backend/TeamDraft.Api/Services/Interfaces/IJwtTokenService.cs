using TeamDraft.Api.Entities;

namespace TeamDraft.Api.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}