import { useState, useEffect } from 'react';

export default function Dashboard({ students, warnings, attendance, forms, setActiveTab, currentRole, user, authFetch }) {
  const [loadingReport, setLoadingReport] = useState(false);
  const [tuitions, setTuitions] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (currentRole === 'Cashier' || currentRole === 'Principal') {
      authFetch('/api/tuition/').then(r => r?.ok ? r.json() : []).then(setTuitions).catch(()=>{});
    }
    if (currentRole === 'Principal') {
      authFetch('/api/analytics/report').then(r => r?.ok ? r.json() : null).then(setReportData).catch(()=>{});
    }
  }, [currentRole]);

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await authFetch('/api/analytics/report');
      if (res.ok) {
        const data = await res.json();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Institutional Report - ${data.institution}</title>
              <style>
                body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                h1 { color: #022868; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
                .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
                .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
                .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
                .warning { color: #ef4444; }
                .footer { margin-top: 50px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
              </style>
            </head>
            <body>
              <h1>Intelligent Analytics Report</h1>
              <p>Generated instantly by CCA AI Engine</p>
              
              <div class="grid">
                <div class="card">
                  <div class="label">Total Student Body</div>
                  <div class="value">${data.total_students} Registered</div>
                </div>
                <div class="card">
                  <div class="label">Active Enrollments</div>
                  <div class="value">${data.enrolled_students} Enrolled</div>
                </div>
                <div class="card">
                  <div class="label">Global Academic Average</div>
                  <div class="value">${data.global_academic_average}%</div>
                </div>
                <div class="card warning">
                  <div class="label">Active Academic Warnings</div>
                  <div class="value">${data.active_academic_warnings} Flags Detected</div>
                </div>
                <div class="card">
                  <div class="label">Total Tuition Expected</div>
                  <div class="value">₱${data.total_tuition_due.toLocaleString()}</div>
                </div>
                <div class="card">
                  <div class="label">Total Tuition Collected</div>
                  <div class="value">₱${data.total_tuition_collected.toLocaleString()}</div>
                </div>
                <div class="card">
                  <div class="label">Total Outstanding Balance</div>
                  <div class="value">₱${data.outstanding_balance.toLocaleString()}</div>
                </div>
                <div class="card warning">
                  <div class="label">High-Risk Tuition Defaults</div>
                  <div class="value">${data.high_risk_tuition_flags} Exposure Flags</div>
                </div>
              </div>
              
              <div class="footer">
                ${data.institution} — Report automatically generated on ${new Date().toLocaleString()}
              </div>
              <script>
                window.onload = function() { window.print(); window.setTimeout(function(){ window.close(); }, 500); }
              </script>
            </body>
          </html>
        `);
      }
    } finally {
      setLoadingReport(false);
    }
  };
  const isStudent = currentRole === 'Student' || currentRole === 'Parent';
  
  const todayAbsences = attendance.filter(a => a.status === 'Absent').length;
  const enrolledCount = students.filter(s => s.enrollment_status === 'Enrolled').length;

  const StatCard = ({ label, value, sub, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}>
        <svg className={`w-24 h-24 ${color}`} fill="currentColor" viewBox="0 0 20 20"><path d={icon} /></svg>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</h3>
      <p className="text-xs text-slate-400 mt-3">{sub}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header for Students */}
      {isStudent ? (
        <div className="mb-8">
          <h2 className="text-2xl font-black font-cinzel tracking-wider text-slate-800 dark:text-white">Welcome, {user?.username}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Here is your personalized academic overview and AI performance tracking.</p>
        </div>
      ) : (
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-cinzel text-slate-800 dark:text-white tracking-widest">Institution Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">AI-driven analytics and academic health tracking.</p>
          </div>
          {currentRole === 'Principal' && (
            <button 
              onClick={handleGenerateReport}
              disabled={loadingReport}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white text-sm font-bold font-cinzel tracking-wider rounded-lg transition shadow-[0_4px_10px_-2px_rgba(2,40,104,0.4)] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loadingReport ? (
                 <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                 <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              )}
              {loadingReport ? 'GENERATING REPORT...' : 'INTELLIGENT REPORT'}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      {currentRole === 'Principal' && (() => {
        if (!reportData) return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-28 border border-slate-100 dark:border-slate-700" />)}
          </div>
        );
        const d = reportData;
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <StatCard label="Total Student Body" value={d.total_students} sub="Registered students" color="text-brand-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <StatCard label="Active Enrollments" value={d.enrolled_students} sub="Currently enrolled" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Global Average" value={`${d.global_academic_average}%`} sub="Academic performance" color="text-indigo-500" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              <StatCard label="Academic Warnings" value={d.active_academic_warnings} sub="Declining trends flagged" color="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <StatCard label="Tuition Expected" value={`\u20b1${d.total_tuition_due.toLocaleString()}`} sub="Total amount due" color="text-brand-600" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Tuition Collected" value={`\u20b1${d.total_tuition_collected.toLocaleString()}`} sub="Total received" color="text-green-500" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              <StatCard label="Outstanding Balance" value={`\u20b1${d.outstanding_balance.toLocaleString()}`} sub="Unpaid balance" color="text-amber-500" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              <StatCard label="High-Risk Flags" value={d.high_risk_tuition_flags} sub="Default exposure" color="text-red-500" icon="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" />
            </div>
          </>
        );
      })()}

      {currentRole === 'Cashier' && (() => {
        const tDue = tuitions.reduce((s,t) => s + t.amount_due, 0);
        const tPaid = tuitions.reduce((s,t) => s + t.amount_paid, 0);
        const tBal = tDue - tPaid;
        const oCount = tuitions.filter(t => t.status === 'Overdue').length;
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard label="Total Expected" value={`₱${tDue.toLocaleString()}`} sub="Baseline Target" color="text-brand-600" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Collected Funds" value={`₱${tPaid.toLocaleString()}`} sub="Capital received" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Deficit Balance" value={`₱${tBal.toLocaleString()}`} sub="Active remaining" color="text-amber-500" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            <StatCard label="Alert Triggers" value={oCount} sub="Overdue accounts" color="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </div>
        );
      })()}

      {(currentRole === 'Registrar' || currentRole === 'Admission') && (() => {
        const pend = students.filter(s => s.enrollment_status === 'Pending').length;
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard label="Total Body" value={students.length} sub="Registered Students" color="text-brand-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            <StatCard label="Active Status" value={enrolledCount} sub="Fully Enrolled" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Pending Action" value={pend} sub="Awaiting Enrollment" color="text-amber-500" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="OCR Processes" value={forms.length} sub="Files verified" color="text-indigo-500" icon="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </div>
        );
      })()}

      {(currentRole === 'Teacher' || isStudent) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {!isStudent && (
            <StatCard label="Total Enrolled" value={enrolledCount} sub="Active students" color="text-brand-600"
              icon="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          )}
          
          <StatCard 
            label={isStudent ? "My AI Insights" : "AI Warnings"} 
            value={warnings.length} 
            sub={isStudent ? "Performance trends" : "Declining trend flagged"} 
            color="text-red-500"
            icon="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" 
          />
          
          <StatCard 
            label={isStudent ? "My Absences" : "Total Absences"} 
            value={isStudent ? attendance.filter(a => a.status === 'Absent').length : todayAbsences} 
            sub={isStudent ? "Total absences logged" : "Logged in attendance"} 
            color="text-amber-500"
            icon="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" 
          />

          {!isStudent && (
            <StatCard label="OCR Forms" value={forms.length} sub="Documents processed" color="text-indigo-500"
              icon="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          )}
        </div>
      )}

      {/* AI Insights + Attendance Summary */}
      {(isStudent || currentRole === 'Teacher') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {isStudent ? "My Performance Insights" : "AI Performance Insights"}
            </h3>
            {!isStudent && <button onClick={() => setActiveTab('Academic Warning AI')} className="text-sm font-medium text-slate-400 hover:text-brand-600 transition">View All →</button>}
          </div>
          <div className="space-y-3">
            {warnings.length === 0 ? (
              <div className="p-4 rounded-xl border border-green-100 bg-green-50 dark:bg-green-900/20 flex items-start space-x-3">
                <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 text-sm">{isStudent ? "Doing Great!" : "All Clear — No declining trends detected"}</p>
                  <p className="text-xs text-green-600/80 dark:text-green-400 mt-0.5">{isStudent ? "You have no declining trends in your subjects." : "All students are on a stable or improving trajectory."}</p>
                </div>
              </div>
            ) : (() => {
              const uniqueWarnings = new Map();
              warnings.forEach(w => {
                const key = isStudent ? w.subject : w.student_id;
                if (!uniqueWarnings.has(key)) uniqueWarnings.set(key, w);
              });
              return Array.from(uniqueWarnings.values()).slice(0, 4).map((w, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50/40 dark:bg-red-900/20 flex items-start space-x-3">
                  <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300 text-sm">{isStudent ? w.subject : `${w.student_name} — ${w.subject}`}</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400 mt-0.5">{w.message}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              {isStudent ? "My Recent Attendance" : "Recent Attendance"}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
            {(() => {
              const uniqueMap = new Map();
              attendance.filter(a => a.status !== 'Clear').forEach(a => {
                const key = isStudent ? a.date : a.student_id;
                if (!uniqueMap.has(key)) uniqueMap.set(key, a);
              });
              const records = Array.from(uniqueMap.values()).slice(0, 8);
              if (records.length === 0) return <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No attendance records yet.</div>;
              
              return records.map(a => (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{isStudent ? a.date : `Student #${String(a.student_id).padStart(4,'0')}`}</p>
                  {!isStudent && <p className="text-xs text-slate-400">{a.date}</p>}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  a.status === 'Present' ? 'bg-green-100 text-green-700' :
                  a.status === 'Late'    ? 'bg-amber-100 text-amber-700' :
                                           'bg-red-100 text-red-700'
                }`}>{a.status}</span>
              </div>
            ));
            })()}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={() => setActiveTab(isStudent ? 'Student Portal' : 'Attendance')} className="w-full py-2 text-sm font-medium text-slate-400 hover:text-brand-600 transition">
              {isStudent ? "View Full Record →" : "View Full Attendance →"}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
