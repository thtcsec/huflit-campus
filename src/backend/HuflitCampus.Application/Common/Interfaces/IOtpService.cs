namespace HuflitCampus.Application.Common.Interfaces;

public interface IOtpService
{
    string GenerateCode(int length = 6);
    string HashCode(string code);
    bool VerifyCode(string code, string hash);
    TimeSpan DefaultLifetime { get; }
}
