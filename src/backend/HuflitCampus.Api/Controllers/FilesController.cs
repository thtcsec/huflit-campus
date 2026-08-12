using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Constants;
using HuflitCampus.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HuflitCampus.Api.Controllers;

[Authorize(Policy = Policies.CanManageEvents)]
[Route("api/files")]
public sealed class FilesController(IBlobStorageService blobStorage) : ApiControllerBase
{
    private static readonly HashSet<string> AllowedFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "banner",
        "gallery"
    };

    [HttpPost("upload")]
    [EnableRateLimiting("upload")]
    [ProducesResponseType(typeof(FileUploadResponse), StatusCodes.Status200OK)]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromQuery] string folder = "gallery",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return Problem(
                detail: "A non-empty file is required.",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Upload failed");
        }

        if (!AllowedFolders.Contains(folder))
        {
            return Problem(
                detail: "Folder must be either 'banner' or 'gallery'.",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Upload failed");
        }

        await using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length < 3)
        {
            return Problem(
                detail: "File content is too small to be a valid image.",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Upload failed");
        }

        buffer.Position = 0;
        var header = new byte[Math.Min(16, (int)buffer.Length)];
        _ = await buffer.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);

        var detected = ImageContentInspector.Detect(header);
        if (detected is null)
        {
            return Problem(
                detail: "Only JPEG, PNG, WebP, and GIF images are allowed (validated by file content).",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Upload failed");
        }

        buffer.Position = 0;
        var safeFileName = $"{Guid.NewGuid():N}{detected.Extension}";
        var url = await blobStorage.UploadAsync(
            buffer,
            safeFileName,
            detected.ContentType,
            folder,
            cancellationToken);

        return Ok(new FileUploadResponse
        {
            Url = url,
            FileName = safeFileName,
            ContentType = detected.ContentType,
            Size = buffer.Length,
            Folder = folder.ToLowerInvariant()
        });
    }
}

public sealed class FileUploadResponse
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Folder { get; set; } = string.Empty;
}
