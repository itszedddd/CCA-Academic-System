import os
import re

file_path = r"C:\Users\ender\Programming\Thesis_Project\frontend\src\pages\PreRegistrationPage.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Look for the start of the print block
start_marker = "{/* Printable Format (Hidden on Screen, Visible on Print) */}"
end_marker = "      </main>"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)
    
    new_print_block = """{/* Printable Format (Hidden on Screen, Visible on Print) */}
        {(step >= 1 && step <= 4) && (
          <div className="hidden print:block w-full text-black bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* FORM 1: STUDENT INFORMATION FORM */}
            <div className="w-full print-page">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-20 w-auto" />
                    <div>
                      <h1 className="text-3xl font-bold uppercase tracking-wider m-0 leading-tight">Calvary Christian Academy</h1>
                      <p className="text-sm italic m-0">"Train up a child in the way he should go..."</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold border-2 border-black px-6 py-2">F1</div>
                  </div>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">Student Information Form</h2>
                
                <div className="border-2 border-black p-8 flex-grow flex flex-col justify-center">
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
            <div className="w-full print-page">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto" />
                    <h1 className="text-2xl font-bold uppercase tracking-wider m-0">Calvary Christian Academy</h1>
                  </div>
                  <div className="text-3xl font-bold border-2 border-black px-6 py-2">F2</div>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">Medical History Form</h2>
                
                <div className="border-2 border-black p-8 text-lg leading-relaxed flex-grow flex flex-col justify-around">
                  <div className="mb-6 bg-gray-100 p-4 border border-gray-300 text-xl">
                    <p><strong>Student Name:</strong> {formData.student_last_name}, {formData.student_first_name} {formData.middle_name}</p>
                  </div>
                  <div className="mb-6 space-y-4">
                    <p className="font-bold text-xl">1. Known Allergies (Food, Medicine, etc.):</p>
                    <p className="italic border-b-2 border-gray-400 mt-2 pb-2 min-h-[2.5rem]">{formData.allergies || 'None declared'}</p>
                  </div>
                  <div className="mb-6 space-y-4">
                    <p className="font-bold text-xl">2. Existing Medical Conditions:</p>
                    <p className="italic border-b-2 border-gray-400 mt-2 pb-2 min-h-[2.5rem]">{formData.medical_conditions || 'None declared'}</p>
                  </div>
                  <div className="mb-6 space-y-4">
                    <p className="font-bold text-xl">3. Current Medications:</p>
                    <p className="italic border-b-2 border-gray-400 mt-2 pb-2 min-h-[2.5rem]">{formData.current_medications || 'None declared'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-10">
                    <div>
                      <p className="font-bold text-xl mb-2">Physician's Name:</p>
                      <p className="italic border-b-2 border-gray-400 mt-1 pb-2 min-h-[2.5rem] text-xl">{formData.physician_name}</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl mb-2">Physician's Contact:</p>
                      <p className="italic border-b-2 border-gray-400 mt-1 pb-2 min-h-[2.5rem] text-xl">{formData.physician_contact}</p>
                    </div>
                  </div>
                  <div className="mt-20 border-t-2 border-dashed border-gray-400 pt-8 text-center flex justify-around">
                    <div className="inline-block text-center w-80">
                      <div className="border-b-2 border-black h-12"></div>
                      <p className="text-sm mt-2 uppercase font-bold">Parent/Guardian Signature</p>
                    </div>
                    <div className="inline-block text-center w-64">
                      <div className="border-b-2 border-black h-12"></div>
                      <p className="text-sm mt-2 uppercase font-bold">Date</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pb-4 text-sm text-gray-500 mt-auto">
                <p>Printed via CCA EduSys Electronic Registration System • {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* FORM 3: WAIVER FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto" />
                    <h1 className="text-2xl font-bold uppercase tracking-wider m-0">Calvary Christian Academy</h1>
                  </div>
                  <div className="text-3xl font-bold border-2 border-black px-6 py-2">F3</div>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">Waiver & Consent Form</h2>
                
                <div className="text-justify text-lg leading-relaxed mb-6 space-y-8 flex-grow flex flex-col justify-center">
                  <p className="text-xl leading-loose">I, <strong>{formData.father_name || formData.mother_name || formData.emergency_contact_name || '___________________________'}</strong>, parent/guardian of <strong>{formData.student_first_name} {formData.student_last_name}</strong>, hereby consent to the policies and waivers enacted by Calvary Christian Academy.</p>
                  <div className="pl-8 space-y-6 text-lg">
                    <p className="flex items-start"><span className="border-2 border-black w-6 h-6 inline-flex items-center justify-center font-bold mr-4 mt-1">{formData.waiver_agreed_1 ? 'X' : ''}</span> I understand and agree to the school's face-to-face class implementation guidelines.</p>
                    <p className="flex items-start"><span className="border-2 border-black w-6 h-6 inline-flex items-center justify-center font-bold mr-4 mt-1">{formData.waiver_agreed_2 ? 'X' : ''}</span> I release the school from any liability in case of unforeseen incidents outside their control.</p>
                    <p className="flex items-start"><span className="border-2 border-black w-6 h-6 inline-flex items-center justify-center font-bold mr-4 mt-1">{formData.waiver_agreed_3 ? 'X' : ''}</span> I pledge to monitor my child's health before sending them to school.</p>
                    <p className="flex items-start"><span className="border-2 border-black w-6 h-6 inline-flex items-center justify-center font-bold mr-4 mt-1">{formData.waiver_agreed_4 ? 'X' : ''}</span> I commit to cooperating with the school's safety protocols and procedures.</p>
                  </div>
                  <div className="mt-32 flex justify-between px-10">
                    <div className="text-center w-80">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="text-sm uppercase font-bold">Signature over Printed Name of Parent/Guardian</p>
                    </div>
                    <div className="text-center w-64">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="text-sm uppercase font-bold">Date Signed</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pb-4 text-sm text-gray-500 mt-auto">
                <p>Printed via CCA EduSys Electronic Registration System • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* FORM 4: DATA PRIVACY FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto" />
                    <h1 className="text-2xl font-bold uppercase tracking-wider m-0">Calvary Christian Academy</h1>
                  </div>
                  <div className="text-3xl font-bold border-2 border-black px-6 py-2">F4</div>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">Data Privacy Consent Form</h2>
                
                <div className="text-justify text-xl leading-loose mb-6 space-y-8 flex-grow flex flex-col justify-center">
                  <p>In compliance with the Data Privacy Act of 2012 (R.A. 10173), Calvary Christian Academy is committed to protecting your personal information.</p>
                  <p className="flex items-start mt-8"><span className="border-2 border-black w-6 h-6 inline-flex items-center justify-center font-bold mr-4 mt-2">{formData.consent_agreed ? 'X' : ''}</span> I hereby grant Calvary Christian Academy the right and permission to collect, process, and store my child's personal and academic data for legitimate educational and administrative purposes.</p>
                  <p>I understand that the school may use this data for:</p>
                  <ul className="list-disc pl-12 space-y-4 font-semibold text-lg">
                    <li>Processing of enrollment and registration.</li>
                    <li>Monitoring academic performance and attendance.</li>
                    <li>Medical emergencies and health record keeping.</li>
                    <li>Issuance of official school documents.</li>
                  </ul>
                  <div className="mt-32 flex justify-between px-10">
                    <div className="text-center w-80">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="text-sm uppercase font-bold">Signature over Printed Name of Parent/Guardian</p>
                    </div>
                    <div className="text-center w-64">
                      <div className="border-b-2 border-black h-12 mb-2"></div>
                      <p className="text-sm uppercase font-bold">Date Signed</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pb-4 text-sm text-gray-500 mt-auto">
                <p>Printed via CCA EduSys Electronic Registration System • {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* FORM 6: ID INFORMATION FORM */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="w-full print-page">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                  <div className="flex items-center gap-4">
                    <img src="/assets/[CCA L1] CCA EduSys Logo V1.png" alt="CCA Logo" className="h-16 w-auto" />
                    <h1 className="text-2xl font-bold uppercase tracking-wider m-0">Calvary Christian Academy</h1>
                  </div>
                  <div className="text-3xl font-bold border-2 border-black px-6 py-2">F6</div>
                </div>
                <h2 className="text-center text-2xl font-bold uppercase mb-8 tracking-widest">ID Information Form</h2>
                
                <div className="border-2 border-black p-12 w-5/6 mx-auto mt-16 flex-grow">
                  <div className="grid grid-cols-4 gap-8 h-64">
                    <div className="col-span-1 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center h-full bg-gray-50">
                      <p className="text-sm text-gray-500 font-bold uppercase text-center leading-relaxed">Attach 2x2<br/>ID Picture Here</p>
                    </div>
                    <div className="col-span-3 space-y-8 flex flex-col justify-center">
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
                  <div className="mt-24 text-center border-t-2 border-gray-300 pt-12">
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
"""
    
    updated_content = content[:start_idx] + new_print_block + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("PreRegistrationPage updated successfully.")
else:
    print("Markers not found.")
