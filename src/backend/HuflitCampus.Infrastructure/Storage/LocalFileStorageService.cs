using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Infrastructure.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Storage;

public sealed class LocalFileStorageService : IBlobStorageService
{
    private readonly BlobStorageOptions _options;
    private readonly string _rootPath;

    public LocalFileStorageService(
        IOptions<BlobStorageOptions> options,
        IWebHostEnvironment environment)
    {
        _options = options.Value;
        _rootPath = Path.IsPathRooted(_options.LocalRootPath)
            ? _options.LocalRootPath
            : Path.Combine(environment.ContentRootPath, _options.LocalRootPath);

        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        var safeName = Path.GetFileName(fileName);
        // Prefer extension-only storage names; never trust original client filenames.
        var extension = Path.GetExtension(safeName);
        if (string.IsNullOrWhiteSpace(extension) || extension.Length > 8)
            extension = ".bin";

        var relativeFolder = string.IsNullOrWhiteSpace(folder)
            ? string.Empty
            : folder.Trim('/').Replace('\\', '/');

        var targetDir = string.IsNullOrEmpty(relativeFolder)
            ? _rootPath
            : Path.Combine(_rootPath, relativeFolder.Replace('/', Path.DirectorySeparatorChar));

        Directory.CreateDirectory(targetDir);

        var storedName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(targetDir, storedName);

        await using (var fileStream = File.Create(fullPath))
        {
            await content.CopyToAsync(fileStream, cancellationToken);
        }

        var requestPath = _options.LocalRequestPath.TrimEnd('/');
        var relativeUrl = string.IsNullOrEmpty(relativeFolder)
            ? $"{requestPath}/{storedName}"
            : $"{requestPath}/{relativeFolder}/{storedName}";

        return relativeUrl;
    }

    public Task DeleteAsync(string blobUrl, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolvePath(blobUrl);
        if (fullPath is not null && File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string blobUrl, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolvePath(blobUrl);
        return Task.FromResult(fullPath is not null && File.Exists(fullPath));
    }

    private string? ResolvePath(string blobUrl)
    {
        if (string.IsNullOrWhiteSpace(blobUrl))
            return null;

        var requestPath = _options.LocalRequestPath.TrimEnd('/');
        var relative = blobUrl;

        if (Uri.TryCreate(blobUrl, UriKind.Absolute, out var uri))
            relative = uri.AbsolutePath;

        if (relative.StartsWith(requestPath, StringComparison.OrdinalIgnoreCase))
            relative = relative[requestPath.Length..];

        relative = relative.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_rootPath, relative));

        if (!fullPath.StartsWith(Path.GetFullPath(_rootPath), StringComparison.OrdinalIgnoreCase))
            return null;

        return fullPath;
    }
}
