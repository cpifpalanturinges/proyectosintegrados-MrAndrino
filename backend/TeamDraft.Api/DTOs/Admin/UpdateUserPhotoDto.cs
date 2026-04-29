using Microsoft.AspNetCore.Http;

namespace TeamDraft.Api.DTOs.Admin;

public class UpdateUserPhotoDto
{
    public IFormFile Photo { get; set; } = null!;
}