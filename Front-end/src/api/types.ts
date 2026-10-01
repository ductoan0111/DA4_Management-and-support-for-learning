// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: AdminUserDto;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface AdminUserDto {
  userId: number;
  roleId: number;
  roleCode: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}

export interface AdminRoleDto {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
}

export interface CreateAdminUserRequest {
  roleId: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
}

export interface UpdateAdminUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
}

export interface SetAdminRoleRequest {
  roleId: number;
}

export interface ResetAdminPasswordRequest {
  password: string;
}

// ─── Departments ─────────────────────────────────────────────────────────────
export interface AdminDepartmentDto {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
}

export interface SaveAdminDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
}

// ─── Majors ──────────────────────────────────────────────────────────────────
export interface AdminMajorDto {
  majorId: number;
  departmentId: number;
  majorCode: string;
  majorName: string;
  isActive: boolean;
}

export interface SaveAdminMajorRequest {
  departmentId: number;
  majorCode: string;
  majorName: string;
  isActive: boolean;
}

// ─── Academic Classes ─────────────────────────────────────────────────────────
export interface AdminAcademicClassDto {
  academicClassId: number;
  majorId: number;
  classCode: string;
  className: string;
  isActive: boolean;
}

export interface SaveAdminAcademicClassRequest {
  majorId: number;
  classCode: string;
  className: string;
  isActive: boolean;
}

// ─── Courses ─────────────────────────────────────────────────────────────────
export interface AdminCourseDto {
  courseId: number;
  departmentId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  description: string | null;
  isActive: boolean;
}

export interface SaveAdminCourseRequest {
  departmentId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  description?: string;
  isActive: boolean;
}

// ─── Semesters ───────────────────────────────────────────────────────────────
export interface AdminSemesterDto {
  semesterId: number;
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SaveAdminSemesterRequest {
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// ─── Course Sections ─────────────────────────────────────────────────────────
export interface AdminCourseSectionDto {
  sectionId: number;
  courseId: number;
  semesterId: number;
  sectionCode: string;
  sectionName: string | null;
  maxStudents: number | null;
  status: number; // 0=closed,1=open,2=finished
}

export interface SaveAdminCourseSectionRequest {
  courseId: number;
  semesterId: number;
  sectionCode: string;
  sectionName?: string;
  maxStudents?: number;
  status: number;
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export interface AdminTeacherDto {
  teacherId: number;
  userId: number;
  teacherCode: string;
  departmentId: number;
  academicTitle: string | null;
  specialization: string | null;
  status: number; // 0=inactive,1=active
}

export interface SaveAdminTeacherRequest {
  userId: number;
  teacherCode: string;
  departmentId: number;
  academicTitle?: string;
  specialization?: string;
  status: number;
}

// ─── Students ────────────────────────────────────────────────────────────────
export interface AdminStudentDto {
  studentId: number;
  userId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: number | null;
  avatarUrl: string | null;
  isActive: boolean;
  academicClassId: number | null;
  classCode: string | null;
  className: string | null;
  majorId: number;
  majorCode: string;
  majorName: string;
  departmentId: number;
  enrollmentYear: number;
  status: number; // 0=inactive,1=active,2=graduated
}

export interface CreateAdminStudentRequest {
  userId: number;
  studentCode: string;
  academicClassId?: number;
  majorId: number;
  enrollmentYear: number;
  status: number;
}

export interface UpdateAdminStudentRequest {
  studentCode: string;
  academicClassId?: number;
  majorId: number;
  enrollmentYear: number;
  status: number;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: number;
  avatarUrl?: string;
  isActive?: boolean;
}

// ─── Section Management ──────────────────────────────────────────────────────
export interface AdminSectionTeacherDto {
  sectionId: number;
  teacherId: number;
  teacherCode: string;
  fullName: string;
  isPrimary: boolean;
  assignedAt: string;
}

export interface AssignAdminTeacherRequest {
  isPrimary: boolean;
}

export interface AdminEnrollmentDto {
  enrollmentId: number;
  sectionId: number;
  studentId: number;
  studentCode: string;
  fullName: string;
  status: number;
  enrolledAt: string;
}

export interface SaveAdminEnrollmentRequest {
  status: number;
}

// ─── Statistics ──────────────────────────────────────────────────────────────
export interface AdminStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalCourses: number;
  totalSections: number;
  openSections: number;
  totalSemesters: number;
  activeEnrollments: number;
}
