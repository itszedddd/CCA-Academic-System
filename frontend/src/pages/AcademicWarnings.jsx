export default function AcademicWarnings({ warnings, fetchWarnings }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Early Warning System</h3>
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

      <div className="p-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        {warnings.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="text-slate-800 dark:text-white font-bold text-xl">No Warnings Detected</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">All students are maintaining stable or improving trajectories. The AI model has not detected any negative performance slopes.</p>
          </div>
        ) : warnings.map((w, i) => (
          <div key={i} className="border border-red-100 bg-red-50/40 dark:bg-red-900/20 dark:border-red-800 rounded-2xl p-5 hover:shadow-md hover:border-red-200 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm border border-red-100 dark:border-red-800 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{w.student_name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Student #{String(w.student_id).padStart(4,'0')} · <span className="font-medium text-slate-700 dark:text-slate-300">{w.subject}</span></p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide border border-red-200">High Risk</span>
            </div>

            <div className="mt-4 pt-4 border-t border-red-100/60 dark:border-red-800/60">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                AI Insight
              </p>
              <p className="text-sm text-red-700/90 dark:text-red-300 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-red-50 dark:border-red-900 leading-relaxed">{w.message}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-500">Latest Score:</span>
                <span className="font-black text-slate-800 dark:text-white ml-2 text-lg">{w.latest_score}<span className="text-xs text-slate-400 font-medium">%</span></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Slope:</span>
                <span className="font-bold text-red-600">{w.slope} pts/term</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
