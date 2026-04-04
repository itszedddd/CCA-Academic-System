import { useState } from 'react';

export default function LoginPage({ onLogin, isDarkMode, setIsDarkMode }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const fd = new FormData();
      fd.append('username', username);
      fd.append('password', password);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: fd
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token);
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 font-sans selective-bg bg-cover bg-center transition-all duration-700 ${isDarkMode ? 'bg-brand-900' : 'bg-brand-50'}`} 
         style={isDarkMode ? { backgroundImage: `linear-gradient(rgba(2, 40, 104, 0.95), rgba(2, 40, 104, 0.95)), url('https://w0.peakpx.com/wallpaper/435/543/HD-wallpaper-abstract-blue-and-red-wave-lines-background-gradient-background-minimalist-abstract.jpg')` } : {}}>
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)} 
        className={`absolute top-6 right-6 p-2.5 rounded-full backdrop-blur-md transition-all z-10 shadow-sm border ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : 'bg-white/50 hover:bg-white text-brand-900 border-slate-200 shadow-md'}`}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>
      <div className="w-full max-w-lg">
        {/* Logo / Branding */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-2 overflow-hidden rounded-3xl">
            <img src={isDarkMode ? "/assets/cca-logo-dark.png" : "/assets/cca-logo-bg.png"} alt="CCA Logo" className={`w-full h-full ${isDarkMode ? 'object-contain' : 'object-cover'}`} />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-900 dark:text-white tracking-widest font-cinzel leading-tight transition-colors">CCA System</h1>
          <p className="text-brand-600 dark:text-slate-400 mt-1 font-bold tracking-wide transition-colors">Calvary Christian Academy</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-2xl border rounded-3xl p-8 md:p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-zoom-in bg-white/80 dark:bg-white/10 border-white/50 dark:border-white/10 transition-colors">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Sign in to manage academic records and AI insights.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest px-1 transition-colors">Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 dark:group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  required 
                  className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest transition-colors">Password</label>
                <a href="#" className="text-[10px] font-bold text-brand-600 dark:text-blue-400 hover:text-brand-500 dark:hover:text-blue-300 transition uppercase tracking-wider">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 dark:group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-11V7a4 4 0 118 0v4" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  required 
                  className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm py-3 px-4 rounded-xl flex items-center animate-shake">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative py-4 bg-gradient-to-r from-brand-red to-brand-red-hover hover:from-white hover:to-white hover:text-brand-red text-white font-black font-cinzel tracking-widest rounded-xl shadow-[0_10px_20px_-5px_rgba(188,12,49,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 group overflow-hidden border border-transparent hover:border-brand-red"
            >
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </form>

          {/* Help Links */}
          <div className="mt-10 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between gap-4 text-center md:text-left transition-colors">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Role Profiles</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 transition-colors">Admin · Teacher · Student</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Secure System</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 transition-colors">JWT Encrypted Access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
