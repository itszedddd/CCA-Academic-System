import React, { useState, Fragment } from 'react';

const GRADES = ['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const SECTIONS = ['Humility', 'Courage', 'Goodwill', 'Persistence'];
const SECTION_META = {
  Humility:    { grade: 'Grade 7', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200' },
  Courage:     { grade: 'Grade 8', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200' },
  Goodwill:    { grade: 'Grade 9', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200' },
  Persistence: { grade: 'Grade 10', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200' },
};
const API = '/api';

export default function Students({ students, fetchStudents, fetchWarnings, currentRole, authFetch }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingGradeScore, setEditingGradeScore] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');
  const [gradeView, setGradeView] = useState('overall'); // 'overall' | 'grade'
  const [recommendations, setRecommendations] = useState([]);
  const [newStudent, setNewStudent] = useState({ first_name:'', last_name:'', grade_level:'Pre-Kinder', section:'', contact_email:'', profile_image:'', enrollment_status:'Enrolled', username:'', password:'' });
  const [newRecord, setNewRecord] = useState({ subject: '', score: '', term: '1st Quarter' });

  const [newStudentFile, setNewStudentFile] = useState(null);
  const [editingStudentFile, setEditingStudentFile] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    const studentPayload = { ...newStudent };
    delete studentPayload.username;
    delete studentPayload.password;
    const res = await authFetch(`${API}/students/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(studentPayload) });
    if (res?.ok) { 
      const created = await res.json();
      if (newStudentFile) {
        const fd = new FormData();
        fd.append('file', newStudentFile);
        await authFetch(`${API}/students/${created.id}/upload_image`, { method: 'POST', body: fd });
      }
      
      if (newStudent.username && newStudent.password) {
        await authFetch(`${API}/users/`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            username: newStudent.username,
            password: newStudent.password,
            role: 'Student',
            student_id: created.id,
            is_active: 1
          })
        });
      }
      
      setShowRegister(false); fetchStudents(); 
      setNewStudent({ first_name:'', last_name:'', grade_level:'Pre-Kinder', section:'', contact_email:'', profile_image:'', enrollment_status:'Enrolled', username:'', password:'' }); 
      setNewStudentFile(null);
    }
  };

  const handleView = async (id) => {
    if (expandedStudentId === id) {
       setExpandedStudentId(null);
       return;
    }
    const res = await fetch(`${API}/students/${id}`);
    if (res.ok) {
      setSelectedStudent(await res.json());
      const recRes = await fetch(`${API}/resource_recommendations/${id}`);
      setRecommendations(recRes.ok ? await recRes.json() : []);
      setExpandedStudentId(id);
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
        term: newRecord.term
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


  // Group by grade for per-grade view
  const gradeGroups = GRADES.map(g => ({
    grade: g,
    students: filteredStudents.filter(s => s.grade_level === g)
  })).filter(g => g.students.length > 0);

  const renderStudentTable = (rows) => (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-700">
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Grade</th>
          <th className="px-6 py-3">Section</th>
          <th className="px-6 py-3">Status</th>
          {['Teacher', 'Registrar'].includes(currentRole) && (
            <th className="px-6 py-3 text-right">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {rows.map(s => {
          const meta = SECTION_META[s.section];
          const imgSrc = s.profile_image;
          const isExpanded = expandedStudentId === s.id && selectedStudent?.id === s.id;
          
          return (
            <Fragment key={s.id}>
              <tr className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { if (currentRole === 'Teacher') handleView(s.id); }}>
                <td className="px-6 py-4 text-sm font-bold text-brand-600 dark:text-brand-300">#{String(s.id).padStart(4,'0')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={`${s.first_name} ${s.last_name}`}
                        className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0 bg-slate-100 dark:bg-slate-700"
                        onError={e => { e.target.onerror = null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    ) : null}
                    <div style={{display: imgSrc ? 'none' : 'flex'}} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <img src="/assets/Profile Icon [2 Clear].png" alt="Default Logo" className="w-5 h-5 object-contain opacity-70" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{s.last_name}, {s.first_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {s.grade_level}
                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">SY {s.school_year || '2025-2026'}</div>
                </td>
                <td className="px-6 py-4">
                  {s.section ? (
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${meta?.color || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>{s.section}</span>
                  ) : <span className="text-slate-400 text-sm">—</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${s.enrollment_status === 'Enrolled' ? 'bg-green-100 text-green-700' : s.enrollment_status === 'Dropped' ? 'bg-red-100 text-red-700' : s.enrollment_status === 'Hold: Incomplete Req' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-amber-100 text-amber-700'}`}>{s.enrollment_status}</span>
                </td>
                {['Teacher', 'Registrar'].includes(currentRole) && (
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    {currentRole === 'Teacher' && (
                      <button onClick={(e) => { e.stopPropagation(); handleView(s.id); }} className="text-slate-400 hover:text-brand-600 transition">{isExpanded ? 'Hide Grades' : 'View Grades'}</button>
                    )}
                    {currentRole === 'Registrar' && <button onClick={(e) => { e.stopPropagation(); setEditingStudent({...s}); setShowEdit(true); }} className="text-slate-400 hover:text-brand-600 transition font-bold">Edit</button>}
                  </td>
                )}
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan="6" className="p-0 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="p-6">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 border-b pb-2 dark:border-slate-700">Student Report Card (SF9 Format)</h4>
                      
                      <div className="overflow-x-auto mb-6 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-center border-collapse min-w-[600px] bg-white dark:bg-slate-900">
                          <thead><tr className="bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                            <th className="border border-slate-200 dark:border-slate-600 px-4 py-2 text-left w-1/3">Learning Areas</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">1</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">2</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">3</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-2 py-2">4</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 w-20">Final Grade</th>
                            <th className="border border-slate-200 dark:border-slate-600 px-3 py-2 w-20">Remarks</th>
                          </tr></thead>
                          <tbody>
                            {(!selectedStudent.academic_records || selectedStudent.academic_records.length === 0) ? (
                              <tr><td colSpan="7" className="p-6 text-center text-sm text-slate-500">No academic records found.</td></tr>
                            ) : (
                              (() => {
                                const grouped = {};
                                selectedStudent.academic_records.forEach(r => {
                                  if (!grouped[r.subject]) grouped[r.subject] = { subject: r.subject, q1: null, q2: null, q3: null, q4: null };
                                  const t = r.term.toLowerCase();
                                  if (t.includes('1st')) grouped[r.subject].q1 = r;
                                  else if (t.includes('2nd')) grouped[r.subject].q2 = r;
                                  else if (t.includes('3rd')) grouped[r.subject].q3 = r;
                                  else if (t.includes('4th')) grouped[r.subject].q4 = r;
                                });
                                
                                const renderCell = (r) => {
                                  if (!r) return <span className="text-slate-300">—</span>;
                                  if (editingGradeId === r.id) return (
                                    <div className="flex flex-col items-center">
                                      <input type="number" className="w-14 p-1 text-xs border border-brand-300 rounded outline-none text-center dark:bg-slate-700" value={editingGradeScore} onChange={e=>setEditingGradeScore(e.target.value)} />
                                      <div className="flex space-x-2 mt-1"><button onClick={()=>handleUpdateGrade(r)} className="text-green-600 text-[10px] font-bold">Save</button><button onClick={()=>setEditingGradeId(null)} className="text-slate-500 text-[10px]">Cancel</button></div>
                                    </div>
                                  );
                                  const isFailing = r.score <= 75;
                                  return (
                                    <div className={`flex flex-col items-center group relative h-6 justify-center ${isFailing ? 'text-red-500 font-bold' : ''}`}>
                                      <span className="text-sm">{r.score}</span>
                                      {currentRole === 'Teacher' && <button onClick={()=>{setEditingGradeId(r.id); setEditingGradeScore(r.score);}} className="opacity-0 group-hover:opacity-100 absolute -top-5 text-[10px] text-brand-600 font-bold bg-white dark:bg-slate-800 px-1 rounded shadow-sm border border-brand-100 z-10 transition-opacity">Edit</button>}
                                    </div>
                                  );
                                };

                                return Object.values(grouped).map((row, i) => {
                                  const grades = [row.q1?.score, row.q2?.score, row.q3?.score, row.q4?.score].filter(s => s != null);
                                  const finalGrade = grades.length === 4 ? Math.round(grades.reduce((a,b)=>a+b,0)/4) : null;
                                  const remarks = finalGrade ? (finalGrade > 75 ? 'Passed' : 'Failed') : '';
                                  return (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                      <td className="border border-slate-200 dark:border-slate-600 px-4 py-2 text-left font-semibold text-sm text-slate-800 dark:text-white">{row.subject}</td>
                                      <td className="border border-slate-200 dark:border-slate-600 px-2 py-2">{renderCell(row.q1)}</td>
                                      <td className="border border-slate-200 dark:border-slate-600 px-2 py-2">{renderCell(row.q2)}</td>
                                      <td className="border border-slate-200 dark:border-slate-600 px-2 py-2">{renderCell(row.q3)}</td>
                                      <td className="border border-slate-200 dark:border-slate-600 px-2 py-2">{renderCell(row.q4)}</td>
                                      <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 font-bold text-sm ${finalGrade > 75 ? 'text-green-600' : (finalGrade ? 'text-red-600' : '')}`}>{finalGrade || ''}</td>
                                      <td className={`border border-slate-200 dark:border-slate-600 px-2 py-2 text-xs font-bold uppercase ${remarks === 'Passed' ? 'text-green-600' : (remarks === 'Failed' ? 'text-red-600' : '')}`}>{remarks}</td>
                                    </tr>
                                  );
                                });
                              })()
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Add New Record Row (Teachers only) */}
                      {currentRole === 'Teacher' && (
                        <div className="bg-brand-50/50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3 mb-6">
                          <span className="text-sm font-bold text-brand-800 dark:text-brand-300 w-full sm:w-auto">Add Grade:</span>
                          <select className="text-sm p-2 w-full sm:w-32 border border-brand-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none text-slate-800 dark:text-white" value={newRecord.term} onChange={e => setNewRecord({...newRecord, term: e.target.value})}>
                            <option>1st Quarter</option><option>2nd Quarter</option><option>3rd Quarter</option><option>4th Quarter</option>
                          </select>
                          <div className="flex-1 w-full relative">
                            <input list="ph-subjects" placeholder="Subject Name (e.g. Mathematics)" className="text-sm p-2 w-full border border-brand-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none text-slate-800 dark:text-white" value={newRecord.subject} onChange={e => setNewRecord({...newRecord, subject: e.target.value})} />
                            <datalist id="ph-subjects">
                              <option value="Filipino" /><option value="English" /><option value="Mathematics" /><option value="Science" />
                              <option value="Araling Panlipunan (AP)" /><option value="Edukasyon sa Pagpapakatao (EsP)" />
                              <option value="Technology and Livelihood Education (TLE)" /><option value="MAPEH" />
                            </datalist>
                          </div>
                          <input type="number" placeholder="Score" className="text-sm p-2 w-full sm:w-20 border border-brand-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none text-center text-slate-800 dark:text-white" value={newRecord.score} onChange={e => setNewRecord({...newRecord, score: e.target.value})} />
                          <button onClick={handleAddRecord} disabled={!newRecord.subject || !newRecord.score} className="w-full sm:w-auto bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-brand-700 transition">Save</button>
                        </div>
                      )}

                      {recommendations.length > 0 && (
                        <>
                          <h4 className="font-bold text-slate-800 dark:text-white mb-3 border-b pb-2 dark:border-slate-700 flex items-center mt-6">
                            <svg className="w-4 h-4 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            AI Resource Recommendations
                          </h4>
                          <div className="space-y-2 mb-4">
                            {recommendations.map((rec, i) => (
                              <div key={i} className="p-3 rounded-xl border border-brand-100 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-800 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{rec.resource_title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium text-red-500">{rec.subject}</span> · Avg: {rec.average_score}% · <span className="text-brand-600">{rec.resource_type}</span></p>
                                </div>
                                <a href={rec.resource_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium ml-3 flex-shrink-0">Open →</a>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
        {rows.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No students match your criteria.</td></tr>}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">Student Directory</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage student profiles, academic records, and enrollment.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Overall / Per Grade toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-bold">
              <button onClick={() => setGradeView('overall')} className={`px-3 py-1.5 transition ${gradeView === 'overall' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Overall</button>
              <button onClick={() => setGradeView('grade')} className={`px-3 py-1.5 transition border-l border-slate-200 dark:border-slate-700 ${gradeView === 'grade' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Per Grade</button>
            </div>
            {currentRole === 'Registrar' && (
              <button onClick={() => setShowRegister(true)} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-sm flex items-center text-sm w-full sm:w-auto justify-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Register Student
              </button>
            )}
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
            <select 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none"
            >
              {uniqueSections.map(sec => <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : sec}</option>)}
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center"
            >
              Sort A-Z
              <svg className={`ml-2 h-4 w-4 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {gradeView === 'overall' ? (
            renderStudentTable(filteredStudents)
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {gradeGroups.map(group => (
                <div key={group.grade}>
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                    <span className="text-xs font-bold font-cinzel tracking-widest text-brand-700 dark:text-brand-400 uppercase">{group.grade}</span>
                    <span className="ml-2 text-xs text-slate-400">({group.students.length} students)</span>
                  </div>
                  {renderStudentTable(group.students)}
                </div>
              ))}
              {gradeGroups.length === 0 && <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No students match your criteria.</div>}
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowRegister(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Register New Student</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.first_name} onChange={e => setNewStudent({...newStudent, first_name:e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.last_name} onChange={e => setNewStudent({...newStudent, last_name:e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.grade_level} onChange={e => setNewStudent({...newStudent, grade_level:e.target.value})}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section:e.target.value})}>
                    <option value="">— None —</option>
                    {SECTIONS.map(sec => <option key={sec}>{sec}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">School Year</label>
                  <input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.school_year || '2025-2026'} onChange={e => setNewStudent({...newStudent, school_year:e.target.value})} placeholder="2025-2026" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Email</label><input type="email" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.contact_email} onChange={e => setNewStudent({...newStudent, contact_email:e.target.value})} placeholder="parent@example.com" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Image</label><input type="file" accept="image/*" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" onChange={e => setNewStudentFile(e.target.files[0])} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Username</label><input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.username} onChange={e => setNewStudent({...newStudent, username:e.target.value})} placeholder="e.g. juan.delacruz" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Password</label><input required type="password" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password:e.target.value})} placeholder="••••••••" /></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition shadow mt-2">Submit Registration</button>
            </form>
          </div>
        </div>
      )}

    {/* The View modal was here. Now it is moved to inline sub-row */}

      {/* Edit Modal */}
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
                    {['Enrolled','Pending','Dropped','Transferred', 'Hold: Incomplete Req'].map(s => <option key={s}>{s}</option>)}
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
    </>
  );
}
