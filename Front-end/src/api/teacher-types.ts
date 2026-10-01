// ─── Teacher-specific Types ──────────────────────────────────────────────────

export interface TeacherLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: {
    userId: number;
    roleId: number;
    roleCode: string;
    username: string;
    email: string;
    fullName: string;
    phone: string | null;
    isActive: boolean;
  };
}

export interface TeacherProfileDto {
  teacherId: number;
  userId: number;
  teacherCode: string;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: number | null;
  avatarUrl: string | null;
  isActive: boolean;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  academicTitle: string | null;
  specialization: string | null;
  status: number;
}

export interface UpdateTeacherProfileRequest {
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: number;
  avatarUrl?: string;
  academicTitle?: string;
  specialization?: string;
}

// ─── Sections ────────────────────────────────────────────────────────────────
export interface TeacherSectionDto {
  sectionId: number;
  sectionCode: string;
  sectionName: string | null;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  semesterId: number;
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  status: number; // 0=closed,1=open,2=finished
  maxStudents: number | null;
  enrolledCount: number;
  isPrimary: boolean;
}

export interface TeacherScheduleDto {
  sectionId: number;
  sectionCode: string;
  courseCode: string;
  courseName: string;
  scheduleId: number;
  dayOfWeek: number; // 0=Sun,1=Mon,...6=Sat
  startTime: string;
  endTime: string;
  room: string | null;
  building: string | null;
  effectiveFrom: string;
  effectiveTo: string;
  note: string | null;
}

export interface TeacherSectionDetailDto extends TeacherSectionDto {
  schedules: TeacherScheduleDto[];
}

// ─── Students ────────────────────────────────────────────────────────────────
export interface TeacherSectionStudentDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  enrollmentStatus: number;
}

// ─── Assignments ─────────────────────────────────────────────────────────────
export interface TeacherAssignmentDto {
  assignmentId: number;
  sectionId: number;
  sectionCode: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string | null;
  attachmentUrl: string | null;
  openAt: string | null;
  dueAt: string;
  maxScore: number;
  allowLateSubmission: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
  totalSubmissions: number;
  gradedSubmissions: number;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  attachmentUrl?: string;
  openAt?: string;
  dueAt: string;
  maxScore: number;
  allowLateSubmission: boolean;
  isPublished: boolean;
}

export interface UpdateAssignmentRequest extends CreateAssignmentRequest {}

export interface TeacherSubmissionDto {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentCode: string;
  fullName: string;
  textContent: string | null;
  fileUrl: string | null;
  submittedAt: string;
  isLate: boolean;
  status: number; // 0=submitted,1=returned,2=graded
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}

// ─── Materials ───────────────────────────────────────────────────────────────
export interface TeacherMaterialDto {
  materialId: number;
  sectionId: number;
  sectionCode: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string | null;
  materialType: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  materialType?: string;
  fileUrl?: string;
  externalUrl?: string;
  isVisible: boolean;
}

export interface UpdateMaterialRequest extends CreateMaterialRequest {}

// ─── Grades ───────────────────────────────────────────────────────────────────
export interface TeacherGradeComponentDto {
  gradeComponentId: number;
  sectionId: number;
  componentName: string;
  weightPercent: number;
  maxScore: number;
  displayOrder: number;
}

export interface SaveGradeComponentRequest {
  componentName: string;
  weightPercent: number;
  maxScore: number;
  displayOrder: number;
}

export interface TeacherStudentGradeDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  gradeComponentId: number;
  componentName: string;
  score: number | null;
  note: string | null;
  gradedByUserId: number | null;
  gradedAt: string | null;
  updatedAt: string | null;
}

export interface UpsertStudentGradeRequest {
  gradeComponentId: number;
  score?: number;
  note?: string;
}

export interface TeacherFinalGradeDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  calculatedScore10: number;
  finalScore10: number | null;
  letterGrade: string | null;
  gradedComponents: number;
  totalComponents: number;
}

export interface TeacherGradeOverviewDto {
  sectionId: number;
  componentCount: number;
  totalWeightPercent: number;
  isReadyToFinalize: boolean;
  totalStudents: number;
  finalizedStudents: number;
  students: TeacherFinalGradeDto[];
}

// ─── Announcements ───────────────────────────────────────────────────────────
export interface TeacherAnnouncementDto {
  announcementId: number;
  createdByUserId: number;
  createdByFullName: string;
  sectionId: number | null;
  sectionCode: string | null;
  courseCode: string | null;
  courseName: string | null;
  title: string;
  content: string;
  announcementType: number; // 0=general,1=assignment,2=exam,3=other
  publishedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  announcementType: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface UpdateAnnouncementRequest extends CreateAnnouncementRequest {}
