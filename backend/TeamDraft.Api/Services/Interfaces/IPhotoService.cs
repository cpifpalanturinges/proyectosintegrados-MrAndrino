using Microsoft.AspNetCore.Http;

namespace TeamDraft.Api.Services.Interfaces;

public interface IPhotoService
{
    Task<string> SavePhotoAsync(IFormFile photo);
    void DeletePhoto(string photoPath);
}