import React, { useState } from 'react';

const API = '/api';

export default function Attendance({ students, attendance, fetchAttendance, currentRole, authFetch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // Date logic for calendar
  const [activeDate, setActiveDate] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState(null);

  const handlePrevMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1));
  };

  const currentMonthIdx = activeDate.getMonth();
  const currentYear = activeDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonthIdx, 1).getDay();

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Stats over all attendance
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const excusedCount = attendance.filter(a => a.status === 'Excused').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;



  const uniqueSections = ['All', ...new Set(students.map(s => s.section).filter(Boolean))].sort();

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.id).includes(searchQuery);
      const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;

      return matchesSearch && matchesSection;
    })
    .sort((a, b) => {
      const nameA = a.last_name.toLowerCase();
      const nameB = b.last_name.toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Map attendance by student -> by date string "YYYY-MM-DD"
  const attendanceMap = {};
  attendance.forEach(a => {
    if (!attendanceMap[a.student_id]) attendanceMap[a.student_id] = {};
    attendanceMap[a.student_id][a.date] = a;
  });

  const handleSetAttendance = async (studentId, dateStr, status) => {
    const currentRec = attendanceMap[studentId]?.[dateStr];

    let targetStatus = status;
    if (currentRec && currentRec.status === status) {
      targetStatus = 'Clear';
    }

    const res = await authFetch(`${API}/attendance/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: parseInt(studentId), date: dateStr, status: targetStatus, remarks: '' }),
    });
    if (res?.ok) { fetchAttendance(); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-green-500/30';
      case 'Absent': return 'bg-red-500 hover:bg-red-600 text-white border-red-600 shadow-red-500/30';
      case 'Excused': return 'bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-500 shadow-yellow-500/30';
      case 'Late': return 'bg-orange-400 hover:bg-orange-500 text-white border-orange-500 shadow-orange-500/30';
      default: return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[['Present', presentCount, 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'],
        ['Absent', absentCount, 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'],
        ['Excused', excusedCount, 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'],
        ['Late', lateCount, 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400']
        ].map(([label, count, cls]) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label} Logs</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{count}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">Attendance Registry</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Select a student row to modify their calendar marks.</p>
          </div>
        </div>

        {/* Filtering & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            {currentRole !== 'Teacher' && (
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none"
              >
                {uniqueSections.map(sec => <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : sec}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Rapid Daily Attendance Mode (Teacher) */}
          {currentRole === 'Teacher' && (
            <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/10 border-b border-brand-100 dark:border-brand-800">
              <h3 className="text-sm font-bold text-brand-800 dark:text-brand-300 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Rapid Daily Attendance — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredStudents.map(s => {
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  const currentStatus = attendanceMap[s.id]?.[todayStr]?.status;
                  
                  return (
                    <div key={s.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-white mb-2 truncate" title={`${s.last_name}, ${s.first_name}`}>{s.last_name}, {s.first_name}</span>
                      <div className="flex space-x-1">
                        {['Present', 'Late', 'Absent', 'Excused'].map(status => (
                          <button
                            key={status}
                            onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, todayStr, status); }}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors border ${
                              currentStatus === status
                                ? (status === 'Present' ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40' :
                                   status === 'Late' ? 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/40' :
                                   status === 'Absent' ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/40' :
                                   'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/40')
                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600'
                            }`}
                          >
                            {status.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Grade & Section</th>
                <th className="px-6 py-4 text-center">Status Overview</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredStudents.map(s => {
                const isExpanded = expandedStudentId === s.id;
                const recs = attendanceMap[s.id] || {};
                const stuPresent = Object.values(recs).filter(r => r.status === 'Present').length;
                const stuAbsent = Object.values(recs).filter(r => r.status === 'Absent').length;
                const stuExcused = Object.values(recs).filter(r => r.status === 'Excused').length;
                const stuLate = Object.values(recs).filter(r => r.status === 'Late').length;

                return (
                  <React.Fragment key={s.id}>
                    <tr onClick={() => setExpandedStudentId(isExpanded ? null : s.id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 items-center justify-center mr-3 font-bold text-xs flex shadow-sm">
                            {s.first_name[0]}{s.last_name[0]}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{s.last_name}, {s.first_name}</span>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">ID: {String(s.id).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {s.grade_level} <span className="mx-1 font-normal text-slate-400">|</span> <span className="text-slate-700 dark:text-slate-200">{s.section || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-green-600 dark:text-green-400">{stuPresent} P</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-red-500 dark:text-red-400">{stuAbsent} A</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-yellow-600 dark:text-yellow-400">{stuExcused} E</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-orange-500 dark:text-orange-400">{stuLate} L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-brand-600 transition group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 px-3 py-1.5 rounded-lg text-sm font-bold">
                          {isExpanded ? 'Hide Calendar' : 'Open Calendar'}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="4" className="bg-slate-50 dark:bg-slate-800/80 p-0 border-b border-slate-200 dark:border-slate-700">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                              <h4 className="font-bold font-cinzel text-lg tracking-widest uppercase text-slate-800 dark:text-white">
                                {activeDate.toLocaleString('default', { month: 'long' })} {currentYear}
                              </h4>
                              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-2">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 py-1">{d}</div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                              {blanks.map((_, i) => <div key={`b-${i}`} className="p-2 rounded-xl border border-transparent"></div>)}
                              {days.map(d => {
                                const m = String(currentMonthIdx + 1).padStart(2, '0');
                                const dayStr = String(d).padStart(2, '0');
                                const dateStr = `${currentYear}-${m}-${dayStr}`;
                                const rec = recs[dateStr];
                                const currentStatus = rec ? rec.status : null;

                                return (
                                  <div key={d}
                                    onClick={() => activeMenu === `${s.id}-${dateStr}` ? setActiveMenu(null) : setActiveMenu(`${s.id}-${dateStr}`)}
                                    title="Click to edit attendance"
                                    className={`relative flex flex-col items-center justify-start py-3 px-1 rounded-xl border cursor-pointer ${getStatusColor(currentStatus)} transition shadow-sm hover:ring-2 hover:ring-brand-400`}>
                                    <span className="text-sm font-extrabold z-10 block mb-2">{d}</span>

                                    {/* Action Dropdown embedded in cell on click */}
                                    {activeMenu === `${s.id}-${dateStr}` && (
                                      <div className="absolute inset-x-0 bottom-full mb-1 z-50 flex flex-col bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-[10px] font-bold uppercase tracking-widest min-w-[70px]">
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, dateStr, 'Present'); setActiveMenu(null); }} className="px-2 py-2 hover:bg-green-50 dark:hover:bg-green-900/40 text-green-700 dark:text-green-500 text-left border-b border-slate-100 dark:border-slate-800">Present</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, dateStr, 'Absent'); setActiveMenu(null); }} className="px-2 py-2 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-700 dark:text-red-500 text-left border-b border-slate-100 dark:border-slate-800">Absent</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, dateStr, 'Excused'); setActiveMenu(null); }} className="px-2 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500 text-left border-b border-slate-100 dark:border-slate-800">Excused</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, dateStr, 'Late'); setActiveMenu(null); }} className="px-2 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-500 text-left border-b border-slate-100 dark:border-slate-800">Late</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAttendance(s.id, dateStr, 'Clear'); setActiveMenu(null); }} className="px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-left">Clear</button>
                                      </div>
                                    )}

                                    {currentStatus && (
                                      <div className="text-[9px] font-black uppercase tracking-widest z-10 w-full text-center px-1 truncate">
                                        {currentStatus.slice(0, 3)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-8 flex items-center justify-center space-x-6 shrink-0 flex-wrap">
                              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm shadow-green-500/50"></div>Present</span>
                              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-sm shadow-red-500/50"></div>Absent</span>
                              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-yellow-400 mr-2 shadow-sm shadow-yellow-500/50"></div>Excused</span>
                              <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-orange-400 mr-2 shadow-sm shadow-orange-500/50"></div>Late</span>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredStudents.length === 0 && <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">No students found matching your criteria.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
