using Microsoft.AspNetCore.Http;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Services;

public class PhotoService : IPhotoService
{
    private readonly IWebHostEnvironment _environment;

    public PhotoService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SavePhotoAsync(IFormFile photo)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "photos");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var extension = Path.GetExtension(photo.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await photo.CopyToAsync(stream);

        return $"/uploads/photos/{fileName}";
    }

    public void DeletePhoto(string photoPath)
    {
        if (string.IsNullOrWhiteSpace(photoPath))
        {
            return;
        }

        var relativePath = photoPath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
        var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }
}