import React, { useState, Fragment } from 'react';

const GRADES = ['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const API = '/api';

export default function Archive({ students, forms, authFetch, currentRole }) {
  const [activeTab, setActiveTab] = useState('Old Students');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyYear, setHistoryYear] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  const archivedStatuses = ['Archived', 'Graduated', 'Dropped', 'Transferred'];

  const oldStudents = students.filter(s => archivedStatuses.includes(s.enrollment_status));
  const activeStudents = students.filter(s => !archivedStatuses.includes(s.enrollment_status));

  const filteredOldStudents = oldStudents.filter(s => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(search) || String(s.id).includes(search);
    const matchesGrade = gradeFilter === 'All' || s.grade_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const filteredActiveStudents = activeStudents.filter(s => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(search) || String(s.id).includes(search);
    const matchesGrade = gradeFilter === 'All' || s.grade_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleView = async (id) => {
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
      setSelectedStudent(null);
      setHistoryYear('');
    } else {
      const res = await authFetch(`${API}/students/${id}`);
      if (res?.ok) {
        const student = await res.json();
        setSelectedStudent(student);
        setExpandedStudentId(id);
        
        // For past records, default to previous year if available
        let defaultYear = student.school_year;
        if (activeTab === 'Past Records') {
           const pastYears = [...new Set(student.academic_records?.map(r => r.school_year).filter(y => y !== student.school_year))].sort().reverse();
           if (pastYears.length > 0) defaultYear = pastYears[0];
        }
        setHistoryYear(defaultYear || '');
      }
    }
  };

  const renderStudentTable = (rows) => {
    const grouped = {};
    rows.forEach(r => {
      const g = r.grade_level || 'Unassigned';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(r);
    });
    
    // Sort grades
    const sortedGrades = Object.keys(grouped).sort((a,b) => {
      const idxA = GRADES.indexOf(a);
      const idxB = GRADES.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    if (sortedGrades.length === 0) {
      return (
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <tr><td className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No records found.</td></tr>
          </tbody>
        </table>
      );
    }

    return (
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6">
        {sortedGrades.map(grade => (
          <div key={grade} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span>{grade}</span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{grouped[grade].length} students</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-3 w-32">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {grouped[grade].map(s => {
                  const isExpanded = expandedStudentId === s.id && selectedStudent?.id === s.id;
                  
                  return (
                    <Fragment key={s.id}>
                      <tr className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => handleView(s.id)}>
                        <td className="px-6 py-4 text-sm font-bold text-brand-600 dark:text-brand-400">#{String(s.id).padStart(4,'0')}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{s.last_name}, {s.first_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${s.enrollment_status === 'Graduated' ? 'bg-amber-100 text-amber-700 border border-amber-200' : s.enrollment_status === 'Archived' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-red-100 text-red-700'}`}>{s.enrollment_status}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                          <button onClick={(e) => { e.stopPropagation(); handleView(s.id); }} className="text-brand-600 hover:text-brand-800 transition font-bold">{isExpanded ? 'Hide Records' : 'View Records'}</button>
                        </td>
                      </tr>
                      {isExpanded && (
                <tr>
                  <td colSpan="5" className="p-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="p-6">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h4 className="font-bold text-slate-800 dark:text-white border-b pb-2 dark:border-slate-700 flex-1">Historical Academic Records</h4>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Select Year:</span>
                          <select 
                            value={historyYear} 
                            onChange={(e) => setHistoryYear(e.target.value)} 
                            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {['All', ...new Set(selectedStudent.academic_records?.map(r => r.school_year).filter(Boolean) || [])].sort().reverse().map(yr => (
                              <option key={yr} value={yr === 'All' ? '' : yr}>{yr === 'All' ? 'All Time' : `SY ${yr}`}</option>
                            ))}
                            {(!selectedStudent.academic_records || selectedStudent.academic_records.length === 0) && (
                               <option value="">No Records</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="overflow-x-auto mb-6 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-center border-collapse bg-slate-50 dark:bg-slate-900/50">
                          <thead><tr className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                            <th className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left w-1/3">Learning Areas</th>
                            <th className="border border-slate-200 dark:border-slate-700 px-2 py-2">1</th>
                            <th className="border border-slate-200 dark:border-slate-700 px-2 py-2">2</th>
                            <th className="border border-slate-200 dark:border-slate-700 px-2 py-2">3</th>
                            <th className="border border-slate-200 dark:border-slate-700 px-2 py-2">4</th>
                            <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 w-20">Final</th>
                          </tr></thead>
                          <tbody>
                            {(!selectedStudent.academic_records || selectedStudent.academic_records.length === 0) ? (
                              <tr><td colSpan="6" className="p-6 text-center text-sm text-slate-500">No academic records found in archive.</td></tr>
                            ) : (
                              (() => {
                                const recordsToShow = historyYear ? selectedStudent.academic_records.filter(r => r.school_year === historyYear) : selectedStudent.academic_records;
                                if (recordsToShow.length === 0) return <tr><td colSpan="6" className="p-6 text-center text-sm text-slate-500">No academic records for this school year.</td></tr>;

                                const grouped = {};
                                recordsToShow.forEach(r => {
                                  const key = `${r.school_year || 'Unknown'} - ${r.subject}`;
                                  if (!grouped[key]) grouped[key] = { subject: r.subject, school_year: r.school_year, q1: null, q2: null, q3: null, q4: null };
                                  const t = r.term.toLowerCase();
                                  if (t.includes('1st')) grouped[key].q1 = r;
                                  else if (t.includes('2nd')) grouped[key].q2 = r;
                                  else if (t.includes('3rd')) grouped[key].q3 = r;
                                  else if (t.includes('4th')) grouped[key].q4 = r;
                                });
                                
                                const renderCell = (r) => r ? <span className={`text-sm ${r.score <= 75 ? 'text-red-500 font-bold' : ''}`}>{r.score}</span> : <span className="text-slate-300">—</span>;

                                return Object.values(grouped).map((row, i) => {
                                  const grades = [row.q1?.score, row.q2?.score, row.q3?.score, row.q4?.score].filter(s => s != null);
                                  const finalGrade = grades.length === 4 ? Math.round(grades.reduce((a,b)=>a+b,0)/4) : null;
                                  return (
                                    <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                      <td className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left text-sm text-slate-800 dark:text-slate-200">
                                        <div className="font-semibold">{row.subject}</div>
                                        {!historyYear && <div className="text-[10px] text-slate-400">SY {row.school_year}</div>}
                                      </td>
                                      <td className="border border-slate-200 dark:border-slate-700 px-2 py-2">{renderCell(row.q1)}</td>
                                      <td className="border border-slate-200 dark:border-slate-700 px-2 py-2">{renderCell(row.q2)}</td>
                                      <td className="border border-slate-200 dark:border-slate-700 px-2 py-2">{renderCell(row.q3)}</td>
                                      <td className="border border-slate-200 dark:border-slate-700 px-2 py-2">{renderCell(row.q4)}</td>
                                      <td className={`border border-slate-200 dark:border-slate-700 px-2 py-2 font-bold text-sm ${finalGrade > 75 ? 'text-green-600' : (finalGrade ? 'text-red-600' : '')}`}>{finalGrade || ''}</td>
                                    </tr>
                                  );
                                });
                              })()
                            )}
                          </tbody>
                        </table>
                      </div>

                      {forms && forms.filter(f => f.student_id === selectedStudent.id).length > 0 && (
                        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Past Digital Enrollment Forms</span>
                          <ul className="space-y-2">
                            {forms.filter(f => f.student_id === selectedStudent.id).map(f => (
                              <li key={f.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-lg text-sm">
                                <div>
                                    <div className="font-bold text-slate-700 dark:text-slate-300">{f.form_type} - {f.grade_applying_for}</div>
                                    <div className="text-xs text-slate-500">Form #{f.id}</div>
                                </div>
                                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded">{f.status}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-8 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase mb-1 flex items-center">
              <svg className="w-7 h-7 mr-3 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              STUDENT ARCHIVE
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Historical records for old and current students.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 relative z-10">
            <button onClick={() => setActiveTab('Old Students')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'Old Students' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Old Students</button>
            <button onClick={() => setActiveTab('Past Records')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'Past Records' ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Past Records (Active)</button>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search archive by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex-shrink-0">
            <select 
              value={gradeFilter} 
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Grades</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'Old Students' ? renderStudentTable(filteredOldStudents) : renderStudentTable(filteredActiveStudents)}
        </div>
      </div>
    </div>
  );
}
