import React, { useState, useEffect } from 'react';

export default function FacultyMembers({ API, token, currentRole, setActiveTab, authFetch }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    password: '',
    section: '',
    subjects: [] // array of strings
  });

  // Example subjects list for the multiselect
  const availableSubjects = ["Math", "Science", "English", "History", "PE", "Computer", "Values", "Filipino"];

  const predefinedSections = [
    "Kindergarten - Kindness",
    "Grade 1 - Love",
    "Grade 2 - Joyful",
    "Grade 3 - Faith",
    "Grade 4 - Grace",
    "Grade 5 - Loyalty",
    "Grade 6 - Obedience",
    "Grade 7 - Meekness",
    "Grade 8 - Courage",
    "Grade 9 - Benevolence",
    "Grade 10 - Perseverance"
  ];

  useEffect(() => {
    if (currentRole === 'Registrar') fetchTeachers();
  }, [currentRole]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/registrar/teachers`);
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        full_name: form.full_name,
        password: form.password,
        role: "Teacher",
        section: form.section,
        schedule: JSON.stringify(form.subjects)
      };
      const res = await authFetch(`${API}/registrar/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchTeachers();
        setForm({ username: '', full_name: '', password: '', section: '', subjects: [] });
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail}`);
      }
    } catch (e) {
      alert("Error adding teacher");
    }
  };

  const toggleSubject = (subj) => {
    setForm(prev => {
      const isSelected = prev.subjects.includes(subj);
      if (isSelected) return { ...prev, subjects: prev.subjects.filter(s => s !== subj) };
      return { ...prev, subjects: [...prev.subjects, subj] };
    });
  };

  // Derived departments
  const isKinder = (section) => section && (section.includes("Kinder") || section.includes("Kindness"));
  const isHighSchool = (section) => section && (
    section.includes("Grade 7") || section.includes("Grade 8") || section.includes("Grade 9") || section.includes("Grade 10") || section.includes("High School") ||
    section.includes("Meekness") || section.includes("Courage") || section.includes("Benevolence") || section.includes("Perseverance")
  );
  
  const kinderTeachers = teachers.filter(t => isKinder(t.section));
  const highSchoolTeachers = teachers.filter(t => isHighSchool(t.section));
  const elementaryTeachers = teachers.filter(t => t.section && !isKinder(t.section) && !isHighSchool(t.section));

  const parseSubjects = (scheduleStr) => {
    if (!scheduleStr) return [];
    try {
      const parsed = JSON.parse(scheduleStr);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.subject || 'Unknown Subject';
          }
          return String(item);
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const TeacherCard = ({ t }) => {
    const subjects = parseSubjects(t.schedule);
    
    return (
      <div 
        onClick={() => setSelectedTeacher(t)}
        className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center cursor-pointer transition-all hover:bg-[#022868] group"
      >
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 flex items-center justify-center overflow-hidden">
          {t.profile_picture ? (
            <img src={t.profile_picture} alt={t.full_name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          )}
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-white text-center transition-colors">{t.full_name || t.username}</h4>
        {t.section && (
          <p className="text-xs text-brand-600 dark:text-brand-400 group-hover:text-white/80 transition-colors mt-1">
            {t.section} Adviser
          </p>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {subjects.map((s, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] rounded-full text-slate-600 dark:text-slate-300 group-hover:bg-white/20 group-hover:text-white transition-colors">
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-cinzel tracking-widest uppercase text-[#022868] dark:text-blue-400">FACULTY MEMBERS</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage teaching staff accounts</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white text-sm font-bold tracking-wider rounded-lg transition shadow-md flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          CREATE/ADD TEACHER
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="space-y-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-cinzel text-[#022868] dark:text-blue-400 mb-4 tracking-widest uppercase">JUNIOR HIGH SCHOOL DEPARTMENT</h3>
            {highSchoolTeachers.length === 0 ? (
              <p className="text-slate-400 text-sm">No teachers assigned to Junior High School yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {highSchoolTeachers.map(t => <TeacherCard key={t.id} t={t} />)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold font-cinzel text-[#022868] dark:text-blue-400 mb-4 tracking-widest uppercase">ELEMENTARY DEPARTMENT</h3>
            {elementaryTeachers.length === 0 ? (
              <p className="text-slate-400 text-sm">No teachers assigned to Elementary yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {elementaryTeachers.map(t => <TeacherCard key={t.id} t={t} />)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold font-cinzel text-[#022868] dark:text-blue-400 mb-4 tracking-widest uppercase">KINDERGARTEN DEPARTMENT</h3>
            {kinderTeachers.length === 0 ? (
              <p className="text-slate-400 text-sm">No teachers assigned to Kindergarten yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {kinderTeachers.map(t => <TeacherCard key={t.id} t={t} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
              <h3 className="font-bold text-lg text-[#022868] dark:text-white uppercase tracking-wider font-cinzel">Add New Teacher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <input required type="password" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Advisory Class (Section)</label>
                <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900" value={form.section} onChange={e => setForm({...form, section: e.target.value})}>
                  <option value="">None</option>
                  {predefinedSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Assigned Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map(subj => (
                    <label key={subj} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${form.subjects.includes(subj) ? 'bg-[#022868] text-white border-[#022868]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                      <input type="checkbox" className="hidden" checked={form.subjects.includes(subj)} onChange={() => toggleSubject(subj)} />
                      {subj}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-[#022868]">
              <h3 className="font-bold text-lg text-white uppercase tracking-wider font-cinzel">Teacher Profile</h3>
              <button onClick={() => setSelectedTeacher(null)} className="text-white/70 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedTeacher.profile_picture ? (
                    <img src={selectedTeacher.profile_picture} alt={selectedTeacher.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-800 dark:text-white">{selectedTeacher.full_name || selectedTeacher.username}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isHighSchool(selectedTeacher.section) ? 'Junior High School' : isKinder(selectedTeacher.section) ? 'Kindergarten' : 'Elementary'} Department</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Advisory Class</h5>
                  <p className="text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">{selectedTeacher.section || 'None'}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Subjects</h5>
                  <div className="flex flex-wrap gap-2">
                    {parseSubjects(selectedTeacher.schedule).length > 0 ? (
                      parseSubjects(selectedTeacher.schedule).map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs rounded-md font-medium">
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No subjects assigned</p>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attendance Tracking</h5>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30 flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Current Status</span>
                    <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">Present</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button onClick={() => setSelectedTeacher(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
