namespace HuflitCampus.Domain.Constants;

public static class Roles
{
    public const string Guest = nameof(Guest);
    public const string Student = nameof(Student);
    public const string Lecturer = nameof(Lecturer);
    public const string ClubManager = nameof(ClubManager);
    public const string FacultyManager = nameof(FacultyManager);
    public const string Administrator = nameof(Administrator);

    public static readonly IReadOnlyList<string> All =
    [
        Guest,
        Student,
        Lecturer,
        ClubManager,
        FacultyManager,
        Administrator
    ];
}
