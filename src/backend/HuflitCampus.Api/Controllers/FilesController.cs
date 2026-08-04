using HuflitCampus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/files")]
public sealed class FilesController(IBlobStorageService blobStorage) : ApiControllerBase
{
    private static readonly HashSet<string> AllowedFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "banner",
        "gallery"
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    };

    [HttpPost("upload")]
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

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return Problem(
                detail: "Only JPEG, PNG, WebP, and GIF images are allowed.",
                statusCode: StatusCodes.Status400BadRequest,
                title: "Upload failed");
        }

        await using var stream = file.OpenReadStream();
        var url = await blobStorage.UploadAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder,
            cancellationToken);

        return Ok(new FileUploadResponse
        {
            Url = url,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length,
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
