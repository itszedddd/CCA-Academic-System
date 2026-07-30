import { useState } from 'react';

export default function PreRegistrationForm({ isDarkMode }) {
  const [step, setStep] = useState(0); // 0: Start, 1: Student, 2: Family, 3: Academic, 4: Success, 5: Check Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referenceId, setReferenceId] = useState(null);
  
  // Status check state
  const [statusCheckId, setStatusCheckId] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const [formData, setFormData] = useState({
    student_first_name: '',
    student_last_name: '',
    grade_applying_for: 'Grade 7',
    sex: 'Male',
    birth_date: '',
    birth_place: '',
    home_address: '',
    father_name: '',
    father_contact: '',
    father_occupation: '',
    father_employer: '',
    mother_name: '',
    mother_contact: '',
    mother_occupation: '',
    mother_employer: '',
    church_attended: '',
    church_member: 'No',
    pastor_name: '',
    previous_school: '',
    repeated_grade: 'No',
    expelled_dismissed: 'No',
    learning_disabilities: 'None',
    special_talents: '',
    how_heard: '',
    reason_selecting: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/enrollment_forms/public-preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setReferenceId(data.id);
        setStep(4);
      } else {
        setError(data.detail || 'Failed to submit form.');
      }
    } catch (err) {
      setError('Connection error. Server may be down.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusResult(null);
    
    try {
      const res = await fetch(`/api/enrollment_forms/check-status/${statusCheckId}`);
      const data = await res.json();
      
      if (res.ok) {
        setStatusResult(data);
      } else {
        setError('Application not found. Please check your reference number.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#022868]/50 transition-all " + 
    (isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400");
  const labelClass = "block text-sm font-semibold mb-1 " + (isDarkMode ? "text-slate-300" : "text-slate-600");

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 lg:p-8 rounded-3xl shadow-lg border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex flex-col items-center mb-8">
        <img src="/login-logo.png" alt="CCA Logo" className="h-20 w-auto mb-4" />
        <h2 className={`text-2xl font-bold font-cinzel text-center ${isDarkMode ? 'text-white' : 'text-[#022868]'}`}>
          CCA Pre-Registration
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="text-center space-y-6">
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            Welcome to the Christian Covenant Academy Pre-Registration system. Please prepare your basic student and family information to begin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-white bg-[#022868] hover:bg-[#053b96] transition-colors shadow-md">
              Start Pre-Registration
            </button>
            <button onClick={() => setStep(5)} className="px-6 py-3 rounded-xl font-bold text-[#022868] bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm">
              Check Status
            </button>
          </div>
        </div>
      )}

      {(step === 1 || step === 2 || step === 3) && (
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-6">
          {/* Progress Bar */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex-1 h-2 rounded-full mx-1 ${step >= i ? 'bg-[#022868]' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className={`text-lg font-bold border-b pb-2 ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input required name="student_first_name" value={formData.student_first_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input required name="student_last_name" value={formData.student_last_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Grade Applying For *</label>
                  <select name="grade_applying_for" value={formData.grade_applying_for} onChange={handleChange} className={inputClass}>
                    <option>Grade 7</option>
                    <option>Grade 8</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sex</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} className={inputClass}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Birth Date</label>
                  <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Home Address *</label>
                <input required name="home_address" value={formData.home_address} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className={`text-lg font-bold border-b pb-2 ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>Family Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Father's Name</label>
                  <input name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Father's Contact</label>
                  <input name="father_contact" value={formData.father_contact} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mother's Name</label>
                  <input name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mother's Contact</label>
                  <input name="mother_contact" value={formData.mother_contact} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className={`text-lg font-bold border-b pb-2 ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>Academic & General</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Previous School</label>
                  <input name="previous_school" value={formData.previous_school} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>How did you hear about us?</label>
                  <input name="how_heard" value={formData.how_heard} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Back
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl font-bold text-white bg-[#022868] hover:bg-[#053b96] transition-colors shadow-md disabled:opacity-50">
              {loading ? 'Processing...' : (step === 3 ? 'Submit Application' : 'Next Step')}
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="text-center space-y-6 animate-zoom-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Application Submitted!</h3>
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            Your pre-registration has been successfully submitted. Please save your reference number.
          </p>
          <div className="p-4 bg-[#022868] rounded-xl text-white">
            <p className="text-sm opacity-80 uppercase tracking-widest mb-1">Reference Number</p>
            <p className="text-4xl font-mono font-bold">{referenceId}</p>
          </div>
          <p className="text-sm text-slate-500">
            You will need this number to check your admission status.<br/>
            The Admission Office will contact you for Assessment and Interview scheduling.
          </p>
          <button onClick={() => setStep(0)} className="px-6 py-2 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors mt-4">
            Return to Home
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 animate-fade-in-up">
          <h3 className={`text-xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Check Application Status</h3>
          
          <form onSubmit={handleCheckStatus} className="flex gap-2">
            <input 
              required 
              type="number" 
              placeholder="Enter Reference Number" 
              value={statusCheckId} 
              onChange={e => setStatusCheckId(e.target.value)} 
              className={inputClass} 
            />
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold text-white bg-[#022868] hover:bg-[#053b96] transition-colors shadow-md disabled:opacity-50 whitespace-nowrap">
              Check
            </button>
          </form>

          {statusResult && (
            <div className={`mt-6 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ref #{statusResult.id}</h4>
                  <p className="text-sm text-slate-500">{statusResult.form_type}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  statusResult.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {statusResult.status}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Assessment Status:</span>
                  <span className={`font-semibold ${
                    statusResult.assessment_status === 'Passed' ? 'text-green-600' : 
                    statusResult.assessment_status === 'Failed' ? 'text-red-600' : 
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>{statusResult.assessment_status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Interview Status:</span>
                  <span className={`font-semibold ${
                    statusResult.interview_status === 'Passed' ? 'text-green-600' : 
                    statusResult.interview_status === 'Failed' ? 'text-red-600' : 
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>{statusResult.interview_status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <button onClick={() => { setStep(0); setStatusResult(null); }} className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
              ← Back to Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
