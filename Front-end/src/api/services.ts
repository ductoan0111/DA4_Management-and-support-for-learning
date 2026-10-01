import { api } from './client';
import type {
  PagedResult,
  AdminUserDto,
  AdminRoleDto,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  SetAdminRoleRequest,
  ResetAdminPasswordRequest,
} from './types';

const BASE = '/api/admin/users';

export const usersApi = {
  list: (params: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') q.set(k, String(v));
    }
    return api.get<PagedResult<AdminUserDto>>(`${BASE}?${q}`);
  },
  get: (id: number) => api.get<AdminUserDto>(`${BASE}/${id}`),
  create: (body: CreateAdminUserRequest) => api.post<AdminUserDto>(BASE, body),
  update: (id: number, body: UpdateAdminUserRequest) => api.put<AdminUserDto>(`${BASE}/${id}`, body),
  setRole: (id: number, body: SetAdminRoleRequest) => api.put<AdminUserDto>(`${BASE}/${id}/role`, body),
  resetPassword: (id: number, body: ResetAdminPasswordRequest) => api.put<AdminUserDto>(`${BASE}/${id}/password`, body),
  roles: () => api.get<AdminRoleDto[]>('/api/admin/roles'),
};

export const departmentsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = params ? new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))) : new URLSearchParams();
    return api.get<PagedResult<import('./types').AdminDepartmentDto>>(`/api/admin/departments?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminDepartmentDto>(`/api/admin/departments/${id}`),
  create: (body: import('./types').SaveAdminDepartmentRequest) => api.post<import('./types').AdminDepartmentDto>('/api/admin/departments', body),
  update: (id: number, body: import('./types').SaveAdminDepartmentRequest) => api.put<import('./types').AdminDepartmentDto>(`/api/admin/departments/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/departments/${id}`),
};

export const majorsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminMajorDto>>(`/api/admin/majors?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminMajorDto>(`/api/admin/majors/${id}`),
  create: (body: import('./types').SaveAdminMajorRequest) => api.post<import('./types').AdminMajorDto>('/api/admin/majors', body),
  update: (id: number, body: import('./types').SaveAdminMajorRequest) => api.put<import('./types').AdminMajorDto>(`/api/admin/majors/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/majors/${id}`),
};

export const academicClassesApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminAcademicClassDto>>(`/api/admin/academic-classes?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminAcademicClassDto>(`/api/admin/academic-classes/${id}`),
  create: (body: import('./types').SaveAdminAcademicClassRequest) => api.post<import('./types').AdminAcademicClassDto>('/api/admin/academic-classes', body),
  update: (id: number, body: import('./types').SaveAdminAcademicClassRequest) => api.put<import('./types').AdminAcademicClassDto>(`/api/admin/academic-classes/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/academic-classes/${id}`),
};

export const coursesApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminCourseDto>>(`/api/admin/courses?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminCourseDto>(`/api/admin/courses/${id}`),
  create: (body: import('./types').SaveAdminCourseRequest) => api.post<import('./types').AdminCourseDto>('/api/admin/courses', body),
  update: (id: number, body: import('./types').SaveAdminCourseRequest) => api.put<import('./types').AdminCourseDto>(`/api/admin/courses/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/courses/${id}`),
};

export const semestersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminSemesterDto>>(`/api/admin/semesters?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminSemesterDto>(`/api/admin/semesters/${id}`),
  create: (body: import('./types').SaveAdminSemesterRequest) => api.post<import('./types').AdminSemesterDto>('/api/admin/semesters', body),
  update: (id: number, body: import('./types').SaveAdminSemesterRequest) => api.put<import('./types').AdminSemesterDto>(`/api/admin/semesters/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/semesters/${id}`),
};

export const sectionsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminCourseSectionDto>>(`/api/admin/course-sections?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminCourseSectionDto>(`/api/admin/course-sections/${id}`),
  create: (body: import('./types').SaveAdminCourseSectionRequest) => api.post<import('./types').AdminCourseSectionDto>('/api/admin/course-sections', body),
  update: (id: number, body: import('./types').SaveAdminCourseSectionRequest) => api.put<import('./types').AdminCourseSectionDto>(`/api/admin/course-sections/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/course-sections/${id}`),

  // Section management
  teachers: (sectionId: number, page = 1, pageSize = 20) =>
    api.get<PagedResult<import('./types').AdminSectionTeacherDto>>(`/api/admin/course-sections/${sectionId}/teachers?page=${page}&pageSize=${pageSize}`),
  assignTeacher: (sectionId: number, teacherId: number, body: import('./types').AssignAdminTeacherRequest) =>
    api.put<import('./types').AdminSectionTeacherDto>(`/api/admin/course-sections/${sectionId}/teachers/${teacherId}`, body),
  removeTeacher: (sectionId: number, teacherId: number) =>
    api.delete(`/api/admin/course-sections/${sectionId}/teachers/${teacherId}`),

  students: (sectionId: number, page = 1, pageSize = 20) =>
    api.get<PagedResult<import('./types').AdminEnrollmentDto>>(`/api/admin/course-sections/${sectionId}/students?page=${page}&pageSize=${pageSize}`),
  enroll: (sectionId: number, studentId: number, body: import('./types').SaveAdminEnrollmentRequest) =>
    api.put<import('./types').AdminEnrollmentDto>(`/api/admin/course-sections/${sectionId}/students/${studentId}`, body),
  cancelEnrollment: (sectionId: number, studentId: number) =>
    api.delete(`/api/admin/course-sections/${sectionId}/students/${studentId}`),
};

export const teachersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminTeacherDto>>(`/api/admin/teachers?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminTeacherDto>(`/api/admin/teachers/${id}`),
  create: (body: import('./types').SaveAdminTeacherRequest) => api.post<import('./types').AdminTeacherDto>('/api/admin/teachers', body),
  update: (id: number, body: import('./types').SaveAdminTeacherRequest) => api.put<import('./types').AdminTeacherDto>(`/api/admin/teachers/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/teachers/${id}`),
};

export const studentsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
    return api.get<PagedResult<import('./types').AdminStudentDto>>(`/api/admin/students?${q}`);
  },
  get: (id: number) => api.get<import('./types').AdminStudentDto>(`/api/admin/students/${id}`),
  create: (body: import('./types').CreateAdminStudentRequest) => api.post<import('./types').AdminStudentDto>('/api/admin/students', body),
  update: (id: number, body: import('./types').UpdateAdminStudentRequest) => api.put<import('./types').AdminStudentDto>(`/api/admin/students/${id}`, body),
  delete: (id: number) => api.delete(`/api/admin/students/${id}`),
};

export const statisticsApi = {
  get: () => api.get<import('./types').AdminStatisticsDto>('/api/admin/statistics'),
};
