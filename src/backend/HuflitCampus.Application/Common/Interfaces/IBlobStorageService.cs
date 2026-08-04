namespace HuflitCampus.Application.Common.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        string? folder = null,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string blobUrl, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string blobUrl, CancellationToken cancellationToken = default);
}
