import { useState, useEffect } from 'react';

const API = '/api';

export default function StudentPortal({ students, attendance, currentRole, user, authFetch }) {
  // Use the logged-in student's ID if available, otherwise default to first enrolled
  const initialStudentId = user?.student_id || (students.find(s => s.enrollment_status === 'Enrolled') || students[0])?.id;
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const demoStudent = students.find(s => s.id === selectedStudentId) || students.find(s => s.id === initialStudentId);
  
  const [studentData, setStudentData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [tuitions, setTuitions] = useState([]);
  
  const [activeDate, setActiveDate] = useState(new Date());
  const handlePrevMonth = () => setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1));
  const handleNextMonth = () => setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1));

  const currentMonthIdx = activeDate.getMonth();
  const currentYear = activeDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonthIdx, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  
  const attMap = {};
  myAttendance.forEach(a => { attMap[a.date] = a; });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-500 text-white border-green-600 shadow-sm';
      case 'Absent': return 'bg-red-500 text-white border-red-600 shadow-sm';
      case 'Excused': return 'bg-yellow-400 text-white border-yellow-500 shadow-sm';
      case 'Late': return 'bg-orange-400 text-white border-orange-500 shadow-sm';
      default: return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  useEffect(() => {
    if (!demoStudent) return;
    authFetch(`${API}/students/${demoStudent.id}`).then(r => r?.ok ? r.json() : null).then(setStudentData).catch(() => {});
    authFetch(`${API}/resource_recommendations/${demoStudent.id}`).then(r => r?.ok ? r.json() : []).then(setRecommendations).catch(() => {});
    authFetch(`${API}/attendance/student/${demoStudent.id}`).then(r => r?.ok ? r.json() : []).then(setMyAttendance).catch(() => {});
    authFetch(`${API}/tuition/`).then(r => r?.ok ? r.json() : []).then(data => setTuitions(data.filter(t => t.student_id === demoStudent.id))).catch(() => {});
  }, [demoStudent?.id]);

  if (!demoStudent || !studentData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 bg-brand-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Student Account Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">No enrolled students exist yet. Ask your Principal to register a student first.</p>
      </div>
    );
  }

  const presentDays = myAttendance.filter(a => a.status === 'Present').length;
  const absentDays  = myAttendance.filter(a => a.status === 'Absent').length;
  const lateDays    = myAttendance.filter(a => a.status === 'Late').length;
  const avgScore    = studentData.academic_records?.length
    ? (studentData.academic_records.reduce((s,r) => s + r.score, 0) / studentData.academic_records.length).toFixed(1)
    : null;
    
  const totalDue = tuitions.reduce((s, t) => s + t.amount_due, 0);
  const totalPaid = tuitions.reduce((s, t) => s + t.amount_paid, 0);
  const balance = totalDue - totalPaid;

  return (
    <div className="space-y-6">
      
      {/* Target Student Navigation Selector (Visible to Admin/Staff) */}
      {['Principal', 'Teacher', 'Registrar', 'Cashier'].includes(currentRole) && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">Viewing Profile:</label>
          <select 
            value={demoStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
            className="w-full md:w-96 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
          >
            {students.filter(s => s.enrollment_status === 'Enrolled').map(s => (
              <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} (Grade {s.grade_level})</option>
            ))}
          </select>
        </div>
      )}

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {studentData.profile_image ? (
            <img src={studentData.profile_image} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/20 flex-shrink-0 bg-brand-800" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm shadow-inner flex items-center justify-center flex-shrink-0 border border-white/20">
              <img src="/assets/Profile Icon [1 Clear].png" alt="Default Logo" className="w-10 h-10 object-contain opacity-90" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-extrabold font-cinzel tracking-wider">{studentData.first_name} {studentData.last_name}</h2>
            <p className="text-brand-200 text-sm">Student #{String(studentData.id).padStart(4,'0')} · {studentData.grade_level}{studentData.section ? ` · ${studentData.section}` : ''}</p>
          </div>
          <div className="ml-0 sm:ml-auto text-center sm:text-right mt-2 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${studentData.enrollment_status === 'Enrolled' ? 'bg-green-400/20 text-green-200' : 'bg-amber-400/20 text-amber-200'}`}>{studentData.enrollment_status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
          {[['GPA / Avg', avgScore ? `${avgScore}%` : 'N/A'], ['Present', presentDays], ['Absent', absentDays], ['Late', lateDays], ['Balance', `₱${balance.toLocaleString()}`]].map(([label, val]) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{val}</p>
              <p className="text-xs text-brand-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Academic Records */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center mb-4">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Student Report Card (Philippine SF9 Format)
            </h3>
            <table className="w-full text-center border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <th className="border border-slate-200 dark:border-slate-600 px-4 py-2 text-left w-1/3">Learning Areas</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">1</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">2</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">3</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">4</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 w-24">Final Grade</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 w-24">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentData.academic_records?.length === 0 ? (
                  <tr><td colSpan="7" className="p-6 text-center text-sm text-slate-500">No academic records yet.</td></tr>
                ) : (
                  (() => {
                    const grouped = {};
                    studentData.academic_records.forEach(r => {
                      if (!grouped[r.subject]) grouped[r.subject] = { subject: r.subject, q1: null, q2: null, q3: null, q4: null };
                      const t = r.term.toLowerCase();
                      if (t.includes('1st')) grouped[r.subject].q1 = r;
                      else if (t.includes('2nd')) grouped[r.subject].q2 = r;
                      else if (t.includes('3rd')) grouped[r.subject].q3 = r;
                      else if (t.includes('4th')) grouped[r.subject].q4 = r;
                    });
                    return Object.values(grouped).map((row, i) => {
                      const grades = [row.q1?.score, row.q2?.score, row.q3?.score, row.q4?.score].filter(s => s != null);
                      const finalGrade = grades.length === 4 ? Math.round(grades.reduce((a,b)=>a+b,0)/4) : null;
                      const remarks = finalGrade ? (finalGrade > 75 ? 'Passed' : 'Failed') : '';
                      const colorClass = (score) => score ? (score <= 75 ? 'text-red-500 font-bold' : '') : '';
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="border border-slate-200 dark:border-slate-600 px-4 py-2 text-left font-semibold text-sm">{row.subject}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 text-sm ${colorClass(row.q1?.score)}`}>{row.q1?.score || ''}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 text-sm ${colorClass(row.q2?.score)}`}>{row.q2?.score || ''}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 text-sm ${colorClass(row.q3?.score)}`}>{row.q3?.score || ''}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 text-sm ${colorClass(row.q4?.score)}`}>{row.q4?.score || ''}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-3 py-2 font-bold text-sm ${finalGrade > 75 ? 'text-green-600' : (finalGrade ? 'text-red-600' : '')}`}>{finalGrade || ''}</td>
                          <td className={`border border-slate-200 dark:border-slate-600 px-3 py-2 text-xs font-bold uppercase ${remarks === 'Passed' ? 'text-green-600' : (remarks === 'Failed' ? 'text-red-600' : '')}`}>{remarks}</td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
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
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"><svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <h4 className="font-bold font-cinzel text-lg tracking-widest uppercase text-slate-800 dark:text-white">
                {activeDate.toLocaleString('default', { month: 'long' })} {currentYear}
              </h4>
              <button onClick={handleNextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"><svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 py-1">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {blanks.map((_, i) => <div key={`b-${i}`} className="p-2 rounded-xl border border-transparent"></div>)}
              {days.map(d => {
                const m = String(currentMonthIdx + 1).padStart(2, '0');
                const dayStr = String(d).padStart(2, '0');
                const dateStr = `${currentYear}-${m}-${dayStr}`;
                const rec = attMap[dateStr];
                const currentStatus = rec ? rec.status : null;
                
                return (
                  <div key={d} className={`relative flex flex-col items-center justify-start py-3 px-1 rounded-xl border ${getStatusColor(currentStatus)} transition shadow-sm`}>
                    <span className="text-sm font-extrabold z-10 block mb-2">{d}</span>
                    {currentStatus && (
                      <div className="text-[9px] font-black uppercase tracking-widest z-10 w-full text-center px-1 truncate">
                        {currentStatus.slice(0,3)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 shrink-0 flex-wrap">
              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm"></div>Present</span>
              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-sm"></div>Absent</span>
              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-yellow-400 mr-2 shadow-sm"></div>Excused</span>
              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-orange-400 mr-2 shadow-sm"></div>Late</span>
            </div>
          </div>
        </div>

        {/* Tuition & Payment History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Tuition & Payment History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Term</th>
                  <th className="px-6 py-4">Amount Due</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              {tuitions.length === 0 ? (
                 <tbody><tr><td colSpan="5" className="p-6 text-center text-sm text-slate-500">No payment records found.</td></tr></tbody>
              ) : (
                tuitions.map((t, idx) => {
                  const bal = t.amount_due - t.amount_paid;
                  const statusColors = {
                    'Paid': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    'Overdue': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  };
                  return (
                    <tbody key={idx} className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white">{t.term}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">₱{t.amount_due.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">₱{t.amount_paid.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-slate-800 dark:text-white">₱{bal.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[t.status] || 'bg-slate-100 text-slate-500'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                      {t.payments && t.payments.length > 0 && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                          <td colSpan="5" className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                              <svg className="w-3 h-3 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Official Receipts
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {t.payments.map((p, pidx) => (
                                <div key={pidx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm min-w-[120px]">
                                  <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">O.R. {p.or_number}</div>
                                  <div className="text-green-600 dark:text-green-400 font-bold text-sm mt-0.5">+₱{p.amount.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(p.date_recorded).toLocaleDateString()}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )
                })
              )}
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
