import { useEffect } from 'react';

const ROLE_COLORS = {
  Principal: 'bg-purple-600',
  Teacher:   'bg-blue-600',
  Registrar: 'bg-amber-600',
  Admission: 'bg-indigo-600',
  Cashier:   'bg-emerald-600',
  Student:   'bg-slate-600',
  Parent:    'bg-slate-500',
};

export default function Sidebar({ navigation, activeTab, setActiveTab, currentRole, user, handleLogout, isOpen, onClose }) {

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavClick = (name) => {
    setActiveTab(name);
    onClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center">
        <div className="w-12 h-12 bg-transparent overflow-hidden flex-shrink-0">
          <img src="/assets/Profile Icon [2 Clear].png" alt="CCA Logo" className="w-full h-full object-contain dark:hidden" />
          <img src="/assets/Profile Icon [1 Clear].png" alt="CCA Logo" className="w-full h-full object-contain hidden dark:block" />
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-extrabold text-brand-900 dark:text-white tracking-widest font-cinzel">CCA PORTAL</h1>
          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-tight leading-tight">Calvary Christian Academy</p>
        </div>
        {/* Close button - mobile only */}
        <button onClick={onClose} className="ml-auto md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto font-cinzel">
        <ul className="space-y-0.5 px-3">
          {navigation.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center px-3 py-2.5 transition-colors group text-xs uppercase tracking-widest font-bold ${
                  activeTab === item.name
                    ? 'bg-brand-50/80 border-r-4 border-brand-red text-brand-900 dark:bg-slate-900 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-red-hover'
                }`}
              >
                <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${activeTab === item.name ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1 text-left leading-tight break-words">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
        {user && (
          <div className="flex items-center space-x-3 p-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm ${ROLE_COLORS[currentRole] || 'bg-slate-500'}`}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.username}</p>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">{currentRole}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium group"
        >
          <svg className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile: backdrop + drawer */}
      <div
        className={`sidebar-backdrop md:hidden ${isOpen ? 'sidebar-backdrop-visible' : 'sidebar-backdrop-hidden'}`}
        onClick={onClose}
      />
      <div className={`sidebar-drawer md:hidden ${isOpen ? 'sidebar-drawer-open' : 'sidebar-drawer-closed'}`}>
        {sidebarContent}
      </div>
    </>
  );
}
