using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Users;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Queries;

public record GetMyAchievementsQuery : IRequest<Result<IReadOnlyList<AchievementDto>>>;

public class GetMyAchievementsQueryHandler : IRequestHandler<GetMyAchievementsQuery, Result<IReadOnlyList<AchievementDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<Achievement> _achievementRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly ISavedEventRepository _savedEventRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetMyAchievementsQueryHandler(
        ICurrentUserService currentUser,
        IRepository<Achievement> achievementRepository,
        IRegistrationRepository registrationRepository,
        IAttendanceRepository attendanceRepository,
        ISavedEventRepository savedEventRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _achievementRepository = achievementRepository;
        _registrationRepository = registrationRepository;
        _attendanceRepository = attendanceRepository;
        _savedEventRepository = savedEventRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<AchievementDto>>> Handle(
        GetMyAchievementsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var userId = _currentUser.UserId.Value;

        // Fetch existing achievements
        var existing = _achievementRepository.Query()
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.EarnedAt)
            .ToList();

        var existingTitles = existing.Select(a => a.Title).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var awardedAny = false;

        // 1. Welcome / Member achievement
        if (!existingTitles.Contains("HUFLIT Citizen"))
        {
            var ach = Achievement.Create(
                userId,
                "HUFLIT Citizen",
                "Gia nhập nền tảng kỹ thuật số HUFLIT Campus EMS.",
                "verified_user");
            _achievementRepository.Add(ach);
            existing.Add(ach);
            awardedAny = true;
        }

        // 2. Check registration count
        var regCount = await _registrationRepository.CountAsync(r => r.UserId == userId && !r.IsDeleted, cancellationToken);

        if (regCount >= 1 && !existingTitles.Contains("First Step"))
        {
            var ach = Achievement.Create(
                userId,
                "First Step",
                "Đăng ký tham gia sự kiện campus đầu tiên.",
                "event_available");
            _achievementRepository.Add(ach);
            existing.Add(ach);
            awardedAny = true;
        }

        // 3. Check attendance count
        var checkInCount = await _attendanceRepository.CountAsync(a => a.UserId == userId && !a.IsDeleted && a.Type == AttendanceType.CheckIn, cancellationToken);

        if (checkInCount >= 1 && !existingTitles.Contains("Check-in Champion"))
        {
            var ach = Achievement.Create(
                userId,
                "Check-in Champion",
                "Hoàn thành điểm danh QR thành công tại sự kiện.",
                "qr_code_scanner");
            _achievementRepository.Add(ach);
            existing.Add(ach);
            awardedAny = true;
        }

        if (checkInCount >= 3 && !existingTitles.Contains("Campus Enthusiast"))
        {
            var ach = Achievement.Create(
                userId,
                "Campus Enthusiast",
                "Đã tham gia và điểm danh từ 3 sự kiện trở lên.",
                "military_tech");
            _achievementRepository.Add(ach);
            existing.Add(ach);
            awardedAny = true;
        }

        // 4. Saved events
        var saveCount = await _savedEventRepository.CountAsync(s => s.UserId == userId && !s.IsDeleted, cancellationToken);

        if (saveCount >= 3 && !existingTitles.Contains("Bookmark Collector"))
        {
            var ach = Achievement.Create(
                userId,
                "Bookmark Collector",
                "Đã lưu từ 3 sự kiện yêu thích vào danh sách theo dõi.",
                "bookmark");
            _achievementRepository.Add(ach);
            existing.Add(ach);
            awardedAny = true;
        }

        if (awardedAny)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var dtos = existing
            .OrderByDescending(a => a.EarnedAt)
            .Select(a => new AchievementDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Title = a.Title,
                Description = a.Description,
                IconUrl = a.IconUrl,
                EarnedAt = a.EarnedAt
            })
            .ToList();

        return Result.Success<IReadOnlyList<AchievementDto>>(dtos);
    }
}
