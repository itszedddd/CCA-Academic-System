import React, { useState } from 'react';

const API = '/api';

export default function NewStudents({ forms, fetchForms, authFetch }) {
  // Page 1: Grade Selection, Page 2: Student List, Page 3: Evaluation View
  const [view, setView] = useState('grades'); // 'grades', 'list', 'evaluate'
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [admissionStatus, setAdmissionStatus] = useState('Passed');
  const [admissionRemarks, setAdmissionRemarks] = useState('');

  const gradeLevels = [
    'Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 
    'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 
    'Grade 9', 'Grade 10'
  ];

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setView('list');
  };

  const handleEvaluateClick = (form) => {
    setSelectedForm(form);
    setAdmissionStatus(form.assessment_status === 'Passed' ? 'Passed' : 'Pending');
    setAdmissionRemarks(form.remarks || '');
    setView('evaluate');
  };

  const handleArchiveClick = async (form) => {
    if (loading) return;
    if (!window.confirm(`Are you sure you want to archive ${form.student_first_name} ${form.student_last_name}?`)) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/${form.id}/assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Failed', remarks: 'Archived by Admission' })
      });
      if (res?.ok) {
        fetchForms();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAssessment = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/${selectedForm.id}/assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: admissionStatus, remarks: admissionRemarks })
      });
      if (res?.ok) {
        fetchForms();
        setView('list');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pre-registered students for the selected grade
  const gradeStudents = forms.filter(f => f.grade_applying_for === selectedGrade && f.status !== 'Enrolled');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-8 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-brand-900 dark:text-brand-400 tracking-widest uppercase mb-1 flex items-center">
              <svg className="w-7 h-7 mr-3 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              NEW STUDENTS ADMISSION
            </h2>
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400/80 tracking-wider">
              {view === 'grades' ? 'Select a grade level to review pre-registered applications.' : 
               view === 'list' ? `Reviewing applicants for ${selectedGrade}` :
               `Evaluating application: ${selectedForm?.student_first_name} ${selectedForm?.student_last_name}`}
            </p>
          </div>
          <div className="absolute -right-10 -top-10 opacity-5">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          
          {view !== 'grades' && (
            <div className="relative z-10">
              <button onClick={() => view === 'evaluate' ? setView('list') : setView('grades')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {view === 'evaluate' ? 'Back to List' : 'Back to Grades'}
              </button>
            </div>
          )}
        </div>

        {/* View 1: Grade Selection Grid */}
        {view === 'grades' && (
          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {gradeLevels.map(grade => {
                const count = forms.filter(f => f.grade_applying_for === grade && (f.status === 'Pre-Registered' || f.status === 'Pending')).length;
                return (
                  <div 
                    key={grade} 
                    onClick={() => handleGradeClick(grade)}
                    className="group bg-slate-50 hover:bg-brand-50 dark:bg-slate-900/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg className="w-12 h-12 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
                    </div>
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-inner flex items-center justify-center mb-4 text-2xl font-black text-slate-700 dark:text-slate-200">
                      {grade.replace('Grade ', 'G').replace('Pre-Kinder', 'PK').replace('Kinder', 'K')}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{grade}</h3>
                    <div className="mt-auto">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${count > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                        {count} Pending
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Student List for Selected Grade */}
        {view === 'list' && (
          <div className="p-0 overflow-x-auto">
            {gradeStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <p>No new applications found for {selectedGrade}.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-4 py-3 border-r border-slate-200 dark:border-slate-700/50">Form ID</th>
                    <th className="p-4 py-3 border-r border-slate-200 dark:border-slate-700/50">Student Name</th>
                    <th className="p-4 py-3 border-r border-slate-200 dark:border-slate-700/50">Student Status</th>
                    <th className="p-4 py-3 border-r border-slate-200 dark:border-slate-700/50">Date Submitted</th>
                    <th className="p-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {gradeStudents.map(student => {
                    const isNew = student.form_type === 'New Student';
                    return (
                    <tr key={student.id} className={`transition-colors ${isNew ? 'bg-green-50/70 hover:bg-green-100/70 dark:bg-green-900/10 dark:hover:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <td className={`p-4 font-black text-sm tracking-widest ${isNew ? 'text-green-600 dark:text-green-400' : 'text-brand-600 dark:text-brand-400'}`}>
                        #{String(student.id).padStart(3, '0')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white">{student.student_last_name}, {student.student_first_name}</div>
                      </td>
                      <td className={`p-4 text-xs font-bold ${isNew ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {student.form_type}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-500">
                        {student.date_submitted ? new Date(student.date_submitted).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}) : '08/29/2026'}
                      </td>
                      <td className="p-4 flex gap-3 justify-center items-center h-full pt-5">
                        <button 
                          onClick={() => handleEvaluateClick(student)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleArchiveClick(student)}
                          className="text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View 3: Application Evaluation View */}
        {view === 'evaluate' && selectedForm && (
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Applicant Details */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-black font-cinzel text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Applicant Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Full Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.student_first_name} {selectedForm.middle_name || ''} {selectedForm.student_last_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Grade Applied</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.grade_applying_for}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Birth Date</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.birth_date}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Contact</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.contact_number}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Previous Education</h3>
                  <div className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                    <p><span className="font-semibold">School:</span> {selectedForm.previous_school || 'N/A'}</p>
                    <p><span className="font-semibold">Repeated Grade:</span> {selectedForm.repeated_grade || 'None'}</p>
                    <p><span className="font-semibold">Expelled/Dismissed:</span> {selectedForm.expelled_dismissed || 'No'}</p>
                  </div>
                </div>

                {selectedForm.document_url && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-black font-cinzel text-slate-800 dark:text-white mb-2">Attached Documents</h3>
                    <a href={selectedForm.document_url} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 text-sm font-bold hover:underline flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      View Submitted Requirements
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Assessment Input */}
              <div>
                <form onSubmit={handleRecordAssessment} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-brand-200 dark:border-brand-900/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <h3 className="text-xl font-black font-cinzel text-brand-900 dark:text-brand-400 mb-6">Assessment Decision</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Status</label>
                      <select 
                        value={admissionStatus} 
                        onChange={e => setAdmissionStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Pending">Pending (Not taken yet)</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks / Notes</label>
                      <textarea 
                        value={admissionRemarks} 
                        onChange={e => setAdmissionRemarks(e.target.value)}
                        placeholder="Enter assessment scores, observations, or reasons for rejection..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px]"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white rounded-xl font-black tracking-widest text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      {loading ? 'SAVING...' : 'RECORD DECISION'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
