import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TeacherAuthProvider } from './contexts/TeacherAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedTeacherRoute } from './components/ProtectedTeacherRoute';

// Admin
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import TeachersPage from './pages/admin/TeachersPage';
import StudentsPage from './pages/admin/StudentsPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import MajorsPage from './pages/admin/MajorsPage';
import AcademicClassesPage from './pages/admin/AcademicClassesPage';
import CoursesPage from './pages/admin/CoursesPage';
import SemestersPage from './pages/admin/SemestersPage';
import CourseSectionsPage from './pages/admin/CourseSectionsPage';

// Teacher
import TeacherLayout from './layouts/TeacherLayout';
import TeacherLoginPage from './pages/teacher/TeacherLoginPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherSectionsPage from './pages/teacher/TeacherSectionsPage';
import TeacherSectionDetailPage from './pages/teacher/TeacherSectionDetailPage';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherMaterialsPage from './pages/teacher/TeacherMaterialsPage';
import TeacherGradesPage from './pages/teacher/TeacherGradesPage';
import TeacherAnnouncementsPage from './pages/teacher/TeacherAnnouncementsPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';

import './admin.css';
import './teacher.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* ── ADMIN ROUTES ─────────────────────────────────────────────── */}
      <Routes>
        <Route path="/admin/login" element={
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        } />
        <Route path="/admin/*" element={
          <AuthProvider>
            <Routes>
              <Route path="*" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="majors" element={<MajorsPage />} />
                <Route path="academic-classes" element={<AcademicClassesPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="semesters" element={<SemestersPage />} />
                <Route path="course-sections" element={<CourseSectionsPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        } />

        {/* ── TEACHER ROUTES ───────────────────────────────────────────── */}
        <Route path="/teacher/login" element={
          <TeacherAuthProvider>
            <TeacherLoginPage />
          </TeacherAuthProvider>
        } />
        <Route path="/teacher/*" element={
          <TeacherAuthProvider>
            <Routes>
              <Route path="*" element={
                <ProtectedTeacherRoute>
                  <TeacherLayout />
                </ProtectedTeacherRoute>
              }>
                <Route index element={<TeacherDashboard />} />
                <Route path="sections" element={<TeacherSectionsPage />} />
                <Route path="sections/:sectionId" element={<TeacherSectionDetailPage />} />
                <Route path="schedule" element={<TeacherSchedulePage />} />
                <Route path="assignments" element={<TeacherAssignmentsPage />} />
                <Route path="materials" element={<TeacherMaterialsPage />} />
                <Route path="grades" element={<TeacherGradesPage />} />
                <Route path="announcements" element={<TeacherAnnouncementsPage />} />
                <Route path="profile" element={<TeacherProfilePage />} />
              </Route>
            </Routes>
          </TeacherAuthProvider>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
