using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Storage;

public sealed class AzureBlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _container;
    private readonly BlobStorageOptions _options;

    public AzureBlobStorageService(IOptions<BlobStorageOptions> options)
    {
        _options = options.Value;
        if (string.IsNullOrWhiteSpace(_options.ConnectionString))
            throw new InvalidOperationException("AzureBlob:ConnectionString is not configured.");

        var serviceClient = new BlobServiceClient(_options.ConnectionString);
        _container = serviceClient.GetBlobContainerClient(_options.ContainerName);
    }

    public async Task<string> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        await _container.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken);

        var safeName = Path.GetFileName(fileName);
        var blobName = string.IsNullOrWhiteSpace(folder)
            ? $"{Guid.NewGuid():N}_{safeName}"
            : $"{folder.Trim('/')}/{Guid.NewGuid():N}_{safeName}";

        var blobClient = _container.GetBlobClient(blobName);
        await blobClient.UploadAsync(
            content,
            new BlobHttpHeaders { ContentType = contentType },
            cancellationToken: cancellationToken);

        if (!string.IsNullOrWhiteSpace(_options.PublicBaseUrl))
            return $"{_options.PublicBaseUrl.TrimEnd('/')}/{blobName}";

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string blobUrl, CancellationToken cancellationToken = default)
    {
        var blobName = ExtractBlobName(blobUrl);
        if (string.IsNullOrWhiteSpace(blobName))
            return;

        var blobClient = _container.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
    }

    public async Task<bool> ExistsAsync(string blobUrl, CancellationToken cancellationToken = default)
    {
        var blobName = ExtractBlobName(blobUrl);
        if (string.IsNullOrWhiteSpace(blobName))
            return false;

        var blobClient = _container.GetBlobClient(blobName);
        return await blobClient.ExistsAsync(cancellationToken);
    }

    private string? ExtractBlobName(string blobUrl)
    {
        if (string.IsNullOrWhiteSpace(blobUrl))
            return null;

        if (Uri.TryCreate(blobUrl, UriKind.Absolute, out var uri))
        {
            var path = uri.AbsolutePath.TrimStart('/');
            var containerPrefix = _options.ContainerName + "/";
            if (path.StartsWith(containerPrefix, StringComparison.OrdinalIgnoreCase))
                return path[containerPrefix.Length..];
            return path;
        }

        return blobUrl.TrimStart('/');
    }
}
