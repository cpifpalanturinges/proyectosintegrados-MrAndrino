using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using TeamDraft.Api.Services.Interfaces;

namespace TeamDraft.Api.Services;

public class PhotoService : IPhotoService
{
    private const long MaxPhotoSizeInBytes = 10 * 1024 * 1024;
    private const int ProfilePhotoSize = 900;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private readonly IWebHostEnvironment _environment;

    public PhotoService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SavePhotoAsync(IFormFile photo)
    {
        ValidatePhoto(photo);

        var webRootPath = GetWebRootPath();
        var uploadsFolder = Path.Combine(webRootPath, "uploads", "photos");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var fileName = $"{Guid.NewGuid():N}.webp";
        var filePath = Path.Combine(uploadsFolder, fileName);

        try
        {
            await using var inputStream = photo.OpenReadStream();

            using var image = await Image.LoadAsync(inputStream);

            image.Mutate(context =>
                context
                    .AutoOrient()
                    .Resize(new ResizeOptions
                    {
                        Size = new Size(ProfilePhotoSize, ProfilePhotoSize),
                        Mode = ResizeMode.Crop,
                        Position = AnchorPositionMode.Center
                    })
            );

            var encoder = new WebpEncoder
            {
                Quality = 82
            };

            await image.SaveAsWebpAsync(filePath, encoder);
        }
        catch
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            throw new InvalidOperationException("The uploaded file is not a valid image.");
        }

        return $"/uploads/photos/{fileName}";
    }

    public void DeletePhoto(string photoPath)
    {
        if (string.IsNullOrWhiteSpace(photoPath))
        {
            return;
        }

        if (photoPath == "/images/default-profile.png")
        {
            return;
        }

        var webRootPath = GetWebRootPath();

        var relativePath = photoPath
            .TrimStart('/')
            .Replace("/", Path.DirectorySeparatorChar.ToString());

        var fullPath = Path.Combine(webRootPath, relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    private string GetWebRootPath()
    {
        if (!string.IsNullOrWhiteSpace(_environment.WebRootPath))
        {
            return _environment.WebRootPath;
        }

        return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
    }

    private static void ValidatePhoto(IFormFile photo)
    {
        if (photo is null || photo.Length == 0)
        {
            throw new InvalidOperationException("Photo is required.");
        }

        if (photo.Length > MaxPhotoSizeInBytes)
        {
            throw new InvalidOperationException("Photo size cannot exceed 10 MB.");
        }

        var extension = Path.GetExtension(photo.FileName);

        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Only JPG, PNG or WEBP images are allowed.");
        }

        if (!AllowedContentTypes.Contains(photo.ContentType))
        {
            throw new InvalidOperationException("Only JPG, PNG or WEBP images are allowed.");
        }
    }
}