import { api } from './client';
import type {
  TeacherProfileDto, UpdateTeacherProfileRequest,
  TeacherSectionDto, TeacherSectionDetailDto, TeacherScheduleDto,
  TeacherSectionStudentDto,
  TeacherAssignmentDto, CreateAssignmentRequest, UpdateAssignmentRequest,
  TeacherSubmissionDto, GradeSubmissionRequest,
  TeacherMaterialDto, CreateMaterialRequest, UpdateMaterialRequest,
  TeacherGradeComponentDto, SaveGradeComponentRequest,
  TeacherStudentGradeDto, UpsertStudentGradeRequest,
  TeacherGradeOverviewDto,
  TeacherAnnouncementDto, CreateAnnouncementRequest, UpdateAnnouncementRequest,
} from './teacher-types';

// Helper: base path for a teacher
const base = (tid: number) => `/api/teachers/${tid}`;
const sec  = (tid: number, sid: number) => `${base(tid)}/sections/${sid}`;

// ─── Profile ──────────────────────────────────────────────────────────────────
export const teacherProfileApi = {
  get:    (tid: number) => api.get<TeacherProfileDto>(`${base(tid)}/profile`),
  update: (tid: number, body: UpdateTeacherProfileRequest) =>
    api.put<TeacherProfileDto>(`${base(tid)}/profile`, body),
};

// ─── Sections & Schedule ─────────────────────────────────────────────────────
export const teacherSectionsApi = {
  list: (tid: number, params?: { semesterId?: number; status?: number }) => {
    const q = new URLSearchParams();
    if (params?.semesterId !== undefined) q.set('semesterId', String(params.semesterId));
    if (params?.status !== undefined) q.set('status', String(params.status));
    return api.get<TeacherSectionDto[]>(`${base(tid)}/sections?${q}`);
  },
  get: (tid: number, sid: number) =>
    api.get<TeacherSectionDetailDto>(`${sec(tid, sid)}`),
  schedule: (tid: number, params?: { from?: string; to?: string; sectionId?: number }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.sectionId !== undefined) q.set('sectionId', String(params.sectionId));
    return api.get<TeacherScheduleDto[]>(`${base(tid)}/schedule?${q}`);
  },
};

// ─── Students ────────────────────────────────────────────────────────────────
export const teacherStudentsApi = {
  list: (tid: number, sid: number) =>
    api.get<TeacherSectionStudentDto[]>(`${sec(tid, sid)}/students`),
};

// ─── Assignments ─────────────────────────────────────────────────────────────
export const teacherAssignmentsApi = {
  list: (tid: number, sid: number) =>
    api.get<TeacherAssignmentDto[]>(`${sec(tid, sid)}/assignments`),
  get: (tid: number, sid: number, aid: number) =>
    api.get<TeacherAssignmentDto>(`${sec(tid, sid)}/assignments/${aid}`),
  create: (tid: number, sid: number, body: CreateAssignmentRequest) =>
    api.post<TeacherAssignmentDto>(`${sec(tid, sid)}/assignments`, body),
  update: (tid: number, sid: number, aid: number, body: UpdateAssignmentRequest) =>
    api.put<TeacherAssignmentDto>(`${sec(tid, sid)}/assignments/${aid}`, body),
  delete: (tid: number, sid: number, aid: number) =>
    api.delete(`${sec(tid, sid)}/assignments/${aid}`),
  submissions: (tid: number, sid: number, aid: number, status?: number) => {
    const q = status !== undefined ? `?status=${status}` : '';
    return api.get<TeacherSubmissionDto[]>(`${sec(tid, sid)}/assignments/${aid}/submissions${q}`);
  },
  grade: (tid: number, sid: number, aid: number, subId: number, body: GradeSubmissionRequest) =>
    api.put<TeacherSubmissionDto>(
      `${sec(tid, sid)}/assignments/${aid}/submissions/${subId}/grade`, body),
};

// ─── Materials ───────────────────────────────────────────────────────────────
export const teacherMaterialsApi = {
  list: (tid: number, sid: number, search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<TeacherMaterialDto[]>(`${sec(tid, sid)}/materials${q}`);
  },
  create: (tid: number, sid: number, body: CreateMaterialRequest) =>
    api.post<TeacherMaterialDto>(`${sec(tid, sid)}/materials`, body),
  update: (tid: number, sid: number, mid: number, body: UpdateMaterialRequest) =>
    api.put<TeacherMaterialDto>(`${sec(tid, sid)}/materials/${mid}`, body),
  delete: (tid: number, sid: number, mid: number) =>
    api.delete(`${sec(tid, sid)}/materials/${mid}`),
};

// ─── Grades ──────────────────────────────────────────────────────────────────
export const teacherGradesApi = {
  components: (tid: number, sid: number) =>
    api.get<TeacherGradeComponentDto[]>(`${sec(tid, sid)}/grade-components`),
  createComponent: (tid: number, sid: number, body: SaveGradeComponentRequest) =>
    api.post<TeacherGradeComponentDto>(`${sec(tid, sid)}/grade-components`, body),
  updateComponent: (tid: number, sid: number, cid: number, body: SaveGradeComponentRequest) =>
    api.put<TeacherGradeComponentDto>(`${sec(tid, sid)}/grade-components/${cid}`, body),
  deleteComponent: (tid: number, sid: number, cid: number) =>
    api.delete(`${sec(tid, sid)}/grade-components/${cid}`),

  grades: (tid: number, sid: number, componentId?: number) => {
    const q = componentId !== undefined ? `?componentId=${componentId}` : '';
    return api.get<TeacherStudentGradeDto[]>(`${sec(tid, sid)}/grades${q}`);
  },
  upsertGrade: (tid: number, sid: number, studentId: number, body: UpsertStudentGradeRequest) =>
    api.put<TeacherStudentGradeDto>(`${sec(tid, sid)}/grades/${studentId}`, body),

  overview: (tid: number, sid: number) =>
    api.get<TeacherGradeOverviewDto>(`${sec(tid, sid)}/grade-summary`),
  finalize: (tid: number, sid: number) =>
    api.post<TeacherGradeOverviewDto>(`${sec(tid, sid)}/grades/finalize`, {}),
};

// ─── Announcements ───────────────────────────────────────────────────────────
export const teacherAnnouncementsApi = {
  list: (tid: number, sectionId?: number) => {
    const q = sectionId !== undefined ? `?sectionId=${sectionId}` : '';
    return api.get<TeacherAnnouncementDto[]>(`${base(tid)}/announcements${q}`);
  },
  create: (tid: number, sid: number, body: CreateAnnouncementRequest) =>
    api.post<TeacherAnnouncementDto>(`${base(tid)}/sections/${sid}/announcements`, body),
  update: (tid: number, aid: number, body: UpdateAnnouncementRequest) =>
    api.put<TeacherAnnouncementDto>(`${base(tid)}/announcements/${aid}`, body),
  delete: (tid: number, aid: number) =>
    api.delete(`${base(tid)}/announcements/${aid}`),
};
