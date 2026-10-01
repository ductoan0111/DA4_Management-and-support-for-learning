import { useEffect, useState } from 'react';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherScheduleDto } from '../../api/teacher-types';

const DAY_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun display order

export default function TeacherSchedulePage() {
  const { profile } = useTeacherAuth();
  const [schedules, setSchedules] = useState<TeacherScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.schedule(profile.teacherId).then(setSchedules).finally(() => setLoading(false));
  }, [profile]);

  // Group by day of week
  const byDay = DAY_ORDER.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.dayOfWeek === d);
    return acc;
  }, {} as Record<number, TeacherScheduleDto[]>);

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Lịch dạy</h1>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Tuần hiện tại • {new Date().toLocaleDateString('vi-VN')}
        </span>
      </div>
      <div className="teacher-content">
        {loading ? <div className="admin-loading">Đang tải…</div> : (
          schedules.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><div>Không có lịch dạy</div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
              {DAY_ORDER.map(day => (
                <div key={day}>
                  <div style={{
                    textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', padding: '0.5rem',
                    background: day === new Date().getDay() ? '#2563eb' : '#f1f5f9',
                    color: day === new Date().getDay() ? '#fff' : '#475569',
                    borderRadius: '8px 8px 0 0',
                  }}>
                    {DAY_VI[day]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {byDay[day].length === 0 ? (
                      <div style={{ height: 60, background: '#f8fafc', borderRadius: 6, border: '1px dashed #e2e8f0' }} />
                    ) : byDay[day].map(s => (
                      <div key={`${s.sectionId}-${s.scheduleId}`} className="schedule-slot">
                        <div className="slot-time">{s.startTime.substring(0, 5)}–{s.endTime.substring(0, 5)}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', marginTop: 2 }}>{s.courseCode}</div>
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>{s.sectionCode}</div>
                        <div className="slot-room">🏢 {s.room ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
