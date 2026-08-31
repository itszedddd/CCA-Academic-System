import { useState, useEffect } from 'react';
import AIAssistantWidget from '../components/AIAssistantWidget';

export default function Dashboard({ students, warnings, attendance, forms, setActiveTab, currentRole, user, authFetch }) {
  const [loadingReport, setLoadingReport] = useState(false);
  const [tuitions, setTuitions] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [mySchedule, setMySchedule] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState([]);
  
  // New widget states
  const [aiInsights, setAiInsights] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState(null);
  const [studentPopulation, setStudentPopulation] = useState(null);
  const [registrarStats, setRegistrarStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Post modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState('Announcement'); // 'Announcement' or 'Event'
  const [postForm, setPostForm] = useState({ title: '', content: '', date: '', time: '', location: '', target_section: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudent = currentRole === 'Student' || currentRole === 'Parent';

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (postType === 'Announcement') {
        const payload = {
          title: postForm.title,
          content: postForm.content,
          is_pinned: 0,
          target_section: postForm.target_section || null
        };
        const res = await authFetch('/api/announcements/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newAnn = await res.json();
          setAnnouncements([newAnn, ...announcements]);
        }
      } else {
        const payload = {
          title: postForm.title,
          description: postForm.content,
          event_date: postForm.date,
          event_time: postForm.time || null,
          location: postForm.location || null,
          target_section: postForm.target_section || null
        };
        const res = await authFetch('/api/events/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newEvt = await res.json();
          setEvents([...events, newEvt].sort((a,b) => new Date(a.event_date) - new Date(b.event_date)));
        }
      }
      setShowPostModal(false);
      setPostForm({ title: '', content: '', date: '', time: '', location: '', target_section: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'Cashier' || currentRole === 'Principal') {
      authFetch('/api/tuition/').then(r => r?.ok ? r.json() : []).then(setTuitions).catch(()=>{});
    }
    if (currentRole === 'Principal') {
      authFetch('/api/analytics/report').then(r => r?.ok ? r.json() : null).then(setReportData).catch(()=>{});
    }
    
    if (currentRole === 'Teacher') {
      try {
        setMySchedule(user?.schedule ? JSON.parse(user.schedule) : []);
      } catch {
        setMySchedule([]);
      }
    } else if (isStudent) {
      const mySection = students.find(s => s.id === user?.student_id)?.section;
      if (mySection) {
        authFetch(`/api/auth/section-schedule/${mySection}`)
          .then(r => r?.ok ? r.json() : null)
          .then(data => {
            if (data?.schedule) {
              try { setMySchedule(JSON.parse(data.schedule)); } catch {}
            }
          }).catch(()=>{});
      }
    }

    if (currentRole === 'Registrar') {
      authFetch('/api/registrar/dashboard-stats').then(r => r?.ok ? r.json() : null).then(setRegistrarStats).catch(()=>{});
    }

    // Fetch new dashboard widgets
    if (!isStudent) {
      authFetch('/api/dashboard/widgets').then(r => r?.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setAiInsights(data.ai_insights || []);
            setEnrollmentTrends(data.enrollment_trends || null);
            setStudentPopulation(data.student_population || null);
          }
        }).catch(()=>{});
    }
    authFetch('/api/events/').then(r => r?.ok ? r.json() : []).then(setEvents).catch(()=>{});
    authFetch('/api/announcements/').then(r => r?.ok ? r.json() : []).then(setAnnouncements).catch(()=>{});

  }, [currentRole, isStudent]);

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
  
  const todayAbsences = attendance.filter(a => a.status === 'Absent').length;
  const teacherStudents = currentRole === 'Teacher' ? students.filter(s => s.section === user?.section) : students;
  const enrolledCount = teacherStudents.filter(s => s.enrollment_status === 'Enrolled').length;
  const totalSectionStudents = teacherStudents.length;
  const filteredWarnings = currentRole === 'Teacher' ? warnings.filter(w => teacherStudents.some(s => s.id === w.student_id)) : warnings;

  const renderCalendar = (scheduleItems) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const hasDays = scheduleItems.some(i => i.day);
    if (!hasDays) {
      return (
        <ul className="space-y-3">
          {scheduleItems.length === 0 ? (
            <li className="text-sm text-slate-400">No schedule assigned yet.</li>
          ) : (
            scheduleItems.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-sm font-semibold">{item.time}</span>
                <span className="text-xs font-bold text-brand-200">{item.subject}</span>
              </li>
            ))
          )}
        </ul>
      );
    }
    return (
      <div className="grid grid-cols-5 gap-2 text-center text-xs mt-2">
        {days.map(d => (
          <div key={d} className="font-bold text-brand-200 pb-2 border-b border-white/20 uppercase text-[10px] tracking-wider">{d.substring(0,3)}</div>
        ))}
        {days.map(d => {
          const items = scheduleItems.filter(i => i.day === d);
          return (
            <div key={`${d}-items`} className="space-y-2 pt-2">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white/10 p-1.5 rounded-md border border-white/10 shadow-sm backdrop-blur-sm hover:bg-white/20 transition cursor-default" title={`${item.time} - ${item.subject}`}>
                  <div className="font-bold text-white truncate text-[10px]">{item.subject}</div>
                  <div className="text-[9px] text-slate-300 opacity-90 truncate">{item.time}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };


  if (currentRole === 'Registrar') {
    const activeStudents = students.filter(s => !['Archived','Graduated','Dropped','Transferred','Rejected'].includes(s.enrollment_status));
    const oldStudents = activeStudents.filter(s => s.enrollment_status === 'Enrolled').length;
    const newStudents = activeStudents.length - oldStudents;
    const incompleteReqs = activeStudents.filter(s => !s.req_birth_cert || !s.req_form_138 || !s.req_good_moral || !s.req_pictures).length;
    const docRequests = forms.filter(f => f.status === 'Pending').length;

    return (
      <div className="h-[calc(100vh-120px)] overflow-hidden flex flex-col font-sans -mt-4">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-black text-brand-800 dark:text-brand-400 uppercase tracking-widest font-cinzel">Registrar's Dashboard</h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest mt-1">{new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</p>
        </div>

        {/* Grid Layout */}
        <div className="flex-1 min-h-0 flex gap-6">
          
          {/* Left Side (Data Blocks) */}
          <div className="flex-[1.5] flex flex-col gap-6 min-h-0">
            {/* Top Row: Events & Announcements */}
            <div className="flex-[1.2] flex gap-6 min-h-0">
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest text-center mb-4">School Events</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                  {events.length === 0 ? <p className="text-xs font-bold text-slate-400 text-center mt-8 uppercase tracking-widest">No Events</p> : events.map(e => (
                    <div key={e.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate uppercase tracking-wider">{e.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col overflow-hidden shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest text-center mb-4">Announcements</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                  {announcements.length === 0 ? <p className="text-xs font-bold text-slate-400 text-center mt-8 uppercase tracking-widest">No Announcements</p> : announcements.map(a => (
                    <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-xs truncate uppercase tracking-wider">{a.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Row: Old & New Students */}
            <div className="flex-1 flex gap-6 min-h-0">
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-6 shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest mb-3 text-center">Total Old Students</h3>
                <p className="text-5xl font-black text-slate-800 dark:text-slate-200">{oldStudents}</p>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-6 shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest mb-3 text-center">Total New Students</h3>
                <p className="text-5xl font-black text-slate-800 dark:text-slate-200">{newStudents}</p>
              </div>
            </div>

            {/* Bottom Row: Requirements & Documents */}
            <div className="flex-1 flex gap-6 min-h-0">
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-6 shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest mb-3 text-center px-2 leading-relaxed">All Students With Incomplete Requirements</h3>
                <p className="text-5xl font-black text-slate-800 dark:text-slate-200">{incompleteReqs}</p>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center p-6 shadow-sm">
                <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest mb-3 text-center px-2 leading-relaxed">All Students Requesting Documents</h3>
                <p className="text-5xl font-black text-slate-800 dark:text-slate-200">{docRequests}</p>
              </div>
            </div>
          </div>

          {/* Right Side (AI Assistant) */}
          <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex flex-col relative">
            <div className="p-6 pb-2 shrink-0">
              <h3 className="font-bold text-brand-700 dark:text-brand-400 text-[11px] uppercase tracking-widest text-center">AI Assistant</h3>
              <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-1">[All Registrar-Related Commands]</p>
            </div>
            
            <div className="flex-1 relative w-full h-full min-h-0">
                 <AIAssistantWidget mode="embedded" API_URL="/api" token={localStorage.getItem('token')} />
            </div>
          </div>

        </div>
      </div>
    );
  }


  const StatCard = ({ label, value, sub, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between h-full">
      <div className={`absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none`}>
        <svg className={`w-20 h-20 ${color}`} fill="currentColor" viewBox="0 0 20 20"><path d={icon} /></svg>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white break-words">{value}</h3>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 relative z-10">{sub}</p>
    </div>
  );

  // Helper components to avoid repetition
  const RenderGeminiInsights = () => (
    aiInsights.length > 0 && (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-black font-cinzel text-slate-800 dark:text-white flex items-center tracking-wider">
            <svg className="w-6 h-6 mr-3 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Gemini AI Insights
          </h3>
          <span className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-100 dark:border-cyan-800">Live Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {aiInsights.map((insight, idx) => {
            const typeStyles = {
              positive: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300',
              warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300',
              info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300',
              neutral: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
            };
            const style = typeStyles[insight.type] || typeStyles.neutral;
            return (
              <div key={idx} className={`rounded-2xl p-5 border ${style} shadow-sm transition-transform hover:-translate-y-1`}>
                <h4 className="font-bold text-[15px] mb-2 leading-tight">{insight.title}</h4>
                <p className="text-sm opacity-90 leading-relaxed">{insight.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    )
  );

  const RenderEventsAndAnnouncements = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Upcoming Events
            </h3>
            {!isStudent && (
              <button onClick={() => { setPostType('Event'); setShowPostModal(true); }} className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-slate-700 dark:text-brand-300 px-3 py-1.5 rounded-lg font-bold transition">+ Add Event</button>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No upcoming events scheduled.</p>
          ) : (
            events.slice(0, 4).map(event => (
              <div key={event.id} className="flex space-x-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-xl border border-brand-100 dark:border-brand-800 shrink-0">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{new Date(event.event_date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{event.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                  {(event.event_time || event.location) && (
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {event.event_time && <span>🕒 {event.event_time}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold font-cinzel tracking-wider text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              Recent Announcements
            </h3>
            {!isStudent && (
              <button onClick={() => { setPostType('Announcement'); setShowPostModal(true); }} className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-slate-700 dark:text-brand-300 px-3 py-1.5 rounded-lg font-bold transition">+ Add Post</button>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 space-y-4">
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent announcements.</p>
          ) : (
            announcements.slice(0, 4).map(ann => (
              <div key={ann.id} className="border-l-4 border-brand-500 pl-4 py-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    {ann.is_pinned === 1 && <span className="mr-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Pinned</span>}
                    {ann.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-2 tracking-wider">Posted by {ann.author_role} • {new Date(ann.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const AIAssistantSidebar = ({ label, prompts = ["Summarize data", "Show recent activity"] }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 h-full flex flex-col min-h-[400px]">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3 shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h3 className="text-lg font-black font-cinzel text-slate-800 dark:text-white tracking-wider">AI Assistant</h3>
          <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <AIAssistantWidget API_URL={window.location.origin + '/api'} token={localStorage.getItem('token')} mode="embedded" prompts={prompts} />
      </div>
    </div>
  );

  const RenderModals = () => (
    <>
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Weekly Class Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {editSchedule.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-3 items-start sm:items-end bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-0 rounded-xl sm:bg-transparent">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Day</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={item.day || ''} onChange={e => {
                      const newSch = [...editSchedule];
                      newSch[idx].day = e.target.value;
                      setEditSchedule(newSch);
                    }}>
                      <option value="">Select Day</option>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Time</label>
                    <input type="text" placeholder="e.g. 08:00 AM - 09:00 AM" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={item.time || ''} onChange={e => {
                      const newSch = [...editSchedule];
                      newSch[idx].time = e.target.value;
                      setEditSchedule(newSch);
                    }} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                    <input type="text" placeholder="e.g. Mathematics" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={item.subject || ''} onChange={e => {
                      const newSch = [...editSchedule];
                      newSch[idx].subject = e.target.value;
                      setEditSchedule(newSch);
                    }} />
                  </div>
                  <button onClick={() => {
                    const newSch = editSchedule.filter((_, i) => i !== idx);
                    setEditSchedule(newSch);
                  }} className="w-full sm:w-auto px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-bold sm:h-[38px] flex justify-center items-center">
                    <svg className="w-4 h-4 mr-1 sm:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              ))}
              
              <button onClick={() => setEditSchedule([...editSchedule, { day: 'Monday', time: '', subject: '' }])} className="mt-2 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-600 transition flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Schedule Item
              </button>
            </div>
            
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-end space-x-3 shrink-0">
              <button onClick={() => setShowScheduleModal(false)} className="px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold transition">Cancel</button>
              <button onClick={async () => {
                const res = await authFetch(`/api/users/${user.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ schedule: JSON.stringify(editSchedule) })
                });
                if (res?.ok) {
                  setMySchedule(editSchedule);
                  setShowScheduleModal(false);
                }
              }} className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow transition tracking-wide">Save Schedule</button>
            </div>
          </div>
        </div>
      )}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">New {postType}</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{postType === 'Announcement' ? 'Content' : 'Description'}</label>
                <textarea required rows="4" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})}></textarea>
              </div>
              
              {postType === 'Event' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                    <input required type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.date} onChange={e => setPostForm({...postForm, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Time (Optional)</label>
                    <input type="text" placeholder="e.g. 9:00 AM" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.time} onChange={e => setPostForm({...postForm, time: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Location (Optional)</label>
                    <input type="text" placeholder="e.g. Main Hall" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.location} onChange={e => setPostForm({...postForm, location: e.target.value})} />
                  </div>
                </div>
              )}

              {(currentRole === 'Teacher' || currentRole === 'Registrar') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target Audience</label>
                  <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={postForm.target_section} onChange={e => setPostForm({...postForm, target_section: e.target.value})}>
                    <option value="">All Students (Public)</option>
                    {currentRole === 'Teacher' && user?.section && (
                      <option value={user.section}>{user.section} (My Section Only)</option>
                    )}
                    {currentRole === 'Registrar' && (
                      <>
                        {['Pre-Kinder', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow transition tracking-wide disabled:opacity-50">
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const HeaderTitle = ({ title, subtitle }) => (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-extrabold font-cinzel text-slate-800 dark:text-white tracking-widest uppercase">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{subtitle}</p>
      </div>
      {currentRole === 'Principal' && (
        <button onClick={handleGenerateReport} disabled={loadingReport} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white text-sm font-bold font-cinzel tracking-wider rounded-lg transition shadow-[0_4px_10px_-2px_rgba(2,40,104,0.4)] disabled:opacity-70 disabled:pointer-events-none">
          {loadingReport ? 'GENERATING REPORT...' : 'INTELLIGENT REPORT'}
        </button>
      )}
    </div>
  );

  if (currentRole === 'Registrar') {
    return (
      <div className="space-y-6">
        <HeaderTitle title="Registrar's Dashboard" subtitle={new Date().toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!registrarStats ? <div className="animate-pulse h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <StatCard label="Total Old Students" value={registrarStats.old_students} sub="Continuing Students" color="text-indigo-500" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                <StatCard label="Total New Students" value={registrarStats.new_students} sub="Incoming Students" color="text-green-500" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                <StatCard label="Incomplete Requirements" value={registrarStats.incomplete_requirements} sub="Missing documents" color="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                <StatCard label="Document Requests" value={registrarStats.pending_document_requests} sub="Pending requests" color="text-amber-500" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </div>
            )}
            <RenderGeminiInsights />
            {RenderEventsAndAnnouncements()}
          </div>
          <div className="lg:col-span-1">
            <AIAssistantSidebar 
              label="Registrar" 
              prompts={["Enrollment statistics", "Missing requirements", "Section distribution", "Generate masterlist"]} 
            />
          </div>
        </div>
        {RenderModals()}
      </div>
    );
  }

  if (currentRole === 'Admission') {
    const preRegistered = forms.filter(f => f.status !== 'Enrolled').length;
    const readyForAssessment = forms.filter(f => f.assessment_status === 'Passed' && f.interview_status !== 'Passed').length;
    const pendingReqs = forms.filter(f => f.status === 'Hold: Incomplete Req' || f.status === 'Pending').length;
    const rejectedCount = forms.filter(f => f.status === 'Rejected' || f.assessment_status === 'Failed' || f.interview_status === 'Failed').length;
    return (
      <div className="space-y-6">
        <HeaderTitle title="Admission's Dashboard" subtitle={new Date().toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <StatCard label="Pre-Registered" value={preRegistered} sub="Online applications received" color="text-brand-600" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              <StatCard label="Ready for Assessment" value={readyForAssessment} sub="Cleared for exam" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Pending Requirements" value={pendingReqs} sub="Awaiting documents" color="text-amber-500" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Rejected Students" value={rejectedCount} sub="Applications denied" color="text-red-500" icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </div>
            <RenderGeminiInsights />
          </div>
          <div className="lg:col-span-1">
            <AIAssistantSidebar 
              label="Admission" 
              prompts={["How many pre-registered?", "Pending requirements?", "Enrollment summary", "Assessment schedule"]} 
            />
          </div>
        </div>
        {RenderModals()}
      </div>
    );
  }

  if (currentRole === 'Principal') {
    return (
      <div className="space-y-6">
        <HeaderTitle title="Institution Overview" subtitle="AI-driven analytics and academic health tracking." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!reportData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-28 border border-slate-100 dark:border-slate-700" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <StatCard label="Total Student Body" value={reportData.total_students} sub="Registered students" color="text-brand-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <StatCard label="Active Enrollments" value={reportData.enrolled_students} sub="Currently enrolled" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <StatCard label="Global Average" value={`${reportData.global_academic_average}%`} sub="Academic performance" color="text-indigo-500" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  <StatCard label="Academic Warnings" value={reportData.active_academic_warnings} sub="Declining trends" color="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <StatCard label="Tuition Expected" value={`₱${reportData.total_tuition_due.toLocaleString()}`} sub="Total amount due" color="text-brand-600" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <StatCard label="Tuition Collected" value={`₱${reportData.total_tuition_collected.toLocaleString()}`} sub="Total received" color="text-green-500" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  <StatCard label="Outstanding Balance" value={`₱${reportData.outstanding_balance.toLocaleString()}`} sub="Unpaid balance" color="text-amber-500" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  <StatCard label="High-Risk Flags" value={reportData.high_risk_tuition_flags} sub="Default exposure" color="text-red-500" icon="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" />
                </div>
              </>
            )}
            <RenderGeminiInsights />
            {RenderEventsAndAnnouncements()}
          </div>
          <div className="lg:col-span-1">
            <AIAssistantSidebar label="Principal" />
          </div>
        </div>
        {RenderModals()}
      </div>
    );
  }

  if (currentRole === 'Cashier') {
    const tDue = tuitions.reduce((s,t) => s + t.amount_due, 0);
    const tPaid = tuitions.reduce((s,t) => s + t.amount_paid, 0);
    const tBal = tDue - tPaid;
    const oCount = tuitions.filter(t => t.status === 'Overdue').length;
    return (
      <div className="space-y-6">
        <HeaderTitle title="Cashier's Dashboard" subtitle={new Date().toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <StatCard label="Total Expected" value={`₱${tDue.toLocaleString()}`} sub="Baseline Target" color="text-brand-600" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Collected Funds" value={`₱${tPaid.toLocaleString()}`} sub="Capital received" color="text-green-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="Deficit Balance" value={`₱${tBal.toLocaleString()}`} sub="Active remaining" color="text-amber-500" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              <StatCard label="Alert Triggers" value={oCount} sub="Overdue accounts" color="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 shadow-sm dark:bg-brand-900/20 dark:border-brand-800">
                <h4 className="font-bold text-brand-800 dark:text-brand-300 mb-2">Real-time Collections</h4>
                <p className="text-sm text-brand-600 dark:text-brand-400">Total collected today and pending clearings.</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm dark:bg-amber-900/20 dark:border-amber-800">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Daily Outstanding</h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">Overdue payments requiring immediate follow-up.</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm dark:bg-green-900/20 dark:border-green-800">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Expected Revenue</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Projected income based on active promissory notes.</p>
              </div>
            </div>
            {RenderEventsAndAnnouncements()}
          </div>
          <div className="lg:col-span-1">
            <AIAssistantSidebar 
              label="Finance & Cashier" 
              prompts={["Outstanding balances", "Today's collection", "Generate payment report"]}
            />
          </div>
        </div>
        {RenderModals()}
      </div>
    );
  }

  if (currentRole === 'Teacher') {
    return (
      <div className="space-y-6">
        <HeaderTitle title="Teacher's Dashboard" subtitle={new Date().toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        {RenderEventsAndAnnouncements()}
        <div className="mb-8 flex flex-col lg:flex-row gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-6 flex-1">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-brand-100 dark:border-brand-900 shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl font-black text-white shadow-md border-4 border-brand-100 dark:border-brand-900">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black font-cinzel tracking-wider text-slate-800 dark:text-white mb-1">{user?.full_name || 'Prof. Example User'}</h2>
              <p className="text-brand-600 dark:text-brand-400 font-bold text-sm tracking-wide mb-2 uppercase">Adviser — {user?.section || 'Unassigned Section'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Manage your section's attendance and academic progress.</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-brand-900 to-brand-700 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-sm border border-brand-800 dark:border-slate-600 lg:w-[400px] flex-shrink-0 text-white">
            <h3 className="font-bold text-sm text-brand-200 dark:text-slate-400 mb-4 uppercase tracking-widest flex items-center">
              <svg className="w-4 h-4 mr-2 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Today's Schedule
            </h3>
            <div className="cursor-pointer group relative" onClick={() => { setEditSchedule(mySchedule); setShowScheduleModal(true); }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition rounded-xl z-10 flex items-center justify-center">
                <span className="bg-brand-900/80 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm shadow-xl flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Click to Edit Schedule
                </span>
              </div>
              {renderCalendar(mySchedule)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard label="Total Students" value={totalSectionStudents} sub="Assigned to section" color="text-brand-600" icon="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              <StatCard label="AI Warnings" value={filteredWarnings.length} sub="Declining trend flagged" color="text-red-500" icon="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" />
              <StatCard label="Total Absences" value={todayAbsences} sub="Logged in attendance" color="text-amber-500" icon="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Performance Insights
                </h3>
              </div>
              <div className="space-y-3">
                {filteredWarnings.length === 0 ? (
                  <div className="p-4 rounded-xl border border-green-100 bg-green-50 dark:bg-green-900/20 flex items-start space-x-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg text-green-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300 text-sm">All Clear</p>
                      <p className="text-xs text-green-600/80 dark:text-green-400 mt-0.5">All students are on a stable trajectory.</p>
                    </div>
                  </div>
                ) : (() => {
                  const uniqueWarnings = new Map();
                  filteredWarnings.forEach(w => { if (!uniqueWarnings.has(w.student_id)) uniqueWarnings.set(w.student_id, w); });
                  return Array.from(uniqueWarnings.values()).slice(0, 4).map((w, i) => (
                    <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50/40 dark:bg-red-900/20 flex items-start space-x-3">
                      <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">{w.student_name} — {w.subject}</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400 mt-0.5">{w.message}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <RenderGeminiInsights />
          </div>
          <div className="lg:col-span-1">
            <AIAssistantSidebar label="Teacher/Adviser" />
          </div>
        </div>
        {RenderModals()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderTitle title="Dashboard" subtitle="Overview of your academic and campus activities" />
      
      {/* Profile Preview (Top) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6 flex-1">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-brand-100 dark:border-brand-900 shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl font-black text-white shadow-sm border-2 border-brand-100 dark:border-brand-900 flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-black font-cinzel tracking-wider text-slate-800 dark:text-white mb-1 uppercase">{user?.full_name || 'Student Name'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Grade 10 {user?.section || 'Perseverance'}</p>
          </div>
        </div>
        <div className="bg-brand-900 text-white rounded-xl p-4 min-w-[200px] text-center shadow-md">
          <p className="font-bold text-sm mb-1">{new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-xs text-brand-200">No Class Schedule</p>
        </div>
      </div>

      {/* Events & Announcements */}
      {RenderEventsAndAnnouncements()}

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              My AI Insights
           </h3>
           <div className="flex items-end gap-3">
             <span className="text-4xl font-black text-slate-800 dark:text-white">0</span>
           </div>
           <p className="text-xs text-slate-400 mt-2">Performance trends</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              My Absences
           </h3>
           <div className="flex items-end gap-3">
             <span className="text-4xl font-black text-slate-800 dark:text-white">{todayAbsences}</span>
           </div>
           <p className="text-xs text-slate-400 mt-2">Total absences logged</p>
        </div>
      </div>

      {RenderModals()}
    </div>
  );
}
