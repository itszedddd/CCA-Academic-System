import { useState, useRef } from 'react';

export default function LoginPage({ onLogin, isDarkMode, setIsDarkMode }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state
  const [regData, setRegData] = useState({
    first_name: '', last_name: '', grade_level: 'Grade 7',
    section: '', contact_email: '', username: '', password: ''
  });
  const [regProfilePic, setRegProfilePic] = useState(null);
  const [regFormPic, setRegFormPic] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    
    try {
      const fd = new FormData();
      fd.append('username', username);
      fd.append('password', password);
      
      const res = await fetch('/api/auth/login', { method: 'POST', body: fd });
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');

    if (!regFormPic) {
      setError("You must upload an Enrollment Form image for OCR scanning.");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.keys(regData).forEach(key => fd.append(key, regData[key]));
      if (regProfilePic) fd.append('profile_picture', regProfilePic);
      fd.append('enrollment_form', regFormPic);

      const res = await fetch('/api/auth/register', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Registration sent to the Registrar. You may log in once approved!");
        setIsRegistering(false);
      } else {
        setError(data.detail || 'Registration failed.');
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

      <div className={`w-full ${isRegistering ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-2 overflow-hidden rounded-3xl">
            <img src={isDarkMode ? "/assets/cca-logo-dark.png" : "/assets/cca-logo-bg.png"} alt="CCA Logo" className={`w-full h-full ${isDarkMode ? 'object-contain' : 'object-cover'}`} />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-900 dark:text-white tracking-widest font-cinzel leading-tight transition-colors">CCA System</h1>
          <p className="text-brand-600 dark:text-slate-400 mt-1 font-bold tracking-wide transition-colors">Calvary Christian Academy</p>
        </div>

        <div className="backdrop-blur-2xl border rounded-3xl p-8 md:p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-zoom-in bg-white/80 dark:bg-white/10 border-white/50 dark:border-white/10 transition-colors">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">{isRegistering ? 'Student Application' : 'Welcome Back'}</h2>
            {!isRegistering ? (
              <button type="button" onClick={() => setIsRegistering(true)} className="text-sm font-bold text-brand-600 dark:text-blue-400 hover:underline">Apply as Student</button>
            ) : (
              <button type="button" onClick={() => setIsRegistering(false)} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition">Back to Login</button>
            )}
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">
            {isRegistering ? 'Submit your OCR-ready form alongside your profile details for Registrar verification.' : 'Sign in to manage academic records and AI insights.'}
          </p>

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 text-sm py-3 px-4 rounded-xl flex items-center mb-6 font-bold">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm py-3 px-4 rounded-xl flex items-center animate-shake mb-6">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest px-1 transition-colors">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-600 dark:group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input type="text" required className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} />
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
                  <input type={showPassword ? 'text' : 'password'} required className="block w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full relative py-4 bg-gradient-to-r from-brand-red to-brand-red-hover hover:from-white hover:to-white hover:text-brand-red text-white font-black font-cinzel tracking-widest rounded-xl shadow-[0_10px_20px_-5px_rgba(188,12,49,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 group overflow-hidden border border-transparent hover:border-brand-red mt-2">
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">First Name</label><input required className="w-full py-2.5 px-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm mt-1" value={regData.first_name} onChange={e => setRegData({...regData, first_name:e.target.value})} /></div>
                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">Last Name</label><input required className="w-full py-2.5 px-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm mt-1" value={regData.last_name} onChange={e => setRegData({...regData, last_name:e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">Grade Level</label>
                  <select className="w-full py-2.5 px-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm mt-1" value={regData.grade_level} onChange={e => setRegData({...regData, grade_level:e.target.value})}>
                    {['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">Section</label><input className="w-full py-2.5 px-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm mt-1" value={regData.section} onChange={e => setRegData({...regData, section:e.target.value})} placeholder="Optional" /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">Platform Username</label><input required className="w-full py-2.5 px-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm mt-1" value={regData.username} onChange={e => setRegData({...regData, username:e.target.value})} /></div>
                 <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">Platform Password</label>
                  <div className="relative mt-1">
                    <input type={showPassword ? 'text' : 'password'} required className="w-full py-2.5 pl-3 pr-10 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 text-sm" value={regData.password} onChange={e => setRegData({...regData, password:e.target.value})} />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase px-1">2x2 Picture</label>
                  <input type="file" accept="image/*" onChange={e => setRegProfilePic(e.target.files[0])} className="w-full text-xs text-slate-500 dark:text-slate-400 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase px-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Enrollment Form *
                  </label>
                  <input required type="file" accept="image/*" onChange={e => setRegFormPic(e.target.files[0])} className="w-full text-xs text-slate-500 dark:text-slate-400 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full relative py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold tracking-widest rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 mt-6 flex justify-center items-center">
                {loading ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'SUBMIT PRE-REGISTRATION'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Secure System</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 transition-colors">JWT Encrypted Access Protocol</p>
          </div>
        </div>
      </div>
    </div>
  );
}
