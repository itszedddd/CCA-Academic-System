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
          <img src="/cca-logo-v1.png" alt="CCA Logo" className="h-10 w-auto object-contain" />
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
      <main className="flex-grow flex items-start justify-center p-4 md:p-8 overflow-y-auto">
        <div className={`w-full mx-auto p-6 md:p-10 rounded-3xl shadow-xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h2 className={`text-3xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-[#022868]'}`}>
              {step === 6 ? 'Check Application Status' : 'Online Pre-Registration'}
            </h2>
            {step >= 1 && step <= 4 && (
              <button type="button" onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Form
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
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-8">
              
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

              {/* Step 1: Student Information & ID */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-end">
                    <div>
                      <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Student & ID Information</h3>
                      <p className="text-slate-500 text-sm mt-1">Please fill out all required details accurately for official records.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input required name="student_first_name" value={formData.student_first_name} onChange={handleChange} className={inputClass} placeholder="e.g. Juan" />
                    </div>
                    <div>
                      <label className={labelClass}>Middle Name</label>
                      <input name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputClass} placeholder="e.g. Dela" />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input required name="student_last_name" value={formData.student_last_name} onChange={handleChange} className={inputClass} placeholder="e.g. Cruz" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className={labelClass}>Grade Applying For *</label>
                      <select required name="grade_applying_for" value={formData.grade_applying_for} onChange={handleChange} className={inputClass}>
                        <option value="">Select Grade</option>
                        <option>Pre-Kinder</option>
                        <option>Kinder</option>
                        <option>Grade 1</option>
                        <option>Grade 2</option>
                        <option>Grade 3</option>
                        <option>Grade 4</option>
                        <option>Grade 5</option>
                        <option>Grade 6</option>
                        <option>Grade 7</option>
                        <option>Grade 8</option>
                        <option>Grade 9</option>
                        <option>Grade 10</option>
                        <option>Grade 11</option>
                        <option>Grade 12</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Sex *</label>
                      <select required name="sex" value={formData.sex} onChange={handleChange} className={inputClass}>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Birth Date *</label>
                      <input required type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Number *</label>
                      <input required name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClass} placeholder="e.g. 09123456789" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Birth Place</label>
                      <input name="birth_place" value={formData.birth_place} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Nationality & Religion</label>
                      <div className="flex gap-2">
                        <input name="nationality" value={formData.nationality} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Nationality" />
                        <input name="religion" value={formData.religion} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Religion" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Complete Home Address *</label>
                    <input required name="home_address" value={formData.home_address} onChange={handleChange} className={inputClass} placeholder="House No., Street, Brgy, City/Municipality, Province" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Parents & Guardian Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <label className={labelClass}>Father's Name</label>
                        <input name="father_name" value={formData.father_name} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Contact Number</label>
                        <input name="father_contact" value={formData.father_contact} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Occupation / Employer</label>
                        <div className="flex gap-2">
                          <input name="father_occupation" value={formData.father_occupation} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Occupation" />
                          <input name="father_employer" value={formData.father_employer} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Employer" />
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <label className={labelClass}>Mother's Maiden Name</label>
                        <input name="mother_name" value={formData.mother_name} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Contact Number</label>
                        <input name="mother_contact" value={formData.mother_contact} onChange={handleChange} className={`${inputClass} mb-3`} />
                        <label className={labelClass}>Occupation / Employer</label>
                        <div className="flex gap-2">
                          <input name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Occupation" />
                          <input name="mother_employer" value={formData.mother_employer} onChange={handleChange} className={`${inputClass} w-1/2`} placeholder="Employer" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Emergency Contact Name *</label>
                      <input required name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className={inputClass} placeholder="Person to contact in case of emergency" />
                    </div>
                    <div>
                      <label className={labelClass}>Emergency Contact Number *</label>
                      <input required name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  
                  <div>
                      <label className={labelClass}>Previous School Attended</label>
                      <input name="previous_school" value={formData.previous_school} onChange={handleChange} className={inputClass} placeholder="Name of previous school" />
                  </div>
                </div>
              )}

              {/* Step 2: Medical Form */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Medical & Health Form</h3>
                    <p className="text-slate-500 text-sm mt-1">This information helps us ensure the safety and well-being of the student.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Known Allergies</label>
                    <textarea name="allergies" value={formData.allergies} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="List any food, medication, or environmental allergies. Type 'None' if none." />
                  </div>

                  <div>
                    <label className={labelClass}>Medical Conditions</label>
                    <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="E.g., Asthma, Diabetes, Epilepsy, etc. Type 'None' if none." />
                  </div>

                  <div>
                    <label className={labelClass}>Current Medications</label>
                    <textarea name="current_medications" value={formData.current_medications} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="List any maintenance or current medications." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Family Physician Name (Optional)</label>
                      <input name="physician_name" value={formData.physician_name} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Physician Contact Number (Optional)</label>
                      <input name="physician_contact" value={formData.physician_contact} onChange={handleChange} className={inputClass} />
                    </div>
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
                      <li className="flex items-start gap-3">
                        <input type="checkbox" name="waiver_agreed_1" checked={formData.waiver_agreed_1} onChange={handleChange} className="mt-1 cursor-pointer" />
                        <span>The school has implemented safety protocols to mitigate the risk of COVID-19 and other communicable diseases.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <input type="checkbox" name="waiver_agreed_2" checked={formData.waiver_agreed_2} onChange={handleChange} className="mt-1 cursor-pointer" />
                        <span>Participation in face-to-face classes carries inherent risks, and I/we voluntarily assume these risks on behalf of my/our child.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <input type="checkbox" name="waiver_agreed_3" checked={formData.waiver_agreed_3} onChange={handleChange} className="mt-1 cursor-pointer" />
                        <span>I/We will ensure that my/our child complies with all health and safety guidelines established by the school.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <input type="checkbox" name="waiver_agreed_4" checked={formData.waiver_agreed_4} onChange={handleChange} className="mt-1 cursor-pointer" />
                        <span>I/We will immediately inform the school and keep my/our child at home if they exhibit any symptoms of illness.</span>
                      </li>
                    </ul>
                    <p>I/We release Calvary Christian Academy, its administrators, teachers, and staff from any liability, claims, or demands related to any illness or injury that may arise from my/our child's participation in face-to-face classes, provided the school has acted with due diligence and care.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Consent */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-2xl font-bold font-cinzel ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Data Privacy & Consent Form</h3>
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
                      <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>I understand all the Consent & Data Privacy form. *</h5>
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
          <div className="hidden print:block w-full text-black bg-white p-8">
            <div className="flex items-center gap-4 border-b-2 border-black pb-4 mb-6">
              <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold font-serif uppercase tracking-wider">Calvary Christian Academy</h1>
                <p className="text-sm">Official Pre-Registration Form</p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 bg-gray-200 p-2">1. Student & ID Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><strong>Name:</strong> {formData.student_first_name} {formData.middle_name} {formData.student_last_name}</div>
              <div><strong>Grade Applying For:</strong> {formData.grade_applying_for}</div>
              <div><strong>Sex:</strong> {formData.sex}</div>
              <div><strong>Birth Date:</strong> {formData.birth_date}</div>
              <div><strong>Contact Number:</strong> {formData.contact_number}</div>
              <div><strong>Address:</strong> {formData.home_address}</div>
              <div><strong>Emergency Contact:</strong> {formData.emergency_contact_name} ({formData.emergency_contact_number})</div>
            </div>

            <h2 className="text-xl font-bold mb-4 bg-gray-200 p-2">2. Medical History</h2>
            <div className="mb-6 text-sm">
              <p><strong>Allergies:</strong> {formData.allergies || 'None'}</p>
              <p><strong>Conditions:</strong> {formData.medical_conditions || 'None'}</p>
              <p><strong>Medications:</strong> {formData.current_medications || 'None'}</p>
            </div>

            <h2 className="text-xl font-bold mb-4 bg-gray-200 p-2">3. Agreements & Consent</h2>
            <div className="mb-6 text-sm">
              <p>☑ I agree to the Waiver for Progressive Implementation of Face-to-Face Classes.</p>
              <p>☑ I understand all the Consent & Data Privacy form.</p>
            </div>

            <div className="mt-16 flex justify-around">
              <div className="text-center">
                <div className="border-b border-black w-64 mb-2"></div>
                <p>Student Signature over Printed Name</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black w-64 mb-2"></div>
                <p>Parent/Guardian Signature over Printed Name</p>
              </div>
            </div>
            
            {/* Page Breaks for forms */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F1] Student Information Form.jpg" className="w-full h-auto mb-8" />
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F2] Medical History Form.jpg" className="w-full h-auto mb-8" />
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F3] Waiver for Progressive Implementation of Face-to-Face Class Form.jpg" className="w-full h-auto mb-8" />
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F4.1] Data Privacy Form Page 1.jpg" className="w-full h-auto mb-8" />
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F4.2] Data Privacy Form Page 2.jpg" className="w-full h-auto mb-8" />
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <img src="/assets/[CCA F6] ID Information Form.jpg" className="w-full h-auto mb-8" />
          </div>
        )}
      </main>
    </div>
  );
}
