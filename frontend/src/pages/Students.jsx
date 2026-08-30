import React, { useState, Fragment } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GRADES = ['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const SECTIONS = ['Humility', 'Courage', 'Goodwill', 'Persistence'];
const SECTION_META = {
  Humility:    { grade: 'Grade 7', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200' },
  Courage:     { grade: 'Grade 8', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200' },
  Goodwill:    { grade: 'Grade 9', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
  Persistence: { grade: 'Grade 10', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200' },
};
const API = '/api';

export default function Students({ students, isStudentsLoading, fetchStudents, fetchWarnings, currentRole, authFetch, forms, searchQuery, setSearchQuery, user }) {
  // Teacher only sees their section's students
  const visibleStudents = currentRole === 'Teacher' && user?.section
    ? students.filter(s => s.section === user.section)
    : students;
  const [showEdit, setShowEdit] = useState(false);
  const [showEndYearConfirm, setShowEndYearConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [viewMode, setViewMode] = useState('Overview');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState(null);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [schoolYearFilter, setSchoolYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active', 'Rejected', 'Archived'
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [newRecord, setNewRecord] = useState({ subject: '', score: '', term: '1st Quarter' });

  const [editingStudentFile, setEditingStudentFile] = useState(null);

  React.useEffect(() => {
    if (searchQuery && students.length > 0) {
      const match = students.find(s => String(s.id) === searchQuery);
      if (match && expandedStudentId !== match.id) {
        handleView(match.id);
      }
    }
  }, [searchQuery, students]);

  const handleView = async (id) => {
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
      setSelectedStudent(null);
      setHistoryYear('');
      setStudentHistory([]);
    } else {
      const res = await authFetch(`${API}/students/${id}`);
      if (res?.ok) {
        const student = await res.json();
        setSelectedStudent(student);
        setExpandedStudentId(id);
        setHistoryYear(student.school_year || '');
        if (['Registrar', 'Principal'].includes(currentRole)) {
          const hRes = await authFetch(`${API}/student-history/${id}`);
          if (hRes?.ok) {
            setStudentHistory(await hRes.json());
          }
        }
      }
    }
  };

  const handleUpdateGrade = async (record) => {
    await authFetch(`${API}/academic_records/${record.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ subject:record.subject, term:record.term, score:parseFloat(editingGradeScore) }) });
    setEditingGradeId(null);
    handleView(selectedStudent.id);
    fetchWarnings();
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const res = await authFetch(`${API}/academic_records/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: selectedStudent.id,
        subject: newRecord.subject,
        score: parseFloat(newRecord.score),
        term: newRecord.term,
        school_year: selectedStudent.school_year || '2025-2026'
      })
    });
    if (res?.ok) {
      setNewRecord({ subject: '', score: '', term: '1st Quarter' });
      handleView(selectedStudent.id);
      fetchWarnings();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await authFetch(`${API}/students/${editingStudent.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(editingStudent) });
    
    if (editingStudentFile) {
      const fd = new FormData();
      fd.append('file', editingStudentFile);
      await authFetch(`${API}/students/${editingStudent.id}/upload_image`, { method: 'POST', body: fd });
    }
    
    setShowEdit(false); 
    setEditingStudentFile(null);
    fetchStudents();
  };

  const uniqueSections = ['All Sections', ...new Set(visibleStudents.map(s => s.section).filter(Boolean))].sort();
  const uniqueSchoolYears = ['All', ...new Set(visibleStudents.map(s => s.school_year).filter(Boolean))].sort().reverse();

  const filteredStudents = visibleStudents
    .filter(s => {
      // Status filtering logic
      const isArchived = s.enrollment_status === 'Archived' || s.enrollment_status === 'Graduated' || s.enrollment_status === 'Dropped' || s.enrollment_status === 'Transferred' || s.is_archived;
      const isRejected = s.enrollment_status === 'Rejected';
      
      if (statusFilter === 'Archived' && !isArchived) return false;
      if (statusFilter === 'Rejected' && !isRejected) return false;
      if (statusFilter === 'Active' && (isArchived || isRejected)) return false;

      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.id).includes(searchQuery);
      const matchesSection = sectionFilter === 'All Sections' || s.section === sectionFilter;
      const matchesYear = schoolYearFilter === 'All' || s.school_year === schoolYearFilter;
      const matchesGrade = gradeFilter === 'All Grades' || gradeFilter === 'All' || s.grade_level === gradeFilter;
      return matchesSearch && matchesSection && matchesYear && matchesGrade;
    })
    .sort((a, b) => {
      if (sortOrder.startsWith('name')) {
        const nameA = a.last_name.toLowerCase();
        const nameB = b.last_name.toLowerCase();
        if (nameA < nameB) return sortOrder === 'name-asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder === 'name-asc' ? 1 : -1;
        return 0;
      } else if (sortOrder.startsWith('grade')) {
        const gradeA = GRADES.indexOf(a.grade_level);
        const gradeB = GRADES.indexOf(b.grade_level);
        if (gradeA < gradeB) return sortOrder === 'grade-asc' ? -1 : 1;
        if (gradeA > gradeB) return sortOrder === 'grade-asc' ? 1 : -1;
        return 0;
      } else if (sortOrder.startsWith('section')) {
        const secA = (a.section || '').toLowerCase();
        const secB = (b.section || '').toLowerCase();
        if (secA < secB) return sortOrder === 'section-asc' ? -1 : 1;
        if (secA > secB) return sortOrder === 'section-asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });

  const [historyYear, setHistoryYear] = useState('');
  const [studentHistory, setStudentHistory] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingGradeScore, setEditingGradeScore] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ tpId: null, amount: '', or_number: '', date: '', time: '' });

  const graphData = GRADES.map(grade => {
    const gradeStudents = visibleStudents.filter(s => s.grade_level === grade && !['Archived','Graduated','Dropped','Transferred','Rejected'].includes(s.enrollment_status));
    const oldStudents = gradeStudents.filter(s => s.enrollment_status === 'Enrolled').length;
    const newStudents = gradeStudents.length - oldStudents;
    return { name: grade, 'Old Students': oldStudents, 'New Students': newStudents };
  });

  const renderStudentTable = (rows) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">FORM ID</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">STUDENT NAME</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">STUDENT STATUS</th>
              <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">DATE SUBMITTED</th>
              {['Teacher', 'Registrar', 'Admission', 'Principal', 'Cashier'].includes(currentRole) && (
                <th className="px-6 py-4 text-right border-b border-slate-200 dark:border-slate-700">ACTIONS</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map(s => (
              <tr key={s.id} className="hover:bg-brand-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-brand-600 dark:text-brand-400">#{String(s.id).padStart(3,'0')}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">{s.last_name}, {s.first_name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{s.enrollment_status === 'Enrolled' ? 'Old Student' : 'New Student'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                   {new Date().toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit'})}
                </td>
                {['Teacher', 'Registrar', 'Admission', 'Principal', 'Cashier'].includes(currentRole) && (
                  <td className="px-6 py-4 text-right text-sm font-bold text-brand-800 dark:text-brand-400">
                    <button onClick={() => { handleView(s.id); setShowStudentModal(true); setActiveModalTab(null); }} className="hover:underline mr-4 transition-colors">View</button>
                    {['Registrar', 'Principal'].includes(currentRole) && (
                      <button onClick={async () => {
                        if (confirm("Archive this student?")) {
                          await authFetch(`/api/students/${s.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ is_archived: 1, enrollment_status: 'Archived' }) });
                          fetchStudents();
                        }
                      }} className="hover:underline transition-colors">Archive</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No students match your criteria.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      {isStudentsLoading && (
        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-brand-600 dark:text-brand-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Loading Student Directory...</p>
          </div>
        </div>
      )}
      {viewMode === 'Overview' && currentRole !== 'Teacher' ? (
        <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-120px)] p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-black font-cinzel text-brand-800 dark:text-brand-400 tracking-widest uppercase mb-4">STUDENT POPULATION</h2>
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col mb-10 h-80 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Old Students" stackId="a" fill="#1e40af" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="New Students" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <h2 className="text-xl font-black font-cinzel text-brand-800 dark:text-brand-400 tracking-widest uppercase mb-4">GRADE LEVEL</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {GRADES.map(grade => {
                const count = visibleStudents.filter(s => s.grade_level === grade && !['Archived','Graduated','Dropped','Transferred','Rejected'].includes(s.enrollment_status)).length;
                return (
                  <button
                    key={grade}
                    onClick={() => { setGradeFilter(grade); setViewMode('List'); }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-start hover:bg-brand-800 hover:text-white dark:hover:bg-brand-800 transition-colors duration-200 group h-[100px] shadow-sm hover:shadow-md"
                  >
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-white pt-1">{grade}</span>
                    <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-120px)] p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col justify-start">
              {currentRole !== 'Teacher' && (
                <button onClick={() => { setViewMode('Overview'); setGradeFilter('All'); }} className="text-sm font-bold text-slate-400 hover:text-brand-600 mb-4 self-start flex items-center transition-colors">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Overview
                </button>
              )}
              <h2 className="text-3xl font-black font-cinzel text-brand-800 dark:text-brand-400 tracking-widest uppercase">{gradeFilter.toUpperCase()} {sectionFilter !== 'All Sections' ? sectionFilter.toUpperCase() : ''}</h2>
              <p className="text-slate-400 text-sm mt-1">List of Students for Enrollment</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="SEARCH BAR HERE" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-transparent focus:outline-none focus:border-brand-500 placeholder-slate-400 uppercase tracking-widest"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-8 py-3 h-full border-2 border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-brand-800 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  SORT BY
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-1">Sort By Name</div>
                    <button onClick={() => { setSortOrder('name-asc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'name-asc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Name (A-Z)</button>
                    <button onClick={() => { setSortOrder('name-desc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'name-desc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Name (Z-A)</button>
                    
                    <div className="px-5 py-2 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-1">Sort By Grade</div>
                    <button onClick={() => { setSortOrder('grade-asc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'grade-asc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Grade (Low-High)</button>
                    <button onClick={() => { setSortOrder('grade-desc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'grade-desc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Grade (High-Low)</button>

                    <div className="px-5 py-2 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-1">Sort By Section</div>
                    <button onClick={() => { setSortOrder('section-asc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'section-asc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Section (A-Z)</button>
                    <button onClick={() => { setSortOrder('section-desc'); setShowSortDropdown(false); }} className={`w-full text-left px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'section-desc' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Section (Z-A)</button>
                  </div>
                )}
              </div>
            </div>
            
            {renderStudentTable(filteredStudents)}
          </div>
        </div>
      )}

      {/* View Modal Pop-up */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-200">
            
            {/* Left Panel: History */}
            <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 p-8 border-r border-slate-200 dark:border-slate-600 flex flex-col min-h-[500px]">
              <h3 className="text-brand-800 dark:text-brand-400 font-bold text-[13px] tracking-widest uppercase mb-8 text-center border-b border-brand-100 dark:border-slate-700 pb-4">HISTORY OF ACTIONS CREATED</h3>
              <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-2">
                {studentHistory && studentHistory.length > 0 ? studentHistory.map(h => (
                  <div key={h.id} className="text-center">
                    <p className="text-xs text-slate-400 font-bold mb-1">{new Date(h.date_recorded).toLocaleString('en-US', { year:'numeric', month:'2-digit', day:'2-digit', hour:'numeric', minute:'2-digit'})}</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{h.recorder_name || 'System'} {h.action} - {h.description}</p>
                  </div>
                )) : (
                  <p className="text-center text-sm text-slate-400 mt-10">No history actions recorded.</p>
                )}
              </div>
            </div>

            {/* Right Panel: Details & Links */}
            <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 flex flex-col min-h-[500px]">
              
              {/* Profile Header (Sticky) */}
              <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 sticky top-0 relative">
                <button onClick={() => { setShowStudentModal(false); setActiveModalTab(null); }} className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black shadow hover:bg-red-700 z-[100] text-lg leading-none transition-transform hover:scale-110">&times;</button>
                <div className="flex items-center gap-5 w-full justify-center">
                  {selectedStudent.profile_image ? (
                    <img src={selectedStudent.profile_image} alt="Profile" className="w-20 h-20 rounded-lg object-cover border-2 border-brand-100 dark:border-slate-600 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center border-2 border-brand-100 dark:border-slate-600 shadow-sm"><img src="/assets/Profile Icon [2 Clear].png" alt="User" className="w-10 h-10 opacity-30" /></div>
                  )}
                  <div>
                    <h2 className="text-xl font-black text-brand-800 dark:text-brand-400 uppercase tracking-widest leading-tight">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p className="text-xs font-bold text-slate-500 tracking-wider mt-1">{selectedStudent.grade_level} {selectedStudent.section || ''}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Data Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-8 max-h-[60vh]">
                
                {/* Basic Info */}
                <section>
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm border-b pb-2 mb-4 border-slate-200 dark:border-slate-700">Student Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div><span className="block text-xs text-slate-500 mb-1">Gender</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.gender || 'Not specified'}</span></div>
                    <div><span className="block text-xs text-slate-500 mb-1">Date of Birth</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'Not specified'}</span></div>
                    <div className="col-span-2"><span className="block text-xs text-slate-500 mb-1">Address</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.address || 'Not specified'}</span></div>
                    <div><span className="block text-xs text-slate-500 mb-1">Parent/Guardian</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.parent_name || 'Not specified'}</span></div>
                    <div><span className="block text-xs text-slate-500 mb-1">Contact Number</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.contact_number || 'Not specified'}</span></div>
                    {currentRole === 'Teacher' && (
                      <>
                        <div className="col-span-2 border-t border-slate-100 dark:border-slate-700 pt-3 mt-1"></div>
                        <div className="col-span-2 sm:col-span-1"><span className="block text-xs text-slate-500 mb-1">Default Username (LRN)</span><span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.lrn || String(selectedStudent.id).padStart(12, '0')}</span></div>
                        <div className="col-span-2 sm:col-span-1"><span className="block text-xs text-slate-500 mb-1">Default Password</span><span className="font-semibold text-slate-800 dark:text-slate-200 tracking-wider font-mono">password123</span></div>
                      </>
                    )}
                  </div>
                </section>

                {/* Report Card */}
                {currentRole === 'Teacher' && (
                  <section>
                    <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm">Academic Records</h4>
                      <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none font-bold text-slate-700 dark:text-slate-300">
                        <option value="All">All Subjects</option>
                        {Array.from(new Set((selectedStudent.academic_records || []).map(r => r.subject))).map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>
                    {(!selectedStudent.academic_records || selectedStudent.academic_records.length === 0) ? (
                      <p className="text-xs font-bold text-slate-400 text-center py-4 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">No records found</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedStudent.academic_records.filter(r => subjectFilter === 'All' || r.subject === subjectFilter).map(rec => (
                          <div key={rec.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">{rec.subject}</span>
                              <span className="text-xs text-slate-500 font-bold tracking-wide">{rec.term}</span>
                            </div>
                            {editingGradeId === rec.id ? (
                              <div className="flex gap-2 items-center">
                                <input type="number" value={editingGradeScore} onChange={e => setEditingGradeScore(e.target.value)} className="w-16 px-2 py-1 text-center font-bold bg-white dark:bg-slate-800 border border-brand-300 dark:border-brand-700 rounded text-sm outline-none" />
                                <button onClick={() => handleUpdateGrade(rec)} className="text-[10px] bg-brand-600 hover:bg-brand-700 text-white px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors">Save</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{rec.score}</span>
                                {currentRole === 'Teacher' && (
                                  <button onClick={() => { setEditingGradeId(rec.id); setEditingGradeScore(rec.score); }} className="text-[10px] text-slate-400 hover:text-brand-600 uppercase tracking-widest font-bold transition-colors">Edit</button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {currentRole === 'Teacher' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add New Record</h5>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <input type="text" placeholder="Subject" value={newRecord.subject} onChange={e => setNewRecord({...newRecord, subject: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 outline-none focus:border-brand-500" />
                          </div>
                          <div className="w-20">
                            <input type="number" placeholder="Score" value={newRecord.score} onChange={e => setNewRecord({...newRecord, score: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 outline-none focus:border-brand-500 text-center" />
                          </div>
                          <button onClick={handleAddRecord} disabled={!newRecord.subject || !newRecord.score} className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors h-[34px]">Add</button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Attendance */}
                <section>
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm border-b pb-2 mb-4 border-slate-200 dark:border-slate-700">Attendance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 p-4 rounded-xl text-center">
                      <span className="block text-2xl font-black text-green-700 dark:text-green-400">95%</span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Present</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 rounded-xl text-center">
                      <span className="block text-2xl font-black text-red-700 dark:text-red-400">5%</span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-widest">Absent</span>
                    </div>
                  </div>
                </section>

                {/* Requirements */}
                <section>
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm border-b pb-2 mb-4 border-slate-200 dark:border-slate-700">Requirements Submitted</h4>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Form 138 (Report Card)</span>
                        {selectedStudent.req_form_138 ? <span className="text-green-600 font-black">✓</span> : <span className="text-red-500 font-bold text-xs uppercase">Pending</span>}
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">PSA Birth Certificate</span>
                        {selectedStudent.req_birth_cert ? <span className="text-green-600 font-black">✓</span> : <span className="text-red-500 font-bold text-xs uppercase">Pending</span>}
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Certificate of Good Moral</span>
                        {selectedStudent.req_good_moral ? <span className="text-green-600 font-black">✓</span> : <span className="text-red-500 font-bold text-xs uppercase">Pending</span>}
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">2x2 Pictures</span>
                        {selectedStudent.req_pictures ? <span className="text-green-600 font-black">✓</span> : <span className="text-red-500 font-bold text-xs uppercase">Pending</span>}
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Payments */}
                {currentRole === 'Cashier' && (
                  <section>
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase text-sm border-b pb-2 mb-4 border-slate-200 dark:border-slate-700">Payment Status</h4>
                    {(!selectedStudent.tuition_payments || selectedStudent.tuition_payments.length === 0) ? (
                      <p className="text-xs font-bold text-slate-400 text-center py-4 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">No payment data recorded</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedStudent.tuition_payments.map(tp => {
                          const bal = tp.amount_due - tp.amount_paid;
                          return (
                          <div key={tp.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{tp.term}</span>
                                <span className="text-xs text-slate-500 font-medium">Due: ₱{tp.amount_due?.toLocaleString()} | Bal: <span className="font-bold text-red-500">₱{bal?.toLocaleString()}</span></span>
                              </div>
                              <div className="flex gap-3 items-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tp.status === 'Paid' ? 'bg-green-100 text-green-700' : tp.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{tp.status === 'Paid' ? 'Cleared' : tp.status === 'Overdue' ? 'Outstanding' : 'Promissory'}</span>
                                {currentRole === 'Cashier' && (
                                  <button onClick={() => {
                                    setPaymentForm({
                                      tpId: tp.id,
                                      amount: tp.amount_paid || '',
                                      or_number: '',
                                      date: new Date().toISOString().split('T')[0],
                                      time: new Date().toTimeString().split(' ')[0].substring(0, 5)
                                    });
                                    setShowPaymentModal(true);
                                    setShowStudentModal(false);
                                  }} className="text-[10px] text-brand-600 font-bold uppercase tracking-widest hover:underline px-2">Edit Payment</button>
                                )}
                              </div>
                            </div>
                            
                            {tp.payments && tp.payments.length > 0 && (
                              <div className="p-3 bg-white dark:bg-slate-800 space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Payment History</div>
                                {tp.payments.map((p, pidx) => (
                                  <div key={pidx} className="flex justify-between items-center text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-green-600 dark:text-green-400">+₱{p.amount?.toLocaleString()}</span>
                                      {currentRole === 'Cashier' && <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">OR: {p.or_number}</span>}
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400">{new Date(p.date_recorded).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )})}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Action Buttons (Sticky Bottom) */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 mt-auto">
                <div className="flex gap-3 w-full justify-center">

                {currentRole === 'Registrar' && (
                  <button onClick={() => { setShowStudentModal(false); setActiveModalTab(null); setShowEndYearConfirm(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] px-5 py-2.5 rounded-full uppercase tracking-wider transition-transform hover:scale-105 shadow-sm">End School Year</button>
                )}
                {['Registrar', 'Principal'].includes(currentRole) && (
                  <>
                    <button onClick={() => { setShowStudentModal(false); setActiveModalTab(null); setEditingStudent(selectedStudent); setShowEdit(true); }} className="bg-brand-800 hover:bg-brand-900 text-white font-bold text-[11px] px-8 py-2.5 rounded-full uppercase tracking-wider transition-transform hover:scale-105 shadow-sm">Edit</button>
                    <button onClick={async () => {
                      if (confirm("Archive this student?")) {
                        await authFetch(`/api/students/${selectedStudent.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ is_archived: 1, enrollment_status: 'Archived' }) });
                        setShowStudentModal(false); setActiveModalTab(null);
                        fetchStudents();
                      }
                    }} className="bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] px-6 py-2.5 rounded-full uppercase tracking-wider transition-transform hover:scale-105 shadow-sm">Archive</button>
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Student</h3>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.first_name} onChange={e => setEditingStudent({...editingStudent, first_name:e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.last_name} onChange={e => setEditingStudent({...editingStudent, last_name:e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.grade_level} onChange={e => setEditingStudent({...editingStudent, grade_level:e.target.value})}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enrollment Status</label>
                  <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.enrollment_status} onChange={e => setEditingStudent({...editingStudent, enrollment_status:e.target.value})}>
                    {['Enrolled','Pending','Hold: Incomplete Req', 'Dropped', 'Transferred', 'Archived', 'Graduated', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">School Year</label>
                  <input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.school_year || '2025-2026'} onChange={e => setEditingStudent({...editingStudent, school_year:e.target.value})} />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload New Profile Image</label><input type="file" accept="image/*" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" onChange={e => setEditingStudentFile(e.target.files[0])} /></div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End School Year Confirm Modal */}
      {showEndYearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">End School Year?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              Are you sure you want to end the current school year? This action will advance all students to the next grade level and clear their current section assignments. This cannot be easily undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEndYearConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
              <button onClick={async () => {
                setShowEndYearConfirm(false);
                const token = localStorage.getItem('token');
                const res = await fetch('/api/admin/end_school_year', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                  alert('School year ended successfully.');
                  fetchStudents();
                } else {
                  alert('Failed to end school year.');
                }
              }} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow transition">Confirm End Year</button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Edit Payment for {selectedStudent?.first_name} {selectedStudent?.last_name}</h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (₱)</label>
                <input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">OR / Receipt Number</label>
                <input type="text" value={paymentForm.or_number} onChange={e => setPaymentForm({...paymentForm, or_number: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Time</label>
                  <input type="time" value={paymentForm.time} onChange={e => setPaymentForm({...paymentForm, time: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
              <button onClick={async () => {
                if (paymentForm.amount) {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`/api/tuition_payments/${paymentForm.tpId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ amount_paid: parseFloat(paymentForm.amount), or_number: paymentForm.or_number })
                  });
                  if (res.ok) {
                    setShowPaymentModal(false);
                    fetchStudents();
                  } else {
                    alert('Failed to update payment');
                  }
                }
              }} className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition">Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
