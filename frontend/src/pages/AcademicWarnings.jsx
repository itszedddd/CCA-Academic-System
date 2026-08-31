import { useState } from 'react';

export default function AcademicWarnings({ warnings, fetchWarnings, currentRole, authFetch, API, user, students }) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [viewMode, setViewMode] = useState(currentRole === 'Teacher' ? 'Overview' : 'List');
  const [sectionFilter, setSectionFilter] = useState(currentRole === 'Teacher' && user?.section ? user.section : 'All');

  const filteredWarnings = warnings.filter(w => {
     if (sectionFilter !== 'All') {
        const student = students.find(s => s.id === w.student_id);
        return student?.section === sectionFilter;
     }
     return true;
  });

  return (
    <>
      {viewMode === 'Overview' && currentRole === 'Teacher' ? (
        <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-120px)] p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-black font-cinzel text-brand-800 dark:text-brand-400 tracking-widest uppercase mb-4">SECTIONS HANDLED</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => { setSectionFilter(user?.section || 'All'); setViewMode('List'); }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-center items-center hover:bg-brand-800 hover:text-white dark:hover:bg-brand-800 transition-colors duration-200 shadow-sm hover:shadow-md group"
            >
              <span className="font-bold text-lg mb-2 group-hover:text-white text-slate-800 dark:text-white">{user?.section || 'Advisory Class'}</span>
              <span className="bg-brand-600 group-hover:bg-white group-hover:text-brand-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">View Tracker</span>
            </button>
          </div>
        </div>
      ) : (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {currentRole === 'Teacher' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
          <button onClick={() => setViewMode('Overview')} className="text-sm font-bold text-slate-400 hover:text-brand-600 flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Sections
          </button>
        </div>
      )}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-cinzel tracking-wide text-slate-800 dark:text-white">AI Performance Tracker</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Students flagged by the ML trend analysis engine (Predictive Performance Analytics).</p>
        </div>
        <button onClick={fetchWarnings} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium shadow-sm flex items-center text-sm hover:bg-amber-200 transition">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Re-run Analysis
        </button>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 flex items-center space-x-2">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Students are flagged when their grade slope is ≤ −3 points/term across at least 3 recorded entries for the same subject. Powered by NumPy linear regression.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {filteredWarnings.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="text-slate-800 dark:text-white font-bold text-xl">No Warnings Detected</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">All students are maintaining stable or improving trajectories. The AI model has not detected any negative performance slopes.</p>
          </div>
        ) : (
          (() => {
            const groupedWarnings = Object.values(filteredWarnings.reduce((acc, curr) => {
              if (!acc[curr.student_id]) acc[curr.student_id] = { student_id: curr.student_id, student_name: curr.student_name, flags: [] };
              acc[curr.student_id].flags.push(curr);
              return acc;
            }, {}));
            
            return groupedWarnings.map((group) => {
              const isExpanded = expandedStudentId === group.student_id;
              return (
                <div key={group.student_id} className="border border-red-100 dark:border-red-800/60 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all relative">
                  <div 
                    onClick={() => setExpandedStudentId(isExpanded ? null : group.student_id)} 
                    className="p-4 bg-red-50/40 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-full flex items-center justify-center text-red-500 font-bold">
                        {group.flags.length}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{group.student_name}</h4>
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">{group.flags.length} Subjects Flagged</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full uppercase tracking-wide border border-red-200">High Risk Profile</span>
                      <svg className={`w-5 h-5 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 grid gap-4 grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                      {group.flags.map((w, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:border-red-300 dark:hover:border-red-700 transition-colors group/item">
                          <div className="flex items-start justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{w.subject}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
                                <span className="font-medium mr-1.5">Slope:</span>
                                <span className="font-bold text-red-600">{Number(w.slope).toFixed(2)} pts/term</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Latest</span>
                              <span className="font-black text-slate-800 dark:text-white text-lg">{Number(w.latest_score).toFixed(2)}<span className="text-xs text-slate-400 ml-0.5 font-medium">%</span></span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              ML Insight
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-100 dark:border-red-900/50 leading-relaxed font-medium mb-3">{w.message}</p>
                            
                            {/* Remarks Section */}
                            <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1.5 flex items-center mt-3">
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              Teacher Remarks
                            </p>
                            {currentRole === 'Teacher' ? (
                              <textarea
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none shadow-inner"
                                rows="2"
                                placeholder="Type your remarks here... (Saved automatically when you click outside)"
                                defaultValue={w.remarks}
                                onBlur={(e) => {
                                  if(e.target.value !== w.remarks) {
                                    authFetch(`${API}/academic_warnings/remarks`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ student_id: w.student_id, subject: w.subject, remarks: e.target.value })
                                    }).then(() => fetchWarnings());
                                  }
                                }}
                              ></textarea>
                            ) : (
                              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed italic">
                                {w.remarks || "No remarks added yet."}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
    )}
    </>
  );
}
