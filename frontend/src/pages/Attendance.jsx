import { useState } from 'react';

const API = '/api';
const TODAY = new Date().toISOString().slice(0, 10);

export default function Attendance({ students, attendance, fetchAttendance, currentRole, authFetch }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', date: TODAY, status: 'Present', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  const studentMap = Object.fromEntries(students.map(s => [s.id, `${s.first_name} ${s.last_name}`]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`${API}/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, student_id: parseInt(form.student_id) }),
      });
      if (res?.ok) { fetchAttendance(); setShowModal(false); setForm({ student_id: '', date: TODAY, status: 'Present', remarks: '' }); }
    } finally { setLoading(false); }
  };

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount  = attendance.filter(a => a.status === 'Absent').length;
  const lateCount    = attendance.filter(a => a.status === 'Late').length;

  const uniqueSections = ['All', ...new Set(students.map(s => s.section).filter(Boolean))].sort();

  const filteredAttendance = attendance
    .filter(a => {
      const s = students.find(st => st.id === a.student_id);
      if (!s) return false;
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || String(a.student_id).includes(searchQuery);
      const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;
      return matchesSearch && matchesSection;
    })
    .sort((a, b) => {
      const sA = students.find(st => st.id === a.student_id);
      const sB = students.find(st => st.id === b.student_id);
      const nameA = sA?.last_name.toLowerCase() || '';
      const nameB = sB?.last_name.toLowerCase() || '';
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[['Present', presentCount, 'bg-green-100 text-green-700'], ['Absent', absentCount, 'bg-red-100 text-red-700'], ['Late', lateCount, 'bg-amber-100 text-amber-700']].map(([label, count, cls]) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{count}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Log</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Daily attendance records with automated parent alert tracking.</p>
            </div>
            {(currentRole === 'Administrator' || currentRole === 'Teacher') && (
              <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-sm flex items-center text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Mark Attendance
              </button>
            )}
          </div>
          
          {/* Filtering & Search Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search logs by student name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <select 
                value={sectionFilter} 
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 flex-1 sm:flex-none"
              >
                {uniqueSections.map(sec => <option key={sec} value={sec}>{sec === 'All' ? 'All Sections' : sec}</option>)}
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center"
              >
                Sort A-Z
                <svg className={`ml-2 h-4 w-4 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Remarks</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredAttendance.map(a => (
                  <tr key={a.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{a.date}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-white">
                      {studentMap[a.student_id] || `Student #${String(a.student_id).padStart(4,'0')}`}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${a.status === 'Present' ? 'bg-green-100 text-green-700' : a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{a.remarks || '—'}</td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No attendance logs match your criteria.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Mark Attendance</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student</label>
                <select required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={form.student_id} onChange={e => setForm({...form, student_id:e.target.value})}>
                  <option value="">Select a student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input type="date" required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={form.date} onChange={e => setForm({...form, date:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <div className="flex space-x-3">
                  {['Present','Late','Absent'].map(s => (
                    <button key={s} type="button" onClick={() => setForm({...form, status:s})}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${form.status === s
                        ? s === 'Present' ? 'bg-green-500 text-white border-green-500' : s === 'Late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-red-500 text-white border-red-500'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks (optional)</label>
                <input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={form.remarks} onChange={e => setForm({...form, remarks:e.target.value})} placeholder="e.g. Doctor's appointment" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition disabled:opacity-50 mt-2">
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
