import { useState, useEffect } from 'react';

const API = '/api';

export default function StudentPortal({ students, attendance, currentRole, user }) {
  // Use the logged-in student's ID if available, otherwise fallback to first enrolled (for demo)
  const studentId = user?.student_id || (students.find(s => s.enrollment_status === 'Enrolled') || students[0])?.id;
  const demoStudent = students.find(s => s.id === studentId);
  const [studentData, setStudentData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);

  useEffect(() => {
    if (!demoStudent) return;
    fetch(`${API}/students/${demoStudent.id}`).then(r => r.ok ? r.json() : null).then(setStudentData);
    fetch(`${API}/resource_recommendations/${demoStudent.id}`).then(r => r.ok ? r.json() : []).then(setRecommendations);
    fetch(`${API}/attendance/student/${demoStudent.id}`).then(r => r.ok ? r.json() : []).then(setMyAttendance);
  }, [demoStudent?.id]);

  if (!demoStudent || !studentData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 bg-brand-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Student Account Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">No enrolled students exist yet. Ask your Administrator to register a student first.</p>
      </div>
    );
  }

  const presentDays = myAttendance.filter(a => a.status === 'Present').length;
  const absentDays  = myAttendance.filter(a => a.status === 'Absent').length;
  const lateDays    = myAttendance.filter(a => a.status === 'Late').length;
  const avgScore    = studentData.academic_records?.length
    ? (studentData.academic_records.reduce((s,r) => s + r.score, 0) / studentData.academic_records.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          {studentData.profile_image ? (
            <img src={studentData.profile_image} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/20 flex-shrink-0 bg-brand-800" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-2xl flex-shrink-0">
              {studentData.first_name[0]}{studentData.last_name[0]}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-extrabold font-cinzel tracking-wider">{studentData.first_name} {studentData.last_name}</h2>
            <p className="text-brand-200 text-sm">Student #{String(studentData.id).padStart(4,'0')} · {studentData.grade_level}{studentData.section ? ` · ${studentData.section}` : ''}</p>
          </div>
          <div className="ml-auto text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${studentData.enrollment_status === 'Enrolled' ? 'bg-green-400/20 text-green-200' : 'bg-amber-400/20 text-amber-200'}`}>{studentData.enrollment_status}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {[['GPA / Avg', avgScore ? `${avgScore}%` : 'N/A'], ['Present', presentDays], ['Absent', absentDays], ['Late', lateDays]].map(([label, val]) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{val}</p>
              <p className="text-xs text-brand-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Records */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              My Academic Record
            </h3>
          </div>
          <div className="overflow-y-auto max-h-64 divide-y divide-slate-100 dark:divide-slate-700">
            {studentData.academic_records?.length === 0
              ? <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No records yet.</p>
              : studentData.academic_records?.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.subject}</p>
                    <p className="text-xs text-slate-400">{r.term}</p>
                  </div>
                  <span className={`text-lg font-extrabold ${r.score >= 75 ? 'text-green-600' : 'text-red-500'}`}>{r.score}%</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              My Attendance
            </h3>
          </div>
          <div className="overflow-y-auto max-h-64 divide-y divide-slate-100 dark:divide-slate-700">
            {myAttendance.length === 0
              ? <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No attendance records yet.</p>
              : myAttendance.map(a => (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{a.date}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${a.status === 'Present' ? 'bg-green-100 text-green-700' : a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* AI Resource Recommendations */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <h2 className="text-sm font-black font-cinzel text-slate-800 dark:text-white uppercase tracking-wider">AI Recommendations</h2>
          <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">Powered by CCA AI</span>
        </div>
        {recommendations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Great job! No subjects are below the 75% threshold. Keep it up!</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 hover:shadow-sm transition">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{rec.resource_title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">{rec.subject} — {rec.average_score}%</span>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">{rec.resource_type}</span>
                  </div>
                </div>
                <a href={rec.resource_url} target="_blank" rel="noreferrer"
                  className="flex-shrink-0 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition shadow-sm">
                  Study Now →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
