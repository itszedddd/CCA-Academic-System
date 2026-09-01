import React, { useState } from 'react';
import PrintableAdmissionForm from '../components/PrintableAdmissionForm';

const API = '/api';

export default function NewStudents({ forms, fetchForms, authFetch, currentRole }) {
  // Page 1: Grade Selection, Page 2: Student List, Page 3: Evaluation View
  const [view, setView] = useState('grades'); // 'grades', 'list', 'evaluate'
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [admissionStatus, setAdmissionStatus] = useState('Passed');
  const [interviewStatus, setInterviewStatus] = useState('Pending');
  const [requirements, setRequirements] = useState({ req_birth_cert: 0, req_form_138: 0, req_good_moral: 0, req_pictures: 0, req_hard_copy: 0 });
  const [admissionRemarks, setAdmissionRemarks] = useState('');
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', title: 'Notice' });
  
  const [enrollmentStatus, setEnrollmentStatus] = useState('Success');
  const [enrollmentRemarks, setEnrollmentRemarks] = useState('');

  const [formToArchive, setFormToArchive] = useState(null);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const gradeLevels = [
    'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 
    'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 
    'Grade 9', 'Grade 10'
  ];

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setView('list');
  };

  const handleEvaluateClick = (form) => {
    setSelectedForm(form);
    setAdmissionStatus(form.assessment_status === 'Passed' ? 'Passed' : form.assessment_status === 'Failed' ? 'Failed' : 'Pending');
    setInterviewStatus(form.interview_status === 'Passed' ? 'Passed' : form.interview_status === 'Failed' ? 'Failed' : 'Pending');
    setRequirements({
      req_birth_cert: form.req_birth_cert || 0,
      req_form_138: form.req_form_138 || 0,
      req_good_moral: form.req_good_moral || 0,
      req_pictures: form.req_pictures || 0,
      req_hard_copy: form.req_hard_copy || 0
    });
    setAdmissionRemarks(form.remarks || '');
    setView('evaluate');
  };

  const handleArchiveClick = (form) => {
    if (loading) return;
    setFormToArchive(form);
  };

  const confirmArchive = async () => {
    if (loading || !formToArchive) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/${formToArchive.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Archived', 
          remarks: 'Archived by Admission',
          req_birth_cert: 0, req_form_138: 0, req_good_moral: 0, req_pictures: 0
        })
      });
      if (res?.ok) {
        fetchForms();
        setFormToArchive(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditFormClick = () => {
    setEditFormData({
      student_first_name: selectedForm.student_first_name || '',
      student_last_name: selectedForm.student_last_name || '',
      middle_name: selectedForm.middle_name || '',
      sex: selectedForm.sex || '',
      birth_date: selectedForm.birth_date || '',
      home_address: selectedForm.home_address || '',
      contact_number: selectedForm.contact_number || '',
    });
    setIsEditingForm(true);
  };
  
  const saveFormEdits = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/${selectedForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res?.ok) {
        const updatedForm = await res.json();
        setSelectedForm(updatedForm);
        fetchForms();
        setIsEditingForm(false);
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
      await authFetch(`${API}/enrollment_forms/${selectedForm.id}/assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: admissionStatus, remarks: admissionRemarks })
      });
      await authFetch(`${API}/enrollment_forms/${selectedForm.id}/interview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: interviewStatus, remarks: admissionRemarks })
      });
      await authFetch(`${API}/enrollment_forms/${selectedForm.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedForm.status || 'Needs Review',
          remarks: selectedForm.remarks || '',
          ...requirements
        })
      });
      fetchForms();
      setView('list');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/${selectedForm.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: enrollmentStatus, 
          remarks: enrollmentRemarks,
          req_birth_cert: 1, req_form_138: 1, req_good_moral: 1, req_pictures: 1
        })
      });
      if (res?.ok) {
        fetchForms();
        setView('list');
      } else {
        setAlertModal({ isOpen: true, message: 'Failed to enroll student. Please check if the assessment is passed.', title: 'Enrollment Error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Pre-registered students for the selected grade
  const gradeStudents = forms.filter(f => {
    if (f.grade_applying_for !== selectedGrade || ['Enrolled', 'Archived'].includes(f.status)) return false;
    if (currentRole === 'Registrar') return f.assessment_status === 'Passed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-8 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10 group">
            <h2 className="text-2xl font-black font-cinzel text-brand-900 dark:text-brand-400 group-hover:text-blue-600 transition-colors tracking-widest uppercase mb-1 flex items-center">
              <svg className="w-7 h-7 mr-3 text-brand-600 dark:text-brand-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
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
                const pendingCount = forms.filter(f => f.grade_applying_for === grade && !['Enrolled', 'Archived'].includes(f.status) && f.assessment_status !== 'Passed').length;
                const acceptedCount = forms.filter(f => f.grade_applying_for === grade && !['Enrolled', 'Archived'].includes(f.status) && f.assessment_status === 'Passed').length;
                
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
                      {grade.replace('Grade ', 'G').replace('Kinder', 'K')}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{grade}</h3>
                    <div className="mt-auto flex flex-col gap-1 w-full mt-2">
                      {currentRole !== 'Registrar' && (
                        <span className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pendingCount > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                          {pendingCount} Pending
                        </span>
                      )}
                      <span className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${acceptedCount > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'}`}>
                        {acceptedCount} Accepted
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
                        <div className="font-bold text-slate-800 dark:text-white">
                          {student.student?.last_name || 'Unknown'}, {student.student?.first_name || 'Unknown'}
                        </div>
                      </td>
                      <td className={`p-4 text-xs font-bold ${
                        student.assessment_status === 'Passed' ? 'text-green-600 dark:text-green-400' :
                        student.assessment_status === 'Failed' ? 'text-red-600 dark:text-red-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        {student.assessment_status === 'Passed' ? 'Accepted' : student.assessment_status === 'Failed' ? 'Rejected' : 'Pending'}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-500">
                        {student.date_submitted ? (() => { const d = student.date_submitted.split('T')[0].split('-'); return `${d[1]}/${d[2]}/${d[0]}`; })() : '08/29/2026'}
                      </td>
                      <td className="p-4 flex flex-col sm:flex-row gap-3 justify-center items-center h-full pt-5">
                        <button type="button"
                          onClick={() => handleEvaluateClick(student)}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-brand-500 hover:text-white px-4 py-2 rounded-lg text-brand-700 dark:text-brand-300 transition-colors w-full sm:w-auto"
                        >
                          View
                        </button>
                        <button type="button"
                          onClick={() => handleArchiveClick(student)}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 transition-colors w-full sm:w-auto"
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
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                    <h3 className="text-lg font-black font-cinzel text-slate-800 dark:text-white">Applicant Information</h3>
                    <div className="flex gap-2">
                      <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-brand-700 font-bold text-xs rounded-lg shadow-sm border border-slate-200 flex items-center transition">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print / Download PDF
                      </button>
                      <button onClick={handleEditFormClick} className="text-xs font-bold bg-brand-100 text-brand-700 hover:bg-brand-200 px-3 py-1.5 rounded-lg transition-colors">
                        Edit Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Full Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.student?.first_name || selectedForm.student_first_name} {selectedForm.student?.middle_name || selectedForm.middle_name || ''} {selectedForm.student?.last_name || selectedForm.student_last_name}</p>
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
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Sex</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.sex || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Address</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.home_address || 'N/A'}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Family Background</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Father's Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.father_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Father's Contact</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.father_contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Mother's Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.mother_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Mother's Contact</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.mother_contact || 'N/A'}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Previous Education</h3>
                  <div className="text-sm space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                    <p><span className="font-semibold">School:</span> {selectedForm.previous_school || 'N/A'}</p>
                  </div>

                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Medical Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Medical Conditions</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.medical_conditions || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Allergies</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.allergies || 'None'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Current Medications</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.current_medications || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Physician Name</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.physician_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Physician Contact</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedForm.physician_contact || 'N/A'}</p>
                    </div>
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

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-black font-cinzel text-slate-800 dark:text-white mb-4">Requirements Checklist</h3>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input type="checkbox" className="mr-3 w-4 h-4 text-brand-600 rounded" checked={requirements.req_birth_cert === 1} onChange={e => setRequirements({...requirements, req_birth_cert: e.target.checked?1:0})} /> Birth Certificate (PSA)
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input type="checkbox" className="mr-3 w-4 h-4 text-brand-600 rounded" checked={requirements.req_form_138 === 1} onChange={e => setRequirements({...requirements, req_form_138: e.target.checked?1:0})} /> Form 138 (Report Card)
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input type="checkbox" className="mr-3 w-4 h-4 text-brand-600 rounded" checked={requirements.req_good_moral === 1} onChange={e => setRequirements({...requirements, req_good_moral: e.target.checked?1:0})} /> Good Moral Certificate
                    </label>
                    <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      <input type="checkbox" className="mr-3 w-4 h-4 text-brand-600 rounded" checked={requirements.req_pictures === 1} onChange={e => setRequirements({...requirements, req_pictures: e.target.checked?1:0})} /> 2x2 ID Pictures
                    </label>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2">
                      <label className="flex items-center text-sm font-bold text-slate-800 dark:text-slate-200">
                        <input type="checkbox" className="mr-3 w-4 h-4 text-green-600 rounded" checked={requirements.req_hard_copy === 1} onChange={e => setRequirements({...requirements, req_hard_copy: e.target.checked?1:0})} /> Received & Signed Hard Copy
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Assessment/Enrollment Input */}
              <div>
                {currentRole === 'Admission' || currentRole === 'Principal' ? (
                  <form onSubmit={handleRecordAssessment} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-brand-200 dark:border-brand-900/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                    <h3 className="text-xl font-black font-cinzel text-brand-900 dark:text-brand-400 mb-6">Assessment Decision</h3>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Test</label>
                          <select 
                            value={admissionStatus} 
                            onChange={e => setAdmissionStatus(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Passed">Passed (Accept)</option>
                            <option value="Failed">Failed (Reject)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interview Status</label>
                          <select 
                            value={interviewStatus} 
                            onChange={e => setInterviewStatus(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Passed">Passed (Accept)</option>
                            <option value="Failed">Failed (Reject)</option>
                          </select>
                        </div>
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
                ) : (
                  <form onSubmit={handleEnrollStudent} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-green-200 dark:border-green-900/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h3 className="text-xl font-black font-cinzel text-green-700 dark:text-green-400 mb-6">Final Enrollment</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      This student has passed the admission assessment. You can now enroll them to automatically assign their section and generate their tuition balance.
                    </p>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enrollment Status</label>
                        <select 
                          value={enrollmentStatus} 
                          onChange={e => setEnrollmentStatus(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Success">Enroll (Success)</option>
                          <option value="Approved Incomplete">Approved Incomplete Req</option>
                          <option value="Hold">Hold</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks</label>
                        <textarea 
                          value={enrollmentRemarks} 
                          onChange={e => setEnrollmentRemarks(e.target.value)}
                          placeholder="Any final notes..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl font-black tracking-widest text-sm shadow-md transition-all disabled:opacity-50"
                      >
                        {loading ? 'ENROLLING...' : 'ENROLL STUDENT'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}
      {formToArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Archive Application?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Are you sure you want to archive the enrollment application for <strong className="text-slate-700 dark:text-slate-300">{formToArchive.student_first_name} {formToArchive.student_last_name}</strong>? They will be moved to the Archive list.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setFormToArchive(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button onClick={confirmArchive} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center">
                {loading ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold font-cinzel text-slate-800 dark:text-white">Edit Applicant Details</h3>
              <button onClick={() => setIsEditingForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
                  <input type="text" value={editFormData.student_first_name} onChange={e => setEditFormData({...editFormData, student_first_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
                  <input type="text" value={editFormData.student_last_name} onChange={e => setEditFormData({...editFormData, student_last_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Middle Name</label>
                  <input type="text" value={editFormData.middle_name} onChange={e => setEditFormData({...editFormData, middle_name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Sex</label>
                  <select value={editFormData.sex} onChange={e => setEditFormData({...editFormData, sex: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Birth Date</label>
                  <input type="date" value={editFormData.birth_date} onChange={e => setEditFormData({...editFormData, birth_date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contact Number</label>
                  <input type="text" value={editFormData.contact_number} onChange={e => setEditFormData({...editFormData, contact_number: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Home Address</label>
                  <textarea value={editFormData.home_address} onChange={e => setEditFormData({...editFormData, home_address: e.target.value})} rows="2" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-brand-500 dark:text-white"></textarea>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setIsEditingForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button onClick={saveFormEdits} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{alertModal.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{alertModal.message}</p>
              <button onClick={() => setAlertModal({ ...alertModal, isOpen: false })} className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {view === 'evaluate' && selectedForm && (
        <PrintableAdmissionForm formData={selectedForm} />
      )}
    </div>
  );
}
