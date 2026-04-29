import { useState, useEffect, useRef } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import AcademicWarnings from './pages/AcademicWarnings';
import EnrollmentOCR from './pages/EnrollmentOCR';
import StudentPortal from './pages/StudentPortal';
import TuitionML from './pages/TuitionML';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';

const API = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('Guest');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthLoading, setIsAuthLoading] = useState(!!localStorage.getItem('token'));
  const [students, setStudents] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [forms, setForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const authFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      return null;
    }
    return res;
  };

  const fetchProfile = async (t) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        setCurrentRole(u.role);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = (t) => {
    setToken(t);
    fetchProfile(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentRole('Guest');
  };

  const fetchStudents = () => authFetch(`${API}/students/`).then(r => r?.ok ? r.json() : []).then(setStudents).catch(() => {});
  const fetchWarnings = () => authFetch(`${API}/academic_warnings/`).then(r => r?.ok ? r.json() : {warnings:[]}).then(d => setWarnings(d.warnings || [])).catch(() => {});
  const fetchAttendance = () => authFetch(`${API}/attendance/`).then(r => r?.ok ? r.json() : []).then(setAttendance).catch(() => {});
  const fetchForms = () => authFetch(`${API}/enrollment_forms/`).then(r => r?.ok ? r.json() : []).then(setForms).catch(() => {});

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchStudents(); fetchWarnings(); fetchAttendance(); fetchForms();
    }
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('accessible-mode', isAccessibleMode);
  }, [isAccessibleMode]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('form_type', 'Enrollment Form');
    setUploading(true);
    try {
      const res = await authFetch(`${API}/enrollment_forms/`, { method: 'POST', body: fd });
      if (res?.ok) fetchForms();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

    const navConfig = [
    { name: 'Dashboard',          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Principal', 'Teacher', 'Registrar', 'Admission', 'Cashier', 'Parent', 'Student'] },
    { name: 'Students',           icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['Principal', 'Teacher', 'Registrar', 'Admission', 'Cashier'] },
    { name: 'Attendance',         icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles: ['Teacher'] },
    { name: 'AI Performance Tracker',icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', roles: ['Teacher'] },
    { name: 'Student Registration',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['Admission'] },
    { name: 'Enrollment Status',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['Registrar'] },
    { name: 'Tuition AI Tracker', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Principal', 'Cashier'] },
    { name: 'User Accounts',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['Superadmin'] },
    { name: 'Student Portal',     icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['Student', 'Parent'] },
  ];

  const navigation = navConfig.filter(n => n.roles.includes(currentRole));

  useEffect(() => {
    if (!navigation.find(n => n.name === activeTab)) {
      setActiveTab(navigation[0]?.name || 'Dashboard');
    }
  }, [currentRole]);

  const searchResults = {
    students: searchQuery ? students.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).includes(searchQuery)
    ) : [],
  };

  const sharedProps = { API, students, fetchStudents, warnings, fetchWarnings, attendance, fetchAttendance, forms, fetchForms, uploading, fileInputRef, handleFileUpload, currentRole, token, authFetch, user, handleLogout };

  if (isAuthLoading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>Loading...</div>;
  if (!token) return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Sidebar
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        user={user}
        handleLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isAccessibleMode={isAccessibleMode}
          setIsAccessibleMode={setIsAccessibleMode}
          warnings={warnings}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          setActiveTab={(tab) => {
            if (navigation.find(n => n.name === tab)) {
              setActiveTab(tab);
            } else if (currentRole === 'Student' || currentRole === 'Parent') {
              setActiveTab('Student Portal');
            }
          }}
          currentRole={currentRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          searchResults={searchResults}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'Dashboard'          && <Dashboard {...sharedProps} setActiveTab={setActiveTab} />}
            {activeTab === 'Students'           && <Students {...sharedProps} />}
            {activeTab === 'Attendance'         && <Attendance {...sharedProps} />}
            {activeTab === 'AI Performance Tracker'&& <AcademicWarnings {...sharedProps} />}
            { activeTab === 'Student Registration'     && <EnrollmentOCR {...sharedProps} /> }
            { activeTab === 'Enrollment Status'   && <EnrollmentOCR {...sharedProps} /> }
            { activeTab === 'Tuition AI Tracker' && <TuitionML {...sharedProps} /> }
            { activeTab === 'User Accounts'      && <UserManagement {...sharedProps} /> }
            { activeTab === 'Student Portal'     && <StudentPortal {...sharedProps} /> }
          </div>
        </main>
      </div>
    </div>
  );
}
