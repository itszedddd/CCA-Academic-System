import { useState, useRef } from 'react';

const API = '/api';

export default function EnrollmentOCR({ forms, fetchForms, uploading: parentUploading, fileInputRef: parentFileRef, handleFileUpload: parentHandleFileUpload, authFetch, currentRole, students }) {
  const [selectedForm, setSelectedForm] = useState(null);
  const [parsedData, setParsedData] = useState({});
  const [remarks, setRemarks] = useState('');
  const [requirements, setRequirements] = useState({
    req_birth_cert: 0,
    req_form_138: 0,
    req_good_moral: 0,
    req_pictures: 0,
  });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFirstName, setUploadFirstName] = useState('');
  const [uploadLastName, setUploadLastName] = useState('');
  const [uploadFormType, setUploadFormType] = useState('Pre-Registration Application');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const uploadFileRef = useRef(null);

  // Additional OCR state
  const [appendingOCR, setAppendingOCR] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const appendFileRef = useRef(null);

  const formTypes = [
    'Pre-Registration Application',
    'Birth Certificate (PSA)',
    'Form 138 (Report Card)',
    'Good Moral Certificate',
    'Student ID Photos',
    'Other Document'
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('student_first_name', uploadFirstName.trim());
      fd.append('student_last_name', uploadLastName.trim());
      fd.append('form_type', uploadFormType);
      fd.append('file', uploadFile);
      const res = await authFetch(`${API}/enrollment_forms/`, { method: 'POST', body: fd });
      if (res?.ok) {
        fetchForms();
        setShowUploadModal(false);
        setUploadFirstName('');
        setUploadLastName('');
        setUploadFormType('Pre-Registration Application');
        setUploadFile(null);
        setDuplicateWarning('');
      }
    } finally {
      setUploading(false);
    }
  };

  // Check for duplicates when student name and form type are set
  const checkDuplicate = async () => {
    if (!uploadFirstName.trim() || !uploadLastName.trim()) return;
    // Check if student already exists
    const existingStudent = (students || []).find(
      s => s.first_name?.toLowerCase() === uploadFirstName.trim().toLowerCase() && 
           s.last_name?.toLowerCase() === uploadLastName.trim().toLowerCase()
    );
    if (existingStudent) {
      // Check if they already have this form type
      const existingForm = forms.find(
        f => f.student_id === existingStudent.id && f.form_type === uploadFormType
      );
      if (existingForm) {
        setDuplicateWarning(`⚠️ "${uploadFormType}" already exists for ${uploadFirstName} ${uploadLastName} (DOC-${String(existingForm.id).padStart(4,'0')}). Uploading will create a new entry.`);
        return;
      }
    }
    setDuplicateWarning('');
  };

  const handleDecision = async (id, status) => {
    let first = '';
    let last = '';
    if (parsedData.studentName) {
      const parts = parsedData.studentName.split(' ');
      first = parts[0];
      last = parts.slice(1).join(' ');
    }
    await authFetch(`${API}/enrollment_forms/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        remarks,
        student_first_name: first,
        student_last_name: last,
        student_dob: parsedData.birthDate,
        req_birth_cert: requirements.req_birth_cert,
        req_form_138: requirements.req_form_138,
        req_good_moral: requirements.req_good_moral,
        req_pictures: requirements.req_pictures
      })
    });
    setSelectedForm(null);
    fetchForms();
  };

  const parseOCR = (text) => {
    if (!text) return {};
    
    // Smart extract: tries multiple regex patterns per field
    const extract = (...regexes) => {
      for (const regex of regexes) {
        const match = text.match(regex);
        if (match && match[1] && match[1].trim() && !match[1].includes('PUT') && !match[1].includes('HERE')) {
          return match[1].trim();
        }
      }
      return '';
    };

    // Handle multiple document types
    const isBirthCert = /certificate of live birth/i.test(text) || /civil registrar/i.test(text);
    
    if (isBirthCert) {
      // Birth Certificate parsing — specifically for PSA format
      // Child's name is usually between 'Registry No.' and 'Date of Birth'
      const childName = (() => {
        // Look for the block between Registry number and the date of birth/sex line
        const sectionMatch = text.match(/Registry No\.:.*?\n\n?([\s\S]*?)\n\n?Date of Birth/i);
        if (sectionMatch && sectionMatch[1]) {
          const lines = sectionMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 3);
          if (lines.length > 0) return lines[0];
        }
        // Fallback: Registry line relative
        const m1 = text.match(/Registry No\..*?\n\n?([A-Z\s]{4,})/i);
        if (m1 && m1[1] && !m1[1].includes('Date') && !m1[1].includes('PARENT')) return m1[1].trim();
        return '';
      })();
      return {
        studentName: childName,
        sex: extract(/Sex:\s*(Male|Female)/i, /Sex:\s*(.*?)(?:\n|$)/i),
        birthDate: extract(/Date of Birth:\s*(.*?)(?:\s+Sex|\n|$)/i),
        birthPlace: extract(/Birth:\s*(.*?)(?:\s+Nationality|\n|$)/i, /Birth Place:\s*(.*?)(?:\n|$)/i),
        homeAddress: '', // Birth certs usually don't have current home address
        fatherName: extract(/Father['’]s\s*Name:\s*(.*?)(?:\s+Father|Nationality|\n|$)/i),
        fatherEmployer: '',
        fatherOccupation: '',
        fatherContact: '',
        churchAttended: '',
        member: '',
        pastor: '',
        repeated: '',
        expelled: '',
        disabilities: '',
        talents: '',
        hear: '',
        reason: '',
      };
    }

    // Standard enrollment form parsing (improved)
    return {
      studentName: extract(
        /Student Name:\s*(.*?)(?:\n|Sex:|Birth)/i,
        /Student\s*Name\s*[:\-]\s*(.*?)(?:\n|Sex)/i
      ),
      sex: extract(
        /Sex:\s*(.*?)(?:\n|Home|Birth|$)/i,
        /Sex\s*[:\-]\s*(Male|Female)/i
      ),
      birthDate: extract(
        /Birth Date:\s*(.*?)(?:\n|Home|Birth Place|$)/i,
        /Date of Birth:\s*(.*?)(?:\n|Sex|$)/i
      ),
      birthPlace: extract(
        /Birth Place:\s*(.*?)(?:\n|Birth Date|Family|$)/i,
        /Place of Birth:\s*(.*?)(?:\n|$)/i
      ),
      homeAddress: extract(
        /Home Address:\s*(.*?)(?:\n|Birth Place|Family|$)/i,
        /Address:\s*(.*?)(?:\n|$)/i
      ),
      fatherName: extract(
        /Father['']?s Name:\s*(.*?)(?:\n|Employer|Mother|Occupation|$)/i,
        /Father.*?Name:\s*(.*?)(?:\n|$)/i
      ),
      fatherEmployer: extract(/Employer:\s*(.*?)(?:\n|Occupation|Contact|$)/i),
      fatherOccupation: extract(/Occupation:\s*(.*?)(?:\n|Contact|$)/i),
      fatherContact: extract(/Contact Number:\s*(.*?)(?:\n|Mother|$)/i),
      churchAttended: extract(/Church Attended:\s*(.*?)(?:\n|Member|$)/i),
      member: extract(/Member of Church\?:\s*(.*?)(?:\n|Pastor|$)/i),
      pastor: extract(/Pastor Name:\s*(.*?)(?:\n|Academic|$)/i),
      repeated: extract(/repeated any grade\?.*?\n\s*(.*?)(?:\n|Has the student)/i),
      expelled: extract(/expelled, dismissed.*?\n\s*(.*?)(?:\n|Does the student)/i),
      disabilities: extract(/learning disabilities\?\n\s*(.*?)(?:\n|What special)/i),
      talents: extract(/abilities or talents.*?\n\s*(.*?)(?:\n|General)/i),
      hear: extract(/How did you hear.*?\n\s*(.*?)(?:\n|What is your reason)/i),
      reason: extract(/reason selecting this school\?.*?\n\s*(.*?)(?:\n|I hereby)/i),
    };
  };

  const openForm = (form) => {
    const parsed = parseOCR(form.extracted_text || '');
    setParsedData(parsed);
    setRemarks(form.remarks || '');
    setRequirements({ req_birth_cert: 0, req_form_138: 0, req_good_moral: 0, req_pictures: 0 });
    setShowImage(false);
    setSelectedForm(form);
  };

  const handleChange = (field, val) => {
    setParsedData(prev => ({ ...prev, [field]: val }));
  };

  // Handle additional OCR upload and merge
  const handleAppendOCR = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedForm) return;
    setAppendingOCR(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await authFetch(`${API}/enrollment_forms/${selectedForm.id}/append_ocr`, { method: 'POST', body: fd });
      if (res?.ok) {
        const data = await res.json();
        // Re-parse the combined text
        const newParsed = parseOCR(data.extracted_text);
        // Merge: only fill empty fields
        setParsedData(prev => {
          const merged = { ...prev };
          for (const key of Object.keys(newParsed)) {
            if ((!merged[key] || merged[key].trim() === '') && newParsed[key] && newParsed[key].trim() !== '') {
              merged[key] = newParsed[key];
            }
          }
          return merged;
        });
        // Update the selected form's extracted text locally
        setSelectedForm(prev => ({ ...prev, extracted_text: data.extracted_text }));
        fetchForms();
      }
    } finally {
      setAppendingOCR(false);
      if (appendFileRef.current) appendFileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">{currentRole === 'Registrar' ? 'Enrollment Status Board' : 'OCR Extraction Engine'}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{currentRole === 'Registrar' ? 'Monitor approved and pending student enrollment forms from Admission.' : 'Upload physical enrollment forms — AI extracts and indexes the text automatically.'}</p>
        </div>
        <div>
          {currentRole === 'Admission' && (
            <button onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm flex items-center text-sm transition hover:bg-brand-700">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload Form
            </button>
          )}
        </div>
      </div>

      {/* Registrar Notification Banner */}
      {currentRole === 'Registrar' && (() => {
        const approvedCount = forms.filter(f => f.status === 'Success').length;
        const holdCount = forms.filter(f => f.status === 'Hold').length;
        if (approvedCount === 0 && holdCount === 0) return null;
        return (
          <div className="mx-4 md:mx-6 mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                {approvedCount > 0 && <span className="mr-3">✅ {approvedCount} student{approvedCount > 1 ? 's' : ''} approved by Admission</span>}
                {holdCount > 0 && <span className="text-amber-700 dark:text-amber-400">⏳ {holdCount} on hold (incomplete requirements)</span>}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Assign approved students to a section via the Student Directory.</p>
            </div>
          </div>
        );
      })()}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700">
              <th className="px-6 py-3">Form ID</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Extracted Preview</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {forms.map(f => {
              const linkedStudent = (students || []).find(s => s.id === f.student_id);
              return (
                <tr key={f.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">DOC-{String(f.id).padStart(4,'0')}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {linkedStudent ? `${linkedStudent.first_name} ${linkedStudent.last_name}` : <span className="text-slate-400 italic">Unlinked</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{f.form_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      f.status === 'Success' ? 'bg-green-100 text-green-700' : 
                      f.status === 'Hold' ? 'bg-orange-100 text-orange-700' :
                      f.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{f.extracted_text || 'No text extracted.'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button onClick={() => openForm(f)} className="text-brand-600 hover:text-brand-800 transition">View Details</button>
                  </td>
                </tr>
              );
            })}
            {forms.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{currentRole === 'Registrar' ? 'No enrollment forms submitted yet.' : 'No forms uploaded yet. Click "Upload Form" to begin.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ============ UPLOAD MODAL ============ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#022868] dark:text-white font-cinzel tracking-wider">Upload Enrollment Form</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter student details before uploading the document for OCR processing.</p>
              </div>
              <button onClick={() => { setShowUploadModal(false); setDuplicateWarning(''); }} className="text-slate-400 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">First Name *</label>
                  <input required value={uploadFirstName} onChange={e => setUploadFirstName(e.target.value)} onBlur={checkDuplicate}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-medium" placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Last Name *</label>
                  <input required value={uploadLastName} onChange={e => setUploadLastName(e.target.value)} onBlur={checkDuplicate}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-medium" placeholder="Dela Cruz" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Form Type *</label>
                <select value={uploadFormType} onChange={e => { setUploadFormType(e.target.value); setTimeout(checkDuplicate, 100); }}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-semibold">
                  {formTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Document Image *</label>
                <input required type="file" accept="image/*" ref={uploadFileRef} onChange={e => setUploadFile(e.target.files[0])}
                  className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-slate-600 dark:file:text-white" />
              </div>

              {duplicateWarning && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowUploadModal(false); setDuplicateWarning(''); }} className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" disabled={uploading} className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition disabled:opacity-50 flex items-center">
                  {uploading ? (
                    <><svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing OCR…</>
                  ) : (
                    <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Upload &amp; Scan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VIEW DETAILS MODAL ============ */}
      {selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-[#022868] font-cinzel tracking-wider">Document Review: DOC-{String(selectedForm.id).padStart(4,'0')}</h2>
                <p className="text-xs text-slate-500">Please review the auto-extracted fields and correct any OCR misinterpretations.</p>
              </div>
              <button onClick={() => setSelectedForm(null)} className="text-slate-400 hover:text-red-500 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Scrollable Content - Paper Recreation */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
              <div className="bg-white shadow border border-slate-200 w-full max-w-3xl p-10 font-sans text-slate-800">
                
                {/* Visual Form Header */}
                <div className="flex flex-col items-center mb-8 border-b-2 border-[#022868] pb-6">
                  <div className="bg-[#022868] rounded-xl p-4 mb-3">
                    <img src="/login-logo.png" alt="CCA" className="h-16 object-contain drop-shadow-sm" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#022868] tracking-widest uppercase font-cinzel">Student Information</h1>
                  <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">{selectedForm.form_type}</p>
                </div>

                {/* View Uploaded Image Toggle */}
                <div className="mb-6">
                  <button onClick={() => setShowImage(!showImage)} className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {showImage ? 'Hide Uploaded Document' : 'View Uploaded Document'}
                  </button>
                  {showImage && (() => {
                    // Extract filename from full path stored in DB
                    const fp = selectedForm.file_path || '';
                    const fileName = fp.includes('/') ? fp.split('/').pop() : fp.includes('\\') ? fp.split('\\').pop() : fp;
                    const imgUrl = `/uploads/${fileName}`;
                    return (
                    <div className="mt-3 border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50">
                      <img src={imgUrl} alt="Uploaded Form" className="w-full rounded-lg shadow-sm" onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML = '<p class=\"text-sm text-slate-500 text-center py-8\">Image not available. This is mock data — upload a real form to see the preview.</p>'; }} />
                    </div>
                    );
                  })()}
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                  
                  {/* STUDENT */}
                  <div>
                    <div className="bg-[#022868] text-white px-3 py-1 font-bold tracking-widest text-sm uppercase mb-3">Student</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                        <input type="text" value={parsedData.studentName} onChange={e => handleChange('studentName', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NAME ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Sex</span>
                        <input type="text" value={parsedData.sex} onChange={e => handleChange('sex', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ SEX ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Birth Date</span>
                        <input type="text" value={parsedData.birthDate} onChange={e => handleChange('birthDate', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ DATE ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Home Address</span>
                        <input type="text" value={parsedData.homeAddress} onChange={e => handleChange('homeAddress', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ADDRESS ]" />
                      </div>
                      <div className="col-span-2 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Birth Place</span>
                        <input type="text" value={parsedData.birthPlace} onChange={e => handleChange('birthPlace', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ PLACE ]" />
                      </div>
                    </div>
                  </div>

                  {/* FAMILY INFORMATION */}
                  <div>
                    <div className="bg-[#022868] text-white px-3 py-1 font-bold tracking-widest text-sm uppercase mb-3">Family Information</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Father's Name</span>
                        <input type="text" value={parsedData.fatherName} onChange={e => handleChange('fatherName', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NAME ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Mother's Name</span>
                        <input type="text" className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NAME ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Father's Employer</span>
                        <input type="text" value={parsedData.fatherEmployer} onChange={e => handleChange('fatherEmployer', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ EMPLOYER ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Mother's Employer</span>
                        <input type="text" className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ EMPLOYER ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Father's Occupation</span>
                        <input type="text" value={parsedData.fatherOccupation} onChange={e => handleChange('fatherOccupation', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ OCCUPATION ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Mother's Occupation</span>
                        <input type="text" className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ OCCUPATION ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Father's Contact</span>
                        <input type="text" value={parsedData.fatherContact} onChange={e => handleChange('fatherContact', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NUMBER ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Mother's Contact</span>
                        <input type="text" className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NUMBER ]" />
                      </div>
                    </div>
                  </div>

                  {/* CHURCH */}
                  <div>
                    <div className="bg-[#022868] text-white px-3 py-1 font-bold tracking-widest text-sm uppercase mb-3">Church</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                      <div className="col-span-2 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Church Attended</span>
                        <input type="text" value={parsedData.churchAttended} onChange={e => handleChange('churchAttended', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ CHURCH NAME ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Member Status</span>
                        <input type="text" value={parsedData.member} onChange={e => handleChange('member', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ Y / N ]" />
                      </div>
                      <div className="col-span-1 flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Pastor Name</span>
                        <input type="text" value={parsedData.pastor} onChange={e => handleChange('pastor', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ NAME ]" />
                      </div>
                    </div>
                  </div>

                  {/* ACADEMIC */}
                  <div>
                    <div className="bg-[#022868] text-white px-3 py-1 font-bold tracking-widest text-sm uppercase mb-3">Academic</div>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Has the child ever repeated any grade? If so, what grade and reason?</span>
                        <input type="text" value={parsedData.repeated} onChange={e => handleChange('repeated', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Has the student ever been expelled, dismissed, suspended, or refused admission?</span>
                        <input type="text" value={parsedData.expelled} onChange={e => handleChange('expelled', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Does the student have any learning disabilities?</span>
                        <input type="text" value={parsedData.disabilities} onChange={e => handleChange('disabilities', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">What special abilities or talents does the student have?</span>
                        <input type="text" value={parsedData.talents} onChange={e => handleChange('talents', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                    </div>
                  </div>

                  {/* GENERAL */}
                  <div>
                    <div className="bg-[#022868] text-white px-3 py-1 font-bold tracking-widest text-sm uppercase mb-3">General</div>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">How did you hear about the school?</span>
                        <input type="text" value={parsedData.hear} onChange={e => handleChange('hear', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                      <div className="flex flex-col border-b border-slate-200 pb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">What is your reason for selecting this school?</span>
                        <input type="text" value={parsedData.reason} onChange={e => handleChange('reason', e.target.value)} className="w-full outline-none py-1 text-slate-800 font-bold bg-transparent" placeholder="[ ANSWER ]" />
                      </div>
                    </div>

                    {/* REQUIREMENTS CHECKLIST */}
                    {currentRole === 'Admission' && selectedForm.status !== 'Success' && (
                      <div className="mt-8 border-2 border-amber-300 bg-amber-50/50 p-6 shadow-sm">
                        <div className="text-[#022868] font-bold tracking-widest text-lg uppercase mb-4 flex items-center gap-2 border-b-2 border-amber-300 pb-2">
                          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Admission Requirements Checklist
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 text-[#022868] rounded border-slate-300 focus:ring-[#022868]" checked={!!requirements.req_birth_cert} onChange={(e) => setRequirements(r => ({...r, req_birth_cert: e.target.checked ? 1 : 0}))} />
                            <span className="group-hover:text-amber-700 transition">Original PSA Birth Certificate</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 text-[#022868] rounded border-slate-300 focus:ring-[#022868]" checked={!!requirements.req_form_138} onChange={(e) => setRequirements(r => ({...r, req_form_138: e.target.checked ? 1 : 0}))} />
                            <span className="group-hover:text-amber-700 transition">Form 138 (Original Report Card)</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 text-[#022868] rounded border-slate-300 focus:ring-[#022868]" checked={!!requirements.req_good_moral} onChange={(e) => setRequirements(r => ({...r, req_good_moral: e.target.checked ? 1 : 0}))} />
                            <span className="group-hover:text-amber-700 transition">Certificate of Good Moral Character</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 text-[#022868] rounded border-slate-300 focus:ring-[#022868]" checked={!!requirements.req_pictures} onChange={(e) => setRequirements(r => ({...r, req_pictures: e.target.checked ? 1 : 0}))} />
                            <span className="group-hover:text-amber-700 transition">2x2 ID Pictures (2 copies)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-center text-slate-500 mt-10">
                      I hereby certify that above information given are true and correct to the best of my knowledge and I allow the Calvary Christian Academy,
                      Inc. and Department of Education to use my child's details for enrollment. The information herein shall be treated as confidential in
                      compliance with Data Privacy Act of 2012.
                    </div>
                    
                    <div className="flex justify-between items-end mt-12 px-10">
                      <div className="w-64 border-t-2 border-slate-800 text-center pt-1 font-bold text-xs">
                        SIGNATURE OF FATHER/MOTHER<br/><span className="text-[10px] font-normal text-slate-600">Signature over printed name</span>
                      </div>
                      <div className="w-32 border-t-2 border-slate-800 text-center pt-1 font-bold text-xs uppercase tracking-widest">
                        DATE
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer / Action Bar */}
            {currentRole === 'Admission' && selectedForm.status !== 'Success' && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col gap-3">
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  placeholder="Admission Remarks (Optional)"
                  className="w-full text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded pb-1 focus:outline-none focus:border-brand-500 transition-colors p-2 placeholder-slate-400"
                />
                <div className="flex justify-between items-center">
                  {/* Upload Additional Document */}
                  <div>
                    <input type="file" ref={appendFileRef} onChange={handleAppendOCR} className="hidden" accept="image/*" />
                    <button onClick={() => appendFileRef.current?.click()} disabled={appendingOCR}
                      className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition rounded-lg text-sm font-bold flex items-center disabled:opacity-50">
                      {appendingOCR ? (
                        <><svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Scanning...</>
                      ) : (
                        <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Upload Additional Document</>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleDecision(selectedForm.id, 'Rejected')} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition rounded-lg text-sm font-bold tracking-widest uppercase">Reject</button>
                    
                    {requirements.req_birth_cert && requirements.req_form_138 && requirements.req_good_moral && requirements.req_pictures ? (
                      <button onClick={() => handleDecision(selectedForm.id, 'Success')} className="px-4 py-2 bg-[#022868] hover:bg-brand-800 text-white transition rounded-lg flex items-center text-sm font-bold tracking-widest uppercase shadow-md">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Approve & Verify
                      </button>
                    ) : (
                      <button onClick={() => handleDecision(selectedForm.id, 'Hold')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white transition rounded-lg flex items-center text-sm font-bold tracking-widest uppercase shadow-md">
                        Put on Hold (Incomplete)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* View Only Actions */}
            {(currentRole !== 'Admission' || selectedForm.status === 'Success') && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition">
                  Close
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
