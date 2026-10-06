using BE_Mobile.Contracts.Admin;
using BE_Mobile.Contracts.Common;
using BE_Mobile.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE_Mobile.Controllers.Admin;

[ApiController]
[Authorize(Roles = "ADMIN")]
[Route("api/admin/course-sections/{sectionId:long}")]
public sealed class AdminSectionManagementController(IAdminSectionManagementService service) : ControllerBase
{
    [HttpGet("teachers")]
    public async Task<ActionResult<PagedResult<AdminSectionTeacherDto>>> Teachers(long sectionId, [FromQuery] AdminPageQuery query, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.TeachersAsync(sectionId, query, cancellationToken));
    [HttpPut("teachers/{teacherId:long}")]
    public async Task<ActionResult<AdminSectionTeacherDto>> AssignTeacher(long sectionId, long teacherId, AssignAdminTeacherRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.AssignTeacherAsync(sectionId, teacherId, request, cancellationToken));
    [HttpDelete("teachers/{teacherId:long}")]
    public async Task<IActionResult> RemoveTeacher(long sectionId, long teacherId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.RemoveTeacherAsync(sectionId, teacherId, cancellationToken));
    [HttpGet("students")]
    public async Task<ActionResult<PagedResult<AdminEnrollmentDto>>> Students(long sectionId, [FromQuery] AdminPageQuery query, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.StudentsAsync(sectionId, query, cancellationToken));
    [HttpPut("students/{studentId:long}")]
    public async Task<ActionResult<AdminEnrollmentDto>> Enroll(long sectionId, long studentId, SaveAdminEnrollmentRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.EnrollAsync(sectionId, studentId, request, cancellationToken));
    [HttpDelete("students/{studentId:long}")]
    public async Task<IActionResult> CancelEnrollment(long sectionId, long studentId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.CancelEnrollmentAsync(sectionId, studentId, cancellationToken));

    [HttpGet("schedules")]
    public async Task<ActionResult<IReadOnlyList<AdminClassScheduleDto>>> Schedules(long sectionId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.SchedulesAsync(sectionId, cancellationToken));
    [HttpPost("schedules")]
    public async Task<ActionResult<AdminClassScheduleDto>> CreateSchedule(long sectionId, SaveAdminClassScheduleRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.SaveScheduleAsync(sectionId, null, request, cancellationToken));
    [HttpPut("schedules/{scheduleId:long}")]
    public async Task<ActionResult<AdminClassScheduleDto>> UpdateSchedule(long sectionId, long scheduleId, SaveAdminClassScheduleRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.SaveScheduleAsync(sectionId, scheduleId, request, cancellationToken));
    [HttpDelete("schedules/{scheduleId:long}")]
    public async Task<IActionResult> DeleteSchedule(long sectionId, long scheduleId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.DeleteScheduleAsync(sectionId, scheduleId, cancellationToken));

    [HttpGet("exams")]
    public async Task<ActionResult<IReadOnlyList<AdminExamDto>>> Exams(long sectionId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.ExamsAsync(sectionId, cancellationToken));
    [HttpPost("exams")]
    public async Task<ActionResult<AdminExamDto>> CreateExam(long sectionId, SaveAdminExamRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.SaveExamAsync(sectionId, null, CurrentUserId(), request, cancellationToken));
    [HttpPut("exams/{examId:long}")]
    public async Task<ActionResult<AdminExamDto>> UpdateExam(long sectionId, long examId, SaveAdminExamRequest request, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.SaveExamAsync(sectionId, examId, CurrentUserId(), request, cancellationToken));
    [HttpDelete("exams/{examId:long}")]
    public async Task<IActionResult> DeleteExam(long sectionId, long examId, CancellationToken cancellationToken) =>
        this.ToActionResult(await service.DeleteExamAsync(sectionId, examId, cancellationToken));

    private long CurrentUserId() => long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

[ApiController]
[Authorize(Roles = "ADMIN")]
[Route("api/admin/statistics")]
public sealed class AdminStatisticsController(IAdminSectionManagementService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdminStatisticsDto>> Get(CancellationToken cancellationToken) =>
        this.ToActionResult(await service.StatisticsAsync(cancellationToken));
}
