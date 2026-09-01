import { useState, useEffect } from 'react';

const API = '/api';

const InputField = ({ label, field, type = "text", required = false, formData, setFormData, placeholder = "" , maxLength, pattern, title }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      pattern={pattern}
      title={title}
      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
      value={formData[field] || ''}
      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
    />
  </div>
);

const SelectField = ({ label, field, options, required = false, formData, setFormData }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <select
      required={required}
      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all"
      value={formData[field] || ''}
      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default function StudentEnrollment({ authFetch, user, currentRole, students }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [myForms, setMyForms] = useState([]);
  const [activeView, setActiveView] = useState('form'); // 'form' or 'status'

  const myStudent = students?.find(s => s.id === user?.student_id);

  const [formData, setFormData] = useState({
    course: 'Basic Education',
    term: 'Full Year',
    grade_applying_for: '',
    payment_term: 'Full Payment',
  });

  const fetchMyForms = async () => {
    try {
      const res = await authFetch(`${API}/enrollment_forms/my-forms`);
      if (res?.ok) {
        const data = await res.json();
        setMyForms(data);
      }
    } catch { }
  };

  useEffect(() => {
    fetchMyForms();
  }, []);

  // Removed auto-fill useEffect since we don't need those fields anymore

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        student_first_name: myStudent?.first_name || user?.full_name?.split(' ')[0] || 'Unknown',
        student_last_name: myStudent?.last_name || user?.full_name?.split(' ').slice(1).join(' ') || 'Unknown',
        grade_applying_for: formData.grade_applying_for,
        form_type: 'Enrollment Application',
        remarks: `Course: ${formData.course} | Term: ${formData.term} | Payment Term: ${formData.payment_term}`,
      };

      const res = await authFetch(`${API}/enrollment_forms/student-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res?.ok) {
        setSuccessMsg('Your enrollment form has been submitted successfully! The Admission office will review and verify it.');
        setStep(1);
        setActiveView('status');
        fetchMyForms();
      } else {
        const data = await res?.json();
        setErrorMsg(data?.detail || 'Failed to submit. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 2;
  const progressPct = Math.round((step / totalSteps) * 100);

  const gradeOptions = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

  const statusColors = {
    'Needs Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Success': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Hold': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Approved Incomplete': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const hasPendingForm = myForms.some(f => f.status === 'Needs Review' || f.status === 'Hold');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold font-cinzel tracking-wider">Online Enrollment</h2>
          <p className="text-brand-200 text-sm mt-1">Submit your enrollment application online. The Admission office will review and verify your submission.</p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex mt-5 bg-white/10 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveView('form')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'form' ? 'bg-white text-brand-700 shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Enrollment Form
          </button>
          <button
            onClick={() => setActiveView('status')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'status' ? 'bg-white text-brand-700 shadow-md' : 'text-white/70 hover:text-white'}`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            My Applications ({myForms.length})
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
          <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <p className="font-bold text-green-800 dark:text-green-300 text-sm">{successMsg}</p>
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
          <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg text-red-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <p className="font-bold text-red-800 dark:text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* --- STATUS VIEW --- */}
      {activeView === 'status' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              My Enrollment Applications
            </h3>
          </div>

          {myForms.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg">No Applications Yet</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit your enrollment form to get started.</p>
              <button onClick={() => setActiveView('form')} className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition shadow-md">
                Fill Out Enrollment Form
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {myForms.map(form => (
                <div key={form.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.status === 'Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : form.status === 'Needs Review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        {form.status === 'Success' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : form.status === 'Needs Review' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{form.form_type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Applying for: {form.grade_applying_for || 'N/A'}
                          {form.remarks && <span className="ml-2 text-brand-600 dark:text-brand-400">• {form.remarks}</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[form.status] || 'bg-slate-100 text-slate-500'}`}>
                      {form.status}
                    </span>
                  </div>
                  {/* Admission Pipeline Progress */}
                  <div className="ml-14 mt-2 flex items-center gap-1 flex-wrap">
                    {[
                      { label: 'Submitted', done: true },
                      { label: 'Assessment', done: form.assessment_status === 'Passed', failed: form.assessment_status === 'Failed', status: form.assessment_status },
                      { label: 'Interview', done: form.interview_status === 'Passed', failed: form.interview_status === 'Failed', status: form.interview_status },
                      { label: 'Enrolled', done: form.status === 'Success' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-1">
                        {i > 0 && <div className={`w-6 h-0.5 ${s.done ? 'bg-green-400' : s.failed ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-600'}`} />}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : s.failed ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                          {s.done ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : s.failed ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          ) : null}
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- FORM VIEW --- */}
      {activeView === 'form' && (
        <>
          {hasPendingForm ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg">Application Under Review</h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">You already have a pending enrollment form. Please wait for the Admission office to review it.</p>
              <button onClick={() => setActiveView('status')} className="mt-4 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition shadow-md">
                View Application Status
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Progress Bar */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step {step} of {totalSteps}</span>
                  <span className="text-xs font-bold text-brand-600">{progressPct}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-brand-500 to-brand-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { num: 1, label: 'Enrollment Details' },
                    { num: 2, label: 'Review & Submit' },
                  ].map(s => (
                    <button
                      type="button"
                      key={s.num}
                      onClick={() => setStep(s.num)}
                      className={`text-center py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${step === s.num ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800' : step > s.num ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                      {step > s.num ? '✓ ' : ''}{s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1: Enrollment Details */}
              {step === 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-5 animate-fade-in">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Enrollment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Course / Track" field="course" required options={['Basic Education', 'JHS', 'SHS - STEM', 'SHS - ABM', 'SHS - HUMSS']} formData={formData} setFormData={setFormData} />
                    <SelectField label="Term / School Year" field="term" required options={['Full Year', 'Term 1', 'Term 2', 'Term 3']} formData={formData} setFormData={setFormData} />
                    <SelectField label="Grade Level" field="grade_applying_for" required options={gradeOptions} formData={formData} setFormData={setFormData} />
                    <SelectField label="Payment Term" field="payment_term" required options={['Full Payment', 'Semi-Annual', 'Quarterly', 'Monthly']} formData={formData} setFormData={setFormData} />
                  </div>
                </div>
              )}

              {/* Step 2: Review & Submit */}
              {step === 2 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-5 animate-fade-in">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Review Your Application
                  </h3>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300 flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>Please review your information carefully. After submission, the Admission office will verify your application and contact you regarding the next steps.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Course / Track', value: formData.course },
                      { label: 'Term / School Year', value: formData.term },
                      { label: 'Grade Level', value: formData.grade_applying_for || 'N/A' },
                      { label: 'Payment Term', value: formData.payment_term },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    ← Previous
                  </button>
                ) : <div />}

                {step < totalSteps ? (
                  <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition shadow-md">
                    Next →
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-bold transition shadow-md disabled:opacity-60 flex items-center">
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>
                    ) : (
                      <>Submit Application</>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
