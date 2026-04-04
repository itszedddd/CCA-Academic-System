export default function Header({ activeTab, isDarkMode, setIsDarkMode, warnings, showNotifications, setShowNotifications, setActiveTab, searchQuery, setSearchQuery, showSearchResults, setShowSearchResults, searchResults, currentRole }) {
  console.log("Header Render:", { activeTab, currentRole, warningsCount: warnings.length, showNotifications });
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-8 shadow-sm z-50">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeTab}</h2>

      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search students..."
            className="w-56 pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-full text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          {showSearchResults && searchQuery.length > 0 && (
            <div className="absolute top-12 left-0 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Search Results</span>
                <button onClick={() => setShowSearchResults(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.students.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No students found for "{searchQuery}"</div>
                ) : searchResults.students.map(s => (
                  <div key={s.id} onClick={() => setShowSearchResults(false)} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 cursor-pointer flex items-center">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs mr-3">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">#{String(s.id).padStart(4,'0')} · {s.grade_level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button onClick={() => setIsDarkMode(p => !p)} className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-amber-400 transition-colors focus:outline-none rounded-lg">
          {isDarkMode
            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotifications(p => !p)} className="relative p-2 text-slate-400 hover:text-brand-600 transition-colors focus:outline-none rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {warnings.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{currentRole === 'Student' ? 'My Notifications' : 'AI Warnings'}</h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{warnings.length}</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {warnings.length === 0
                  ? <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications.</div>
                  : warnings.map((w, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 cursor-pointer transition">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{currentRole === 'Student' ? `Performance: ${w.subject}` : `${w.student_name} — ${w.subject}`}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{w.message}</p>
                    </div>
                  ))
                }
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 text-center border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => { setShowNotifications(false); setActiveTab(currentRole === 'Student' ? 'Student Portal' : 'Academic Warning AI'); }} className="text-xs font-bold text-brand-600 hover:text-brand-800">
                  {currentRole === 'Student' ? 'View My Portal →' : 'View All Warnings →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
