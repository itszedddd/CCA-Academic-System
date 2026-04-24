import React, { useState, useEffect } from 'react';

const API = '/api';

export default function EnrollmentOCR({ forms, fetchForms, authFetch, currentRole, students }) {
  const [activeTab, setActiveTab] = useState(currentRole === 'Registrar' ? 'Verify' : 'Encode');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Encode Form State
  const [encodeData, setEncodeData] = useState({
    student_first_name: '', student_last_name: '', form_type: 'Pre-Registration Application', grade_applying_for: 'Pre-Kinder',
    sex: '', birth_date: '', birth_place: '', home_address: '',
    father_name: '', father_contact: '', father_occupation: '', father_employer: '',
    mother_name: '', mother_contact: '', mother_occupation: '', mother_employer: '',
    church_attended: '', church_member: '', pastor_name: '',
    previous_school: '', repeated_grade: '', expelled_dismissed: '', learning_disabilities: '', special_talents: '',
    how_heard: '', reason_selecting: ''
  });
  const [documentFile, setDocumentFile] = useState(null);

  // Auto-fill trigger
  useEffect(() => {
    if (encodeData.student_first_name.length > 2 && encodeData.student_last_name.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await authFetch(`${API}/students/lookup?first_name=${encodeData.student_first_name}&last_name=${encodeData.student_last_name}`);
          if (res?.ok) {
            const data = await res.json();
            if (data.found) {
              setEncodeData(prev => ({ ...prev, grade_applying_for: data.grade_level }));
              setSuccessMsg(`Auto-filled existing student: ${data.first_name} ${data.last_name}`);
              setTimeout(() => setSuccessMsg(''), 3000);
            }
          }
        } catch (e) {}
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [encodeData.student_first_name, encodeData.student_last_name, authFetch]);

  const handleEncodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await authFetch(`${API}/enrollment_forms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encodeData)
      });
      
      if (res?.ok) {
        const createdForm = await res.json();
        
        if (documentFile) {
          const fd = new FormData();
          fd.append('file', documentFile);
          await authFetch(`${API}/enrollment_forms/${createdForm.id}/upload_document`, { method: 'POST', body: fd });
        }
        
        setSuccessMsg('Digital Enrollment Form successfully encoded!');
        setEncodeData({
          student_first_name: '', student_last_name: '', form_type: 'Pre-Registration Application', grade_applying_for: 'Pre-Kinder',
          sex: '', birth_date: '', birth_place: '', home_address: '',
          father_name: '', father_contact: '', father_occupation: '', father_employer: '',
          mother_name: '', mother_contact: '', mother_occupation: '', mother_employer: '',
          church_attended: '', church_member: '', pastor_name: '',
          previous_school: '', repeated_grade: '', expelled_dismissed: '', learning_disabilities: '', special_talents: '',
          how_heard: '', reason_selecting: ''
        });
        setDocumentFile(null);
        fetchForms();
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.detail || 'Failed to submit form.');
      }
    } catch (err) {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Form State
  const [selectedForm, setSelectedForm] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [requirements, setRequirements] = useState({ req_birth_cert: 0, req_form_138: 0, req_good_moral: 0, req_pictures: 0 });

  const handleVerify = async (status) => {
    setLoading(true);
    try {
      const payload = {
        status, remarks,
        student_first_name: selectedForm.student_first_name || '',
        student_last_name: selectedForm.student_last_name || '',
        student_dob: selectedForm.birth_date || 'cca2026',
        ...requirements
      };
      
      const res = await authFetch(`${API}/enrollment_forms/${selectedForm.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res?.ok) {
        setSelectedForm(null);
        fetchForms();
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700';
      case 'Needs Review': return 'bg-yellow-100 text-yellow-700';
      case 'Hold': return 'bg-orange-100 text-orange-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const InputField = ({ label, field, type="text", required=false }) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label} {required && '*'}</label>
      <input type={type} required={required} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-brand-500" value={encodeData[field] || ''} onChange={e => setEncodeData({...encodeData, [field]: e.target.value})} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold font-cinzel text-slate-800 dark:text-white">Digital Enrollment System</h3>
            <p className="text-sm text-slate-500">Structured data encoding and verification.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
            {['Admission', 'Principal'].includes(currentRole) && (
              <button onClick={() => setActiveTab('Encode')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'Encode' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>Encode Form</button>
            )}
            {['Registrar', 'Principal'].includes(currentRole) && (
              <button onClick={() => setActiveTab('Verify')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${activeTab === 'Verify' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>Verify Records</button>
            )}
          </div>
        </div>

        {activeTab === 'Encode' && (
          <div className="p-6">
            {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200">{successMsg}</div>}
            {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-200">{errorMsg}</div>}
            
            <form onSubmit={handleEncodeSubmit} className="space-y-8 max-w-4xl">
              {/* Core Student Info */}
              <div>
                <h4 className="text-sm font-black text-brand-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">I. Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="First Name" field="student_first_name" required />
                  <InputField label="Last Name" field="student_last_name" required />
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Grade Applying For *</label>
                    <select required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-brand-500" value={encodeData.grade_applying_for} onChange={e => setEncodeData({...encodeData, grade_applying_for: e.target.value})}>
                      {['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <InputField label="Sex" field="sex" />
                  <InputField label="Birth Date" field="birth_date" type="date" />
                  <InputField label="Birth Place" field="birth_place" />
                  <div className="md:col-span-3">
                    <InputField label="Home Address" field="home_address" />
                  </div>
                </div>
              </div>

              {/* Family Background */}
              <div>
                <h4 className="text-sm font-black text-brand-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">II. Family Background</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <InputField label="Father's Name" field="father_name" />
                  <InputField label="Mother's Name" field="mother_name" />
                  <InputField label="Father's Contact" field="father_contact" />
                  <InputField label="Mother's Contact" field="mother_contact" />
                  <InputField label="Father's Occupation" field="father_occupation" />
                  <InputField label="Mother's Occupation" field="mother_occupation" />
                </div>
              </div>

              {/* Academic History */}
              <div>
                <h4 className="text-sm font-black text-brand-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">III. Academic & Church History</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2"><InputField label="Previous School" field="previous_school" /></div>
                  <InputField label="Repeated Grade?" field="repeated_grade" />
                  <div className="md:col-span-2"><InputField label="Church Attended" field="church_attended" /></div>
                  <InputField label="Pastor's Name" field="pastor_name" />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="text-sm font-black text-brand-700 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">IV. Attachments</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Supporting Document (Birth Cert / Form 138 / ID)</label>
                  <input type="file" onChange={e => setDocumentFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="submit" disabled={loading} className="px-8 py-3 bg-brand-600 text-white font-bold tracking-widest rounded-xl hover:bg-brand-700 transition shadow-md disabled:opacity-50">
                  {loading ? 'ENCODING...' : 'SUBMIT ENROLLMENT RECORD'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'Verify' && !selectedForm && (
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="px-6 py-3">Form ID</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forms.map(form => {
                  let name = "Unknown";
                  let grade = "Unknown";
                  if (form.student_id) {
                    const st = students.find(s => s.id === form.student_id);
                    if (st) {
                      name = `${st.last_name}, ${st.first_name}`;
                      grade = st.grade_level;
                    }
                  }
                  if (name === "Unknown" && form.father_name) {
                     name = `Child of ${form.father_name}`;
                  }
                  return (
                    <tr key={form.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-brand-600">#{String(form.id).padStart(4,'0')}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{form.grade_applying_for || grade}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(form.status)}`}>{form.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedForm(form)} className="text-sm font-bold text-brand-600 hover:text-brand-800">Review</button>
                      </td>
                    </tr>
                  )
                })}
                {forms.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No enrollment records to verify.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Verify' && selectedForm && (
           <div className="p-6">
             <button onClick={() => setSelectedForm(null)} className="mb-4 text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center">
               ← Back to List
             </button>
             <div className="flex flex-col lg:flex-row gap-8">
               
               <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6">
                 <h4 className="font-bold text-brand-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Encoded Data Review</h4>
                 <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-slate-500">Form Type:</div><div className="font-semibold">{selectedForm.form_type}</div>
                    <div className="text-slate-500">Grade Applying For:</div><div className="font-semibold">{selectedForm.grade_applying_for || 'N/A'}</div>
                    <div className="col-span-2 border-t border-slate-200 my-2"></div>
                    <div className="text-slate-500">Sex:</div><div className="font-semibold">{selectedForm.sex || 'N/A'}</div>
                    <div className="text-slate-500">Birth Date:</div><div className="font-semibold">{selectedForm.birth_date || 'N/A'}</div>
                    <div className="text-slate-500">Home Address:</div><div className="font-semibold">{selectedForm.home_address || 'N/A'}</div>
                    <div className="col-span-2 border-t border-slate-200 my-2"></div>
                    <div className="text-slate-500">Father's Name:</div><div className="font-semibold">{selectedForm.father_name || 'N/A'}</div>
                    <div className="text-slate-500">Mother's Name:</div><div className="font-semibold">{selectedForm.mother_name || 'N/A'}</div>
                    <div className="col-span-2 border-t border-slate-200 my-2"></div>
                    <div className="text-slate-500">Previous School:</div><div className="font-semibold">{selectedForm.previous_school || 'N/A'}</div>
                 </div>
                 
                 {selectedForm.file_path && (
                   <div className="mt-6 border-t border-slate-200 pt-4">
                     <h4 className="font-bold text-slate-700 mb-2">Attached Documents</h4>
                     {selectedForm.file_path.split(',').map((fp, i) => (
                        <a key={i} href={`/uploads/${fp.split('/').pop().split('\\').pop()}`} target="_blank" rel="noreferrer" className="block text-sm text-brand-600 hover:underline mb-1">
                          📄 View Attachment {i + 1}
                        </a>
                     ))}
                   </div>
                 )}
               </div>

               <div className="w-full lg:w-1/3 bg-white border border-brand-200 rounded-xl p-6 shadow-sm">
                 <h4 className="font-bold text-brand-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Verification Action</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-2">Requirements Checklist (Check if received)</label>
                     <label className="flex items-center text-sm mb-1"><input type="checkbox" className="mr-2" checked={requirements.req_birth_cert} onChange={e=>setRequirements({...requirements, req_birth_cert: e.target.checked?1:0})} /> Birth Certificate (PSA)</label>
                     <label className="flex items-center text-sm mb-1"><input type="checkbox" className="mr-2" checked={requirements.req_form_138} onChange={e=>setRequirements({...requirements, req_form_138: e.target.checked?1:0})} /> Form 138 (Report Card)</label>
                     <label className="flex items-center text-sm mb-1"><input type="checkbox" className="mr-2" checked={requirements.req_good_moral} onChange={e=>setRequirements({...requirements, req_good_moral: e.target.checked?1:0})} /> Good Moral Certificate</label>
                     <label className="flex items-center text-sm mb-1"><input type="checkbox" className="mr-2" checked={requirements.req_pictures} onChange={e=>setRequirements({...requirements, req_pictures: e.target.checked?1:0})} /> 2x2 ID Pictures</label>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Registrar Remarks</label>
                     <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none" rows="3" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add internal notes..."></textarea>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 pt-4">
                     <button onClick={() => handleVerify('Success')} disabled={loading} className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition">Approve & Enroll</button>
                     <button onClick={() => handleVerify('Hold')} disabled={loading} className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition">Hold (Incomplete)</button>
                     <button onClick={() => handleVerify('Rejected')} disabled={loading} className="py-2.5 col-span-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-sm transition">Reject Application</button>
                   </div>
                 </div>
               </div>

             </div>
           </div>
        )}
      </div>
    </div>
  );
}
