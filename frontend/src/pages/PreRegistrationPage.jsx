import { useState } from 'react';

export default function PreRegistrationPage({ isDarkMode, setIsDarkMode, onNavigateHome }) {
  const [step, setStep] = useState(0); // 0: Start, 1: Student/ID, 2: Medical, 3: Waiver, 4: Consent, 5: Success, 6: Check Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referenceId, setReferenceId] = useState(null);
  
  // Status check state
  const [statusCheckId, setStatusCheckId] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const [formData, setFormData] = useState({
    student_first_name: '',
    middle_name: '',
    student_last_name: '',
    grade_applying_for: 'Grade 7',
    sex: 'Male',
    birth_date: '',
    birth_place: '',
    nationality: '',
    religion: '',
    home_address: '',
    contact_number: '',
    
    father_name: '',
    father_contact: '',
    father_occupation: '',
    father_employer: '',
    
    mother_name: '',
    mother_contact: '',
    mother_occupation: '',
    mother_employer: '',
    
    emergency_contact_name: '',
    emergency_contact_number: '',
    
    previous_school: '',
    how_heard: '',
    
    allergies: '',
    current_medications: '',
    medical_conditions: '',
    physician_name: '',
    physician_contact: '',
    
    waiver_agreed_1: false,
    waiver_agreed_2: false,
    waiver_agreed_3: false,
    waiver_agreed_4: false,
    consent_agreed: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.waiver_agreed_1 || !formData.waiver_agreed_2 || !formData.waiver_agreed_3 || !formData.waiver_agreed_4 || !formData.consent_agreed) {
      setError("You must agree to all conditions in the Waiver and Consent forms to proceed.");
      return;
    }
    
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
        setStep(5);
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-700 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Header */}
      <header className={`py-4 px-6 md:px-12 flex justify-between items-center shadow-sm z-10 print:hidden ${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-10 w-auto object-contain" />
          <h1 className={`font-cinzel font-bold text-xl hidden sm:block ${isDarkMode ? 'text-white' : 'text-[#022868]'}`}>Calvary Christian Academy</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-500'}`}>
             {isDarkMode ? '🌙' : '☀️'}
          </button>
          <button onClick={onNavigateHome} className={`px-4 py-2 font-bold text-sm rounded-lg border transition-all ${isDarkMode ? 'border-slate-700 text-white hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
            Return to Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center overflow-y-auto print:block print:overflow-visible print:m-0 print:p-0">
        <div className={`w-full min-h-full mx-auto p-6 md:p-10 print:p-0 print:border-none print:bg-white border-t transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h2 className={`text-3xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-[#022868]'}`}>
              {step === 6 ? 'Check Application Status' : 'Online Pre-Registration'}
            </h2>
            {step >= 1 && step <= 5 && (
              <button type="button" onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all print:hidden ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print PDF / Download Form
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold animate-shake print:hidden">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="text-center space-y-8 py-10 animate-fade-in-up">
              <div className="max-w-2xl mx-auto">
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Welcome to the Christian Covenant Academy Pre-Registration system. Please prepare your basic student information, medical history, and guardian details to begin.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setStep(1)} className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-[#022868] hover:bg-[#053b96] transition-colors shadow-xl">
                    Start New Pre-Registration
                  </button>
                  <button onClick={() => setStep(6)} className="px-8 py-4 rounded-xl font-bold text-lg text-[#022868] bg-slate-100 hover:bg-slate-200 border-2 border-transparent hover:border-[#022868]/20 transition-colors shadow-sm">
                    Check Existing Status
                  </button>
                </div>
              </div>
            </div>
          )}

          {(step >= 1 && step <= 4) && (
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-8 print:hidden">
              
              {/* Progress Wizard */}
              <div className="hidden md:flex justify-between items-center mb-10 relative print:hidden">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 z-0 rounded-full"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#022868] z-0 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
                {[
                  { num: 1, label: 'Student Info' },
                  { num: 2, label: 'Medical History' },
                  { num: 3, label: 'Waiver' },
                  { num: 4, label: 'Consent' }
                ].map(s => (
                  <div key={s.num} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s.num ? 'bg-[#022868] text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'}`}>
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <span className={`absolute top-12 text-xs font-bold whitespace-nowrap ${step >= s.num ? (isDarkMode ? 'text-white' : 'text-[#022868]') : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Student Information */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-end">
                    <div>
                      <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Student &amp; ID Information</h3>
                      <p className="text-slate-500 text-sm mt-1">Please fill out all required details accurately for official records.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className={labelClass}>First Name *</label><input required name="student_first_name" value={formData.student_first_name} onChange={handleChange} className={inputClass} placeholder="e.g. Juan" /></div>
                    <div><label className={labelClass}>Middle Name</label><input name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputClass} placeholder="e.g. Dela" /></div>
                    <div><label className={labelClass}>Last Name *</label><input required name="student_last_name" value={formData.student_last_name} onChange={handleChange} className={inputClass} placeholder="e.g. Cruz" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className={labelClass}>Grade Applying For *</label>
                      <select required name="grade_applying_for" value={formData.grade_applying_for} onChange={handleChange} className={inputClass}>
                        <option value="">Select Grade</option>
                        <option>Pre-Kinder</option><option>Kinder</option><option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                      </select>
                    </div>
                    <div><label className={labelClass}>Sex *</label><select required name="sex" value={formData.sex} onChange={handleChange} className={inputClass}><option>Male</option><option>Female</option></select></div>
                    <div><label className={labelClass}>Birth Date *</label><input required type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Contact Number *</label><input required name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClass} placeholder="e.g. 09123456789" maxLength="11" pattern="[0-9]{11}" title="Please enter exactly 11 digits" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelClass}>Birth Place</label><input name="birth_place" value={formData.birth_place} onChange={handleChange} className={inputClass} /></div>
                    <div>
                      <label className={labelClass}>Nationality &amp; Religion</label>
                      <div className="flex gap-2">
                        <input name="nationality" value={formData.nationality} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Nationality" />
                        <input name="religion" value={formData.religion} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Religion" />
                      </div>
                    </div>
                  </div>
                  <div><label className={labelClass}>Complete Home Address *</label><input required name="home_address" value={formData.home_address} onChange={handleChange} className={inputClass} placeholder="House No., Street, Brgy, City/Municipality, Province" /></div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Parents &amp; Guardian Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <label className={labelClass}>Father&apos;s Name</label>
                        <input name="father_name" value={formData.father_name} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Contact Number</label>
                        <input name="father_contact" value={formData.father_contact} onChange={handleChange} className={`${inputClass} mb-3`} maxLength="11" pattern="[0-9]{11}" title="Please enter exactly 11 digits" />
                        <label className={labelClass}>Occupation / Employer</label>
                        <div className="flex gap-2">
                          <input name="father_occupation" value={formData.father_occupation} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Occupation" />
                          <input name="father_employer" value={formData.father_employer} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Employer" />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <label className={labelClass}>Mother&apos;s Maiden Name</label>
                        <input name="mother_name" value={formData.mother_name} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Contact Number</label>
                        <input name="mother_contact" value={formData.mother_contact} onChange={handleChange} className={`${inputClass} mb-3`} maxLength="11" pattern="[0-9]{11}" title="Please enter exactly 11 digits" />
                        <label className={labelClass}>Occupation / Employer</label>
                        <div className="flex gap-2">
                          <input name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Occupation" />
                          <input name="mother_employer" value={formData.mother_employer} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Employer" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelClass}>Emergency Contact Name *</label><input required name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className={inputClass} placeholder="Person to contact in case of emergency" /></div>
                    <div><label className={labelClass}>Emergency Contact Number *</label><input required name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} className={inputClass} maxLength="11" pattern="[0-9]{11}" title="Please enter exactly 11 digits" /></div>
                  </div>
                  <div><label className={labelClass}>Previous School Attended</label><input name="previous_school" value={formData.previous_school} onChange={handleChange} className={inputClass} placeholder="Name of previous school" /></div>
                </div>
              )}

              {/* Step 2: Medical Form */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Medical &amp; Health Form</h3>
                    <p className="text-slate-500 text-sm mt-1">This information helps us ensure the safety and well-being of the student.</p>
                  </div>
                  <div><label className={labelClass}>Known Allergies</label><textarea name="allergies" value={formData.allergies} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="List any food, medication, or environmental allergies. Type 'None' if none." /></div>
                  <div><label className={labelClass}>Medical Conditions</label><textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="E.g., Asthma, Diabetes, Epilepsy, etc. Type 'None' if none." /></div>
                  <div><label className={labelClass}>Current Medications</label><textarea name="current_medications" value={formData.current_medications} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="List any maintenance or current medications." /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelClass}>Family Physician Name (Optional)</label><input name="physician_name" value={formData.physician_name} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Physician Contact Number (Optional)</label><input name="physician_contact" value={formData.physician_contact} onChange={handleChange} className={inputClass} /></div>
                  </div>
                </div>
              )}

              {/* Step 3: Waiver */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Waiver for Progressive Face-to-Face Classes</h3>
                  </div>
                  <div className={`p-6 rounded-xl border h-96 overflow-y-auto text-sm leading-relaxed space-y-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <h4 className="font-bold text-center uppercase">Parental Consent and Waiver</h4>
                    <p>I/We, the parents/guardians of the above-named student, hereby allow my/our child to participate in the progressive implementation of face-to-face classes at Calvary Christian Academy.</p>
                    <p>I/We acknowledge the following:</p>
                    <ul className="list-disc pl-5 space-y-4">
                      <li className="flex items-start gap-3"><input type="checkbox" name="waiver_agreed_1" checked={formData.waiver_agreed_1} onChange={handleChange} className="mt-1 cursor-pointer" /><span>The school has implemented safety protocols to mitigate the risk of COVID-19 and other communicable diseases.</span></li>
                      <li className="flex items-start gap-3"><input type="checkbox" name="waiver_agreed_2" checked={formData.waiver_agreed_2} onChange={handleChange} className="mt-1 cursor-pointer" /><span>Participation in face-to-face classes carries inherent risks, and I/we voluntarily assume these risks on behalf of my/our child.</span></li>
                      <li className="flex items-start gap-3"><input type="checkbox" name="waiver_agreed_3" checked={formData.waiver_agreed_3} onChange={handleChange} className="mt-1 cursor-pointer" /><span>I/We will ensure that my/our child complies with all health and safety guidelines established by the school.</span></li>
                      <li className="flex items-start gap-3"><input type="checkbox" name="waiver_agreed_4" checked={formData.waiver_agreed_4} onChange={handleChange} className="mt-1 cursor-pointer" /><span>I/We will immediately inform the school and keep my/our child at home if they exhibit any symptoms of illness.</span></li>
                    </ul>
                    <p>I/We release Calvary Christian Academy, its administrators, teachers, and staff from any liability, claims, or demands related to any illness or injury that may arise from my/our child&apos;s participation in face-to-face classes, provided the school has acted with due diligence and care.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Consent */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Data Privacy &amp; Consent Form</h3>
                  </div>
                  <div className={`p-6 rounded-xl border h-96 overflow-y-auto text-sm leading-relaxed space-y-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <h4 className="font-bold text-center uppercase">Consent and Data Privacy Policy</h4>
                    <p>In compliance with the Data Privacy Act of 2012 (R.A. 10173), Calvary Christian Academy (CCA) is committed to protecting your personal information.</p>
                    <p><strong>Collection and Use of Data:</strong> The personal and academic information collected through this pre-registration form will be used solely for admission, enrollment processing, academic records management, and official school communications.</p>
                    <p><strong>Data Sharing:</strong> CCA may share necessary information with government agencies (e.g., DepEd) as required by law. We will not sell, distribute, or lease your personal information to third parties unless we have your permission or are required by law to do so.</p>
                    <p><strong>Photo and Video Release:</strong> I/We grant CCA the right to take photographs and videos of my/our child during school activities. I/We authorize the school to use these materials for educational and promotional purposes in print and digital media, including the official school website and social media pages.</p>
                    <p><strong>Consent:</strong> By submitting this form, I/we hereby give consent to CCA to collect, process, and store the information provided.</p>
                  </div>
                  <div className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-colors ${formData.consent_agreed ? (isDarkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-[#022868]') : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}`} onClick={() => setFormData({...formData, consent_agreed: !formData.consent_agreed})}>
                    <input type="checkbox" name="consent_agreed" checked={formData.consent_agreed} onChange={handleChange} className="mt-1 w-5 h-5 cursor-pointer" />
                    <div>
                      <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>I understand all the Consent &amp; Data Privacy form. *</h5>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>By checking this box, I grant consent for data processing and media release as described above.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t border-slate-200 dark:border-slate-700 print:hidden">
                <button type="button" onClick={() => setStep(step - 1)} className={`px-6 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Back
                </button>
                <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-[#022868] hover:bg-[#053b96] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                  ) : (
                    step === 4 ? 'Submit Application' : 'Next Step'
                  )}
                </button>
              </div>
            </form>
          )}


          {/* Step 5: Success Page */}
          {step === 5 && (
            <div className="text-center space-y-8 py-10 animate-zoom-in print:hidden">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              
              <div>
                <h3 className={`text-3xl font-bold font-cinzel mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Pre-Registration Submitted!</h3>
                <p className={`text-lg max-w-xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Your pre-registration forms have been successfully submitted to the system.
                </p>
              </div>

              <div className="p-8 bg-[#022868] rounded-2xl text-white shadow-2xl max-w-sm mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                  <svg className="w-32 h-32 transform translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.441A11.026 11.026 0 005 10c0 5.292 4.286 9.54 9.5 9.5 1.252 0 2.44-.24 3.518-.667C16.892 19.467 14.542 20 12 20a10 10 0 1110-10c0-2.542-.533-4.892-1.542-6.982A11.026 11.026 0 0010 5a11.026 11.026 0 00-3.733-1.559z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2 relative z-10">Reference Number</p>
                <p className="text-5xl font-mono font-black relative z-10 tracking-wider">{referenceId}</p>
              </div>

              <div className={`p-6 rounded-xl border max-w-2xl mx-auto text-left space-y-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <h4 className="font-bold text-lg border-b pb-2">Important Next Steps:</h4>
                <ol className="list-decimal pl-5 space-y-3 font-medium">
                  <li><strong>On-site Signature Required:</strong> Your submitted forms will be printed by the school. You and your parent/guardian must visit the campus to physically sign these forms.</li>
                  <li><strong>Entrance Exam / Assessment:</strong> Please proceed to the Admission Office to schedule and take your entrance examination.</li>
                  <li><strong>Status Tracking:</strong> Keep your Reference Number safe. You can use it on this page to check the status of your application.</li>
                </ol>
              </div>

              <div className="pt-6">
                <button onClick={() => { setStep(0); setFormData({ ...formData, student_first_name: '', student_last_name: '' }); }} className="px-8 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Return to Start
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Check Status */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-in-up py-10 max-w-xl mx-auto print:hidden">
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Check Application Status</h3>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter your Reference Number to view the progress of your admission.</p>
              </div>
              
              <form onSubmit={handleCheckStatus} className="flex gap-4">
                <input 
                  required 
                  type="number" 
                  placeholder="Reference Number (e.g. 1024)" 
                  value={statusCheckId} 
                  onChange={e => setStatusCheckId(e.target.value)} 
                  className={inputClass} 
                />
                <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-[#022868] hover:bg-[#053b96] transition-colors shadow-md disabled:opacity-50 whitespace-nowrap">
                  Check Status
                </button>
              </form>

              {statusResult && (
                <div className={`mt-8 p-8 rounded-2xl border shadow-sm animate-zoom-in ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
                    <div>
                      <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ref #{statusResult.id}</h4>
                      <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{statusResult.student_first_name} {statusResult.student_last_name}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                      statusResult.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {statusResult.status}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assessment Status</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        statusResult.assessment_status === 'Passed' ? 'bg-green-100 text-green-700' : 
                        statusResult.assessment_status === 'Failed' ? 'bg-red-100 text-red-700' : 
                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>{statusResult.assessment_status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interview Status</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        statusResult.interview_status === 'Passed' ? 'bg-green-100 text-green-700' : 
                        statusResult.interview_status === 'Failed' ? 'bg-red-100 text-red-700' : 
                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>{statusResult.interview_status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => { setStep(0); setStatusResult(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  ← Back to Pre-Registration Start
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable Format (Hidden on Screen, Visible on Print) */}
        {(step >= 1 && step <= 4) && (
          <div className="hidden print:block w-full text-black bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* FORM 1: STUDENT INFORMATION FORM */}
            <div className="w-full print-page">
              <div>
                <div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-20 w-auto mb-2" />
                  <h1 className="text-3xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>
                  <p className="text-sm italic m-0">"Train up a child in the way he should go..."</p>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">Student Information Form</h2>
                
                <div className="border-2 border-black p-4 flex-grow flex flex-col justify-center">
                  <div className="grid grid-cols-3 gap-y-12 gap-x-6 text-base">
                    <div className="col-span-3 grid grid-cols-12 gap-6 border-b-2 border-gray-400 pb-8">
                      <div className="col-span-4">
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Last Name</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.student_last_name || ' '}</p>
                      </div>
                      <div className="col-span-4">
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">First Name</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.student_first_name || ' '}</p>
                      </div>
                      <div className="col-span-4">
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Middle Name</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.middle_name || ' '}</p>
                      </div>
                    </div>

                    <div className="col-span-1 border-r-2 border-gray-400 pr-6">
                      <p className="font-bold text-sm text-gray-500 uppercase mb-2">Grade Applying For</p>
                      <p className="font-bold text-xl">{formData.grade_applying_for}</p>
                    </div>
                    <div className="col-span-1 border-r-2 border-gray-400 px-6">
                      <p className="font-bold text-sm text-gray-500 uppercase mb-2">Sex</p>
                      <p className="font-bold text-xl">{formData.sex}</p>
                    </div>
                    <div className="col-span-1 pl-6">
                      <p className="font-bold text-sm text-gray-500 uppercase mb-2">Date of Birth</p>
                      <p className="font-bold text-xl">{formData.birth_date}</p>
                    </div>

                    <div className="col-span-3 grid grid-cols-2 gap-8 border-t-2 border-gray-400 pt-8">
                      <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Place of Birth</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.birth_place || ' '}</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Religion</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.religion || ' '}</p>
                      </div>
                    </div>

                    <div className="col-span-3 border-t-2 border-gray-400 pt-8">
                      <p className="font-bold text-sm text-gray-500 uppercase mb-2">Complete Home Address</p>
                      <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.home_address || ' '}</p>
                    </div>
                    
                    <div className="col-span-3 grid grid-cols-2 gap-y-10 gap-x-8 border-t-2 border-gray-400 pt-8">
                       <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Father's Name</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.father_name || ' '}</p>
                       </div>
                       <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Contact Number</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.father_contact || ' '}</p>
                       </div>
                       <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Mother's Name</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.mother_name || ' '}</p>
                       </div>
                       <div>
                        <p className="font-bold text-sm text-gray-500 uppercase mb-2">Contact Number</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.mother_contact || ' '}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pb-4 text-sm text-gray-500 mt-auto">
                <p>Printed via CCA EduSys Electronic Registration System • {new Date().toLocaleDateString()}</p>
              </div>
            </div>

                        {/* FORM 2: MEDICAL HISTORY FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page text-[10pt] leading-snug">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto mr-4" />
                <div className="text-center">
                  <h1 className="font-bold text-xl m-0">Calvary Christian Academy</h1>
                  <p className="text-xs m-0">Blk. 1, Lot 9 & 10 Sarmiento Townville Subdivision, CSJDM, Bulacan</p>
                  <h2 className="font-bold text-lg mt-2 m-0">MEDICAL HISTORY</h2>
                </div>
              </div>
              <p className="text-xs text-center italic mb-4">It is mandatory that pupils who show symptoms of a communicable disease be excluded from classes until readmission is acceptable. Your cooperation will be greatly appreciated. Thank you!</p>
              
              <div className="flex justify-between mb-4 font-bold border-b border-black pb-1">
                <span>Student's Name: <span className="font-normal underline">{formData.student_last_name}, {formData.student_first_name} {formData.middle_name}</span></span>
                <span>Birth date: <span className="font-normal underline">{formData.birth_date}</span></span>
                <span>Gender: <span className="font-normal underline">{formData.sex}</span></span>
              </div>

              <div className="mb-4">
                <p className="font-bold underline mb-2">PAST DISEASES - (If your child has had any of the following, please put check and state the age when he/she had them)</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div>&#9744; Primary Complex (Tuberculosis): __________</div>
                  <div>&#9744; Pneumonia : __________</div>
                  <div>&#9744; Asthma: __________</div>
                  <div>&#9744; Ear Infection: __________</div>
                  <div>&#9744; Measles: __________</div>
                  <div>&#9744; G6PD: __________</div>
                  <div>&#9744; Mumps: __________</div>
                  <div>&#9744; Chicken Pox: __________</div>
                  <div>&#9744; Diphtheria: __________</div>
                  <div>&#9744; Polio: __________</div>
                  <div>&#9744; Convulsions: __________</div>
                  <div>&#9744; Heart Disease: __________</div>
                  <div>&#9744; Diabetes: __________</div>
                  <div>&#9744; Rheumatic Fever: __________</div>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold underline mb-2">RECENT DISABILITIES - (Please put check on any of the following noted recently)</p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  <div>&#9744; Poor vision</div>
                  <div>&#9744; Persistent cough</div>
                  <div>&#9744; Loss of smell</div>
                  <div>&#9744; Dizziness</div>
                  <div>&#9744; Speech difficulty</div>
                  <div>&#9744; Loss of taste</div>
                  <div>&#9744; Dental defects</div>
                  <div>&#9744; Crippling conditions</div>
                  <div>&#9744; Migraines</div>
                  <div>&#9744; Fainting spells</div>
                  <div>&#9744; Hearing difficulty</div>
                  <div>&#9744; Shortness of breath</div>
                  <div>&#9744; Abdominal pains</div>
                  <div>&#9744; Tires easily</div>
                  <div>&#9744; Frequent urination</div>
                  <div>&#9744; Nose Bleeding</div>
                  <div className="col-span-2">&#9744; Allergies: _________________________________</div>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold underline mb-2">IMMUNIZATION VACCINATION RECORD - (Please check any of the following)</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div>&#9744; Measles, Mumps and Rubella (MMR)</div>
                  <div>&#9744; Whooping cough</div>
                  <div>&#9744; BCG (for tuberculosis)</div>
                  <div>&#9744; Tetanus</div>
                  <div>&#9744; Hepatitis A</div>
                  <div>&#9744; Flu</div>
                  <div>&#9744; Hepatitis B</div>
                  <div>&#9744; Typhoid</div>
                  <div>&#9744; Pneumococcal (PCV)</div>
                  <div>&#9744; Polio Vaccine (IPV) (OPV)</div>
                  <div>&#9744; Diphtheria</div>
                  <div>&#9744; Others. Please, specify: ____________________</div>
                  <div>&#9744; Covid-19</div>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold underline mb-2">OTHER PERTINENT HEALTH RECORD - (Please put check if yes and leave it blank if no)</p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm mb-2">
                  <div>Is he/she shy? _______<br/>Suck thumb? _______<br/>Like school? _______</div>
                  <div>Overactive? _______<br/>Have excessive fears? _______<br/>Play well with others? _______</div>
                  <div>Bite Fingernails? _______<br/>Have temper tantrums? _______<br/>Eat breakfast? _______</div>
                </div>
                <div className="text-sm space-y-2">
                  <p>When is his/her regular bedtime? ____________________________________________________________________</p>
                  <p>Does your child have a disability due to a disease or accident? __________________________________________</p>
                  <p>Has your child been diagnosed with a developmental disorder? If yes, what is/are the diagnosis: ___________</p>
                  <p>Has your child been diagnosed with a behavioral disorder? If yes, what is/are the diagnosis: ______________</p>
                </div>
              </div>

              <div className="mt-8 text-sm text-justify">
                <p>I hereby certify that the above information given are true and correct to the best of my knowledge and I allow the Calvary Christian Academy, Inc. to use my child's Medical History details for enrollment. The information herein shall be treated as confidential in compliance with the Data Privacy Act of 2012.</p>
                <div className="flex justify-between items-end mt-8">
                  <div>Date: ________________________</div>
                  <div>Signature of Parent: ________________________</div>
                </div>
                <p className="text-xs italic mt-4">*REMINDER: No pupil will be excused from class without a written permit from a physician</p>
              </div>
            </div>

            {/* FORM 3: WAIVER FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page text-[11pt] leading-normal">
              <div className="flex flex-col items-center justify-center mb-6 text-center">
                <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-20 w-auto mb-2" />
                <h1 className="font-bold text-xl text-blue-900 m-0 uppercase tracking-wide">Calvary Christian Academy, Inc.</h1>
                <p className="text-xs m-0">Blk. 1, Lot 9, Sarmiento Townville, Poblacion I,<br/>City of San Jose del Monte, Bulacan<br/>Tel. No.: 09561504946</p>
              </div>
              
              <h2 className="font-bold text-lg text-center uppercase mb-6">WAIVER FOR PROGRESSIVE IMPLEMENTATION<br/>OF FACE-TO-FACE CLASSES</h2>
              
              <div className="text-justify mb-4">
                <p className="mb-4">In order for the <strong>Calvary Christian Academy, Inc.</strong> to efficiently move forward with the DepEd directive of Progress Implementation for Face-to-Face classes, the following matters of point must be agreed upon by the parents, in waiving any responsibility of the school should their child contract COVID-19 during School Year 2026-2027:</p>
                <ol className="list-decimal pl-6 mb-4 space-y-2">
                  <li>I understand that, <strong>Calvary Christian Academy, Inc.</strong> shall implement the minimum public health standards set by the government to minimize the risk of the spread of COVID-19.</li>
                  <li>I understand that, despite strict implementation of health protocols and because it is highly contagious, <strong>Calvary Christian Academy, Inc.</strong> cannot guarantee that my child will not be infected with COVID-19.</li>
                  <li>I understand that my child's face to face attendance will include associating with teachers, fellow learners, school personnel, and other persons inside and outside of the school environment, and as such, may put my child at risk for COVID-19 transmission.</li>
                  <li>I understand that my child's participation in Face-to-Face learning at CCA is completely voluntary, and I freely assume the responsibility of the given health risks.</li>
                  <li>I understand that symptoms of COVID-19 include, but are not limited to, fever or chills, cough, shortness of breath or difficulty breathing, fatigue, muscle or body aches, headache, new loss of taste or smell, sore throat, congestion or runny nose, nausea, vomiting, and diarrhea.</li>
                </ol>
                <p className="mb-2">Based upon my clear understanding of the aforementioned, I willing agree to the following:</p>
                <ol className="list-decimal pl-12 mb-6 space-y-2">
                  <li>I confirm that the school will not be held liable should my child contract COVID-19.</li>
                  <li>I confirm that, in spite of the mentioned risks, I am permitting my child to attend Face-to-Face classes.</li>
                  <li>I confirm that my child currently has no symptoms, and is in good health.</li>
                  <li>I confirm that I agree to keep my child home and NOT attend Face-to-Face classes should he/she, or any member of my household, develop any of the said symptoms, or any other symptoms of illness that may or may not be related to COVID-19, especially so should they test positive for COVID19.</li>
                  <li>I confirm that my child, myself, and all household members, will follow the required health and safety protocols and procedures adopted by the school and our LGU community.</li>
                </ol>
              </div>

              <div className="mt-8">
                <p className="font-bold mb-1">CONTACT DETAILS FOR QUESTIONS OR PROBLEMS</p>
                <p className="italic mb-2">For any concern or clarification, you may contact the school at 09561504946.</p>
                <table className="w-full border-collapse border border-black text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 h-24 align-top w-1/2">Signature of Parent / Guardian over Printed Name:</td>
                      <td className="border border-black p-2 h-24 align-top w-1/2">Contact Details:</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 h-16 align-top">Name of Child/ren with grade level: <br/><br/>{formData.student_first_name} {formData.student_last_name} - {formData.grade_applying_for}</td>
                      <td className="border border-black p-2 h-16 align-top">Date:</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-2 text-sm">* Please submit this form to your child's adviser prior to the conduct of face-to-face classes.</p>
              </div>
              <p className="text-center text-xs font-bold mt-8">To honor God by providing an academe conducive to learning, that will mold Christ-like leaders who are equipped to be locally committed and globally competent.</p>
            </div>

            {/* FORM 4: DATA PRIVACY FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page text-[10pt] leading-normal">
              <h1 className="font-bold text-xl text-center mb-1">CALVARY CHRISTIAN ACADEMY, INC.</h1>
              <p className="text-center text-xs mb-4">Blk. 1 Lot 9&10 Sarmiento Townville, Poblacion 1<br/>City of San Jose Del Monte, Bulacan<br/>09561504946</p>
              <h2 className="font-bold text-center text-sm mb-1">Consent Form<br/>Data Privacy SY 2026-2027<br/>Applicant for Enrollment and Student</h2>
              
              <div className="text-justify mb-4">
                <p className="font-bold mb-2">Statement of Policy</p>
                <p className="mb-2"><strong>Calvary Christian Academy, Inc.</strong> is committed to respect and value the privacy rights of individuals. We will ensure that all personal data are protected and processed in accordance with Republic Act No. 10173 or the Data Privacy Act of 2012 and its Implementing Rules and Regulations. We recognize the confidentiality of personal data and adhere to the general principles of transparency, legitimate purpose, and proportionality.</p>
                <p className="mb-2"><strong>Calvary Christian Academy, Inc</strong> is registered as a Personal Information Controller (PIC) with the National Privacy Commission under the Data Privacy Act of 2012 (DPA). As an applicant for enrollment, we will collect and process your personal data that you knowingly and voluntarily provide during or in connection with your enrollment with us, or where legitimate educational or institutional interests exists as determined by <strong>Calvary Christian Academy</strong> or as may be provided under the law.</p>
                <p className="mb-2">Your personal data that <strong>Calvary Christian Academy, Inc.</strong> shall collect in electronic or paper form may include, but not limited to:</p>
                <ul className="list-none pl-4 mb-2 space-y-1">
                  <li>a) name or alias, gender, date of birth, nationality, and country and city of birth.</li>
                  <li>b) home address, mailing address, telephone numbers, email address and other contact details.</li>
                  <li>c) academic history.</li>
                  <li>d) financial information.</li>
                  <li>e) details of your parents or guardians, next-of-kin, spouse, and other family members.</li>
                  <li>f) health issues and disabilities.</li>
                  <li>g) photographs and other audio-visual information.</li>
                  <li>h) performance assessments and disciplinary records; and</li>
                  <li>i) any additional information provided to us by you during your enrollment.</li>
                </ul>
                <p className="mb-2">As a student of <strong>Calvary Christian Academy, inc.,</strong> the data collected shall be used for legitimate purposes, such as but not limited to enrollment, academic progression, research and support services, student welfare and related support services, career services including references, work and other placements, alumni and public relations, and security and crime prevention.</p>
                <p className="mb-2"><strong>Calvary Christian Academy, Inc.</strong> shall keep all personal data in strict confidentiality if such data are not intended for public disclosure. There will be instances however where sharing and disclosure will be undertaken pursuant to a legitimate academic purpose or as determined by <strong>Calvary Christian Academy, Inc.</strong> to promote your best interests. Sharing and disclosure shall include, but not limited to:</p>
                <p className="mb-2">a) Sharing of personal data and student records, including pre-existing medical conditions, student attendance, class performance, class schedule, grades, examination results, assessment examinations and aptitude tests (e.g., Entrance Examination, Mental Ability Test, and Qualifying Examinations), career assessment and the like, with:</p>
                <ul className="list-none pl-8 mb-2 space-y-1">
                  <li>i. your parents, guardians, or next-of-kin</li>
                  <li>ii. necessary Officers and Personnel of <strong>Calvary Christian Academy, Inc.</strong></li>
                  <li>iii. on a need-to-know basis as determined by <strong>Calvary Christian Academy, Inc.</strong></li>
                  <li>iv. as may be required by law</li>
                </ul>
                <p className="mb-2">b) Posting online (e.g., <strong>Calvary Christian Academy, Inc.</strong> website, social media sites/platforms) and/or in school bulletin boards and other places within the premises of <strong>Calvary Christian Academy, Inc.</strong> campus of:</p>
                <ul className="list-none pl-8 mb-2 space-y-1">
                  <li>i. class list and class schedules</li>
                  <li>ii. admission or acceptance to <strong>Calvary Christian Academy, Inc.</strong></li>
                  <li>iii. awarding of financial aid and scholarship grants</li>
                </ul>
                <p className="mb-2">c) Sharing of relevant data to potential donors, funders, or benefactors for purposes of scholarships, grants, and other forms of assistance including the distribution to donors, funders, or benefactors of scholar's graduation brochure</p>
              </div>
            </div>
            
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page text-[10pt] leading-normal">
              <div className="text-justify mb-4">
                <p className="mb-2">d) Publishing and distribution in brochures, tarpaulins, and other school publications and/or posting online (e.g., <strong>Calvary Christian Academy, Inc.</strong> website, social media sites/platforms) and/or in school bulletin boards of:</p>
                <ul className="list-none pl-8 mb-2 space-y-1">
                  <li>i. list and photographs of graduates and awardees during commencement exercises</li>
                  <li>ii. academic, co-curricular and extracurricular achievements and success, including but not limited to honors lists, names of awardees, passing and topping of Board and Bar examinations</li>
                </ul>
                <p className="mb-2">e) Sharing of academic accomplishments, honors, co-curricular and extracurricular achievements with:</p>
                <ul className="list-none pl-8 mb-2 space-y-1">
                  <li>i. Schools you graduated from or were enrolled in</li>
                  <li>ii. Schools you intend to enroll in</li>
                  <li>iii. Award giving bodies as official entry of <strong>Calvary Christian Academy, Inc.</strong></li>
                  <li>iv. Employers and potential employers</li>
                  <li>v. Professional bodies or organizations</li>
                  <li>vi. Funding bodies</li>
                </ul>
                <p className="mb-2">f) Sharing of personal data and student records, including relevant medical information, with entities or organizations for determining eligibility in sports or academic competitions, and similar events</p>
                <p className="mb-2">g) Responding to inquiries of being a bona fide student or graduate of <strong>Calvary Christian Academy, Inc.</strong> with scholastic ranking information including the issuance of a Certificate of Good Moral Character for purposes of transfer of schools, further studies, or application for employment</p>
                <p className="mb-2">h) Sharing of personal data and student records in the conduct of internal research, surveys, presentation, publication, and utilization of research output for purposes of institutional development</p>
                <p className="mb-2">i) Reporting and disclosing of pertinent data to the Department of Education (DepEd), National Privacy Commission (NPC), and other government agencies and regulatory bodies when required or allowed and mandated by law</p>
                <p className="mb-2">j) Sharing of personal data and school records in compliance with court orders, subpoenas, and other legal processes</p>
                <p className="mb-4 mt-4">To ensure the proper functioning of <strong>Calvary Christian Academy, Inc.</strong> as a Basic Education Institution, <strong>Calvary Christian Academy, Inc.</strong> may share your personal data and school records with various Principals, Assistant Principals, Academic Heads and Heads of Non-Teaching Personnel</p>
                <p className="mb-4">Department, as well as necessary Officers and Personnel, to process grades, honors, awards, applications for scholarships, and the like; to impose disciplinary sanctions; and to administer the necessary health, medical and psychological examinations. <strong>Calvary Christian Academy, Inc.</strong> may also, from time to time, consider it appropriate to disclose your relevant personal data and student records to members of staff committees and organizations within <strong>Calvary Christian Academy, Inc.</strong></p>
                <p className="mb-4">If <strong>Calvary Christian Academy, Inc.</strong> intends to use or share your personal data and/or student record for purposes other than for legitimate institutional and/or academic purposes and those above-described, <strong>Calvary Christian Academy, Inc.</strong> shall obtain your written consent for that purpose, unless you yourself makes a specific request to process the personal data and/or student record for such purpose, or if such processing without your consent is allowed under the DPA or other laws, or where such disclosure is for the prevention or detection of crime, the apprehension or prosecution of offenders, or for the protection of your health, security and safety, and that of others.</p>
              </div>

              <div className="mt-8">
                <p className="font-bold text-center mb-4">DECLARATION</p>
                <ul className="list-disc pl-8 mb-6 space-y-2">
                  <li>I have read and understood the contents of this Consent Form. As an applicant for enrollment or student of <strong>Calvary Christian Academy, Inc.,</strong></li>
                  <li>I give my written consent that <strong>Calvary Christian Academy, Inc.</strong> may collect and process my personal data as set out above and/or for other legitimate purposes. In cases where my personal data was acquired by <strong>Calvary Christian Academy, Inc.</strong> from a third party, I warrant that such third party has been duly authorized by me to disclose my personal data to <strong>Calvary Christian Academy, Inc.</strong> pursuant to the purposes set out above. I also agree to comply with all reasonable requests of <strong>Calvary Christian Academy, Inc.</strong> to enable compliance with its obligations under the Data Privacy Act or other applicable laws, regulations and/or guidelines.</li>
                </ul>
                <p className="italic font-bold mb-8">This consent form shall be valid while you are an applicant, a student, or an alumna of Calvary Christian Academy, Inc.</p>
                
                <div className="space-y-4">
                  <div className="flex">
                    <span className="w-48">Name of the student:</span>
                    <span className="flex-grow border-b border-black text-center font-bold">{formData.student_first_name} {formData.student_last_name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-80">Name & signature of the parent/guardian:</span>
                    <span className="flex-grow border-b border-black"></span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Date Signed:</span>
                    <span className="w-64 border-b border-black"></span>
                  </div>
                </div>
              </div>
            </div>
{/* FORM 6: ID INFORMATION FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page">
              <div>
                <div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto mb-2" />
                  <h1 className="text-2xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">ID Information Form</h2>
                
                <div className="border-2 border-black p-6 w-full mx-auto mt-8 flex-grow flex flex-col justify-between">
                  <div className="flex gap-8 items-start">
                    <div className="w-[2in] h-[2in] min-w-[2in] min-h-[2in] border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                      <p className="text-sm text-gray-500 font-bold uppercase text-center leading-relaxed">Attach 2x2<br/>ID Picture Here</p>
                    </div>
                    <div className="flex-grow space-y-8 flex flex-col justify-center">
                      <div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Student Name</p>
                        <p className="font-bold text-2xl border-b-2 border-black uppercase pb-1">{formData.student_last_name}, {formData.student_first_name} {formData.middle_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-sm font-bold text-gray-500 uppercase mb-2">Grade Level</p>
                          <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.grade_applying_for}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500 uppercase mb-2">Contact Person</p>
                          <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.emergency_contact_name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Emergency Contact Number</p>
                        <p className="font-bold text-xl border-b-2 border-black pb-1">{formData.emergency_contact_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-16 text-center border-t-2 border-gray-300 pt-8">
                    <div className="border-b-2 border-black w-80 mx-auto h-12"></div>
                    <p className="text-sm font-bold uppercase mt-2">Student Signature</p>
                  </div>
                </div>
              </div>
              <div className="text-center pb-4 text-sm text-gray-500 mt-auto">
                <p>Printed via CCA EduSys Electronic Registration System • {new Date().toLocaleDateString()}</p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
