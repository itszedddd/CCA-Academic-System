import React from 'react';

export default function PrintableAdmissionForm({ formData }) {
  if (!formData) return null;
  return (
          <div className="hidden print:block w-full text-black bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* FORM 1: STUDENT INFORMATION FORM */}
            <div className="w-full print-page">
              <div>
                <div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/Primary Logo [2 Clear].png" alt="CCA Logo" className="h-10 w-auto mb-1" />
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

            <div className="w-full print-page text-[10pt] leading-snug">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/Primary Logo [2 Clear].png" alt="CCA Logo" className="h-10 w-auto mr-3" />
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

            <div className="w-full print-page text-[11pt] leading-normal">
              <div className="flex flex-col items-center justify-center mb-6 text-center">
                <img src="/assets/Primary Logo [2 Clear].png" alt="CCA Logo" className="h-10 w-auto mb-1" />
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

            <div className="w-full print-page">
              <div>
                <div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
                  <img src="/assets/Primary Logo [2 Clear].png" alt="CCA Logo" className="h-10 w-auto mb-1" />
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
  );
}
