using System.ComponentModel.DataAnnotations;

namespace BE_Mobile.Contracts.Admin;

public sealed class AdminPageQuery
{
    [Range(1, 1000000)] public int Page { get; set; } = 1;
    [Range(1, 100)] public int PageSize { get; set; } = 20;
}
public sealed class AssignAdminTeacherRequest
{
    public bool IsPrimary { get; set; }
}
public sealed class SaveAdminEnrollmentRequest
{
    [Range(0, 2)] public byte Status { get; set; } = 1;
}

public sealed class SaveAdminClassScheduleRequest : IValidatableObject
{
    [Range(2, 8)] public byte DayOfWeek { get; set; } = 2;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    [MaxLength(50)] public string? Room { get; set; }
    [MaxLength(100)] public string? Building { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly EffectiveTo { get; set; }
    [MaxLength(500)] public string? Note { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndTime <= StartTime)
            yield return new ValidationResult("End time must be later than start time.", [nameof(EndTime)]);
        if (EffectiveTo < EffectiveFrom)
            yield return new ValidationResult("Effective-to date must not be earlier than effective-from date.", [nameof(EffectiveTo)]);
    }
}

public sealed class SaveAdminExamRequest
{
    [Required, MaxLength(200)] public string ExamName { get; set; } = string.Empty;
    [Range(1, 4)] public byte ExamType { get; set; } = 3;
    public DateOnly ExamDate { get; set; }
    public TimeOnly StartTime { get; set; }
    [Range(1, 1440)] public short DurationMinutes { get; set; } = 60;
    [MaxLength(50)] public string? Room { get; set; }
    [MaxLength(500)] public string? Note { get; set; }
}

public sealed record AdminSectionTeacherDto(long SectionId, long TeacherId, string TeacherCode,
    string FullName, bool IsPrimary, DateTime AssignedAt);
public sealed record AdminEnrollmentDto(long EnrollmentId, long SectionId, long StudentId,
    string StudentCode, string FullName, byte Status, DateTime EnrolledAt);
public sealed record AdminClassScheduleDto(long ScheduleId, long SectionId, byte DayOfWeek,
    string StartTime, string EndTime, string? Room, string? Building,
    DateOnly EffectiveFrom, DateOnly EffectiveTo, string? Note);
public sealed record AdminExamDto(long ExamId, long SectionId, long CreatedByUserId,
    string CreatedByFullName, string ExamName, byte ExamType, DateOnly ExamDate,
    string StartTime, short DurationMinutes, string? Room, string? Note, DateTime CreatedAt);
public sealed record AdminStatisticsDto(int TotalUsers, int ActiveUsers, int TotalStudents, int ActiveStudents,
    int TotalTeachers, int ActiveTeachers, int TotalCourses, int TotalSections, int OpenSections,
    int TotalSemesters, int ActiveEnrollments);
