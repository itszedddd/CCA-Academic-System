import { useState } from 'react';

const GRADES = ['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const API = '/api';

export default function Students({ students, fetchStudents, fetchWarnings, currentRole, authFetch }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingGradeScore, setEditingGradeScore] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');
  const [recommendations, setRecommendations] = useState([]);
  const [newStudent, setNewStudent] = useState({ first_name:'', last_name:'', grade_level:'Grade 7', section:'', contact_email:'', profile_image:'', enrollment_status:'Enrolled' });
  const [newRecord, setNewRecord] = useState({ subject: '', score: '', term: '1st Grading' });

  const [newStudentFile, setNewStudentFile] = useState(null);
  const [editingStudentFile, setEditingStudentFile] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await authFetch(`${API}/students/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newStudent) });
    if (res?.ok) { 
      const created = await res.json();
      if (newStudentFile) {
        const fd = new FormData();
        fd.append('file', newStudentFile);
        await authFetch(`${API}/students/${created.id}/upload_image`, { method: 'POST', body: fd });
      }
      setShowRegister(false); fetchStudents(); 
      setNewStudent({ first_name:'', last_name:'', grade_level:'Grade 7', section:'', contact_email:'', profile_image:'', enrollment_status:'Enrolled' }); 
      setNewStudentFile(null);
    }
  };

  const handleView = async (id) => {
    const res = await fetch(`${API}/students/${id}`);
    if (res.ok) {
      setSelectedStudent(await res.json());
      const recRes = await fetch(`${API}/resource_recommendations/${id}`);
      setRecommendations(recRes.ok ? await recRes.json() : []);
      setShowView(true);
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
      setNewRecord({ subject: '', score: '', term: '1st Grading' });
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

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Student Directory</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage student profiles, academic records, and enrollment.</p>
          </div>
          {currentRole === 'Administrator' && (
            <button onClick={() => setShowRegister(true)} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-sm flex items-center text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Register Student
            </button>
          )}
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
          <table className="w-full text-left">
            <thead><tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Grade</th>
              <th className="px-6 py-3 font-medium">Section</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-brand-600">#{String(s.id).padStart(4,'0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {s.profile_image ? (
                        <img src={s.profile_image} alt={`${s.first_name} ${s.last_name}`} className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0 bg-slate-100 dark:bg-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">{s.first_name[0]}{s.last_name[0]}</div>
                      )}
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">{s.last_name}, {s.first_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{s.grade_level}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{s.section || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${s.enrollment_status === 'Enrolled' ? 'bg-green-100 text-green-700' : s.enrollment_status === 'Dropped' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{s.enrollment_status}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleView(s.id)} className="text-slate-400 hover:text-brand-600 transition">View</button>
                    {currentRole === 'Administrator' && <button onClick={() => { setEditingStudent({...s}); setShowEdit(true); }} className="text-slate-400 hover:text-brand-600 transition">Edit</button>}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No students match your criteria.</td></tr>}
            </tbody>
          </table>
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
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section (optional)</label><input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section:e.target.value})} placeholder="e.g. St. Joseph" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Email</label><input type="email" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={newStudent.contact_email} onChange={e => setNewStudent({...newStudent, contact_email:e.target.value})} placeholder="parent@example.com" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Image</label><input type="file" accept="image/*" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" onChange={e => setNewStudentFile(e.target.files[0])} /></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition shadow mt-2">Submit Registration</button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowView(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center mb-6">
              {selectedStudent.profile_image ? (
                <img src={selectedStudent.profile_image} className="w-14 h-14 rounded-full object-cover mr-4 bg-slate-100 dark:bg-slate-700 shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">{selectedStudent.first_name[0]}{selectedStudent.last_name[0]}</div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">#{String(selectedStudent.id).padStart(4,'0')} · {selectedStudent.grade_level} {selectedStudent.section && `· ${selectedStudent.section}`} · <span className={selectedStudent.enrollment_status === 'Enrolled' ? 'text-green-600' : 'text-amber-500'}>{selectedStudent.enrollment_status}</span></p>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 dark:text-white mb-3 border-b pb-2 dark:border-slate-700">Academic Records</h4>
            
            <table className="w-full text-left mb-6">
              <thead><tr className="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400">
                <th className="px-4 py-2 font-medium">Term</th><th className="px-4 py-2 font-medium">Subject</th><th className="px-4 py-2 font-medium text-right">Score</th><th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {selectedStudent.academic_records?.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-2 text-sm">{r.term}</td>
                    <td className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">{r.subject}</td>
                    <td className="px-4 py-2 text-sm text-right font-bold">
                      {editingGradeId === r.id
                        ? <input type="number" step="0.01" className="w-20 px-2 py-1 text-right border border-brand-300 rounded bg-white dark:bg-slate-700 outline-none" value={editingGradeScore} onChange={e => setEditingGradeScore(e.target.value)} />
                        : `${r.score}%`
                      }
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {currentRole === 'Teacher' && (
                        editingGradeId === r.id
                          ? <span className="space-x-2"><button onClick={() => handleUpdateGrade(r)} className="text-green-600 hover:text-green-800 text-xs font-medium">Save</button><button onClick={() => setEditingGradeId(null)} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button></span>
                          : <button onClick={() => { setEditingGradeId(r.id); setEditingGradeScore(r.score); }} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Add New Record Row (Teachers only) */}
                {currentRole === 'Teacher' && (
                  <tr className="bg-brand-50/50 dark:bg-brand-900/10">
                    <td className="px-4 py-2">
                      <select className="text-xs border rounded bg-white dark:bg-slate-700 p-1" value={newRecord.term} onChange={e => setNewRecord({...newRecord, term: e.target.value})}>
                        <option>1st Grading</option><option>2nd Grading</option><option>3rd Grading</option><option>4th Grading</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input placeholder="Subject" className="text-xs border rounded bg-white dark:bg-slate-700 p-1 w-full" value={newRecord.subject} onChange={e => setNewRecord({...newRecord, subject: e.target.value})} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" placeholder="Score" className="text-xs border rounded bg-white dark:bg-slate-700 p-1 w-16 text-right" value={newRecord.score} onChange={e => setNewRecord({...newRecord, score: e.target.value})} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={handleAddRecord} disabled={!newRecord.subject || !newRecord.score} className="bg-brand-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50">Add</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {(!selectedStudent.academic_records || selectedStudent.academic_records.length === 0) && currentRole !== 'Teacher' && (
              <p className="text-slate-500 text-sm mb-4 text-center bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">No academic records found.</p>
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

            <button onClick={() => setShowView(false)} className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition mt-4">Close</button>
          </div>
        </div>
      )}

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
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enrollment Status</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingStudent.enrollment_status} onChange={e => setEditingStudent({...editingStudent, enrollment_status:e.target.value})}>
                  {['Enrolled','Pending','Dropped','Transferred'].map(s => <option key={s}>{s}</option>)}
                </select>
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
