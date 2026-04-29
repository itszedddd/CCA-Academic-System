import { useState, useEffect } from 'react';

const API = '/api';

export default function TuitionML({ currentRole, authFetch }) {
  const [tuitions, setTuitions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSchoolYear, setFilterSchoolYear] = useState('All');
  const [sortOrder, setSortOrder] = useState('Highest Risk');
  const [editingTuition, setEditingTuition] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        authFetch(`${API}/tuition/`),
        authFetch(`${API}/students/`)
      ]);
      
      if (tRes.ok && sRes.ok) {
        setTuitions(await tRes.json());
        setStudents(await sRes.json());
      } else {
        setError("Failed to fetch tuition machine learning details.");
      }
    } catch (err) {
      setError("Connection error to AI engine.");
    } finally {
      setLoading(false);
    }
  };

  const getStudent = (id) => students.find(s => s.id === id) || {};

  const handleLedgerUpdate = async (e) => {
    e.preventDefault();
    const res = await authFetch(`${API}/tuition/${editingTuition.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTuition)
    });
    if (res?.ok) {
      setEditingTuition(null);
      fetchData();
    }
  };

  const handlePaidChange = (newPaid) => {
    const val = isNaN(newPaid) ? 0 : newPaid;
    let newStatus = editingTuition.status;
    if (val >= editingTuition.amount_due) {
      newStatus = 'Paid';
    } else if (val < editingTuition.amount_due && newStatus === 'Paid') {
      newStatus = 'Pending';
    }
    setEditingTuition({ ...editingTuition, amount_paid: val, status: newStatus });
  };

  const handleDueChange = (newDue) => {
    const val = isNaN(newDue) ? 0 : newDue;
    let newStatus = editingTuition.status;
    if (editingTuition.amount_paid >= val) {
      newStatus = 'Paid';
    } else if (editingTuition.amount_paid < val && newStatus === 'Paid') {
      newStatus = 'Pending';
    }
    setEditingTuition({ ...editingTuition, amount_due: val, status: newStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-extrabold font-cinzel text-brand-900 dark:text-white tracking-widest flex items-center">
            <svg className="w-6 h-6 mr-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Tuition Intelligence
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-wide mt-1">Machine Learning Risk Profiling</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl font-bold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search by student name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>

        {(() => {
          const extractYear = (t) => t?.match(/20\d{2}-20\d{2}/)?.[0] || 'Unknown';
          const uniqueYears = ['All', ...new Set(tuitions.map(t => extractYear(t.term)).filter(y => y !== 'Unknown'))].sort().reverse();
          return (
            <select 
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              value={filterSchoolYear}
              onChange={(e) => setFilterSchoolYear(e.target.value)}
            >
              {uniqueYears.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `SY ${y}`}</option>)}
            </select>
          );
        })()}
        
        <select 
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="Highest Risk">Sort: Highest Risk</option>
          <option value="Lowest Risk">Sort: Lowest Risk</option>
          <option value="Amount Due">Sort: Amount Due</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left">Target Context</th>
                <th className="px-6 py-4 text-left">Financial Load</th>
                <th className="px-6 py-4 text-left">Payment Pipeline</th>
                <th className="px-6 py-4 text-left">AI Status</th>
                <th className="px-6 py-4 text-left">Risk Profiling</th>
                {currentRole === 'Cashier' && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(() => {
                const filteredTuitions = tuitions
                  .filter(t => {
                    const student = getStudent(t.student_id);
                    const matchesSearch = `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
                    const matchesYear = filterSchoolYear === 'All' || (t.term && t.term.includes(filterSchoolYear));
                    return matchesSearch && matchesStatus && matchesYear;
                  })
                  .sort((a, b) => {
                    if(sortOrder === 'Highest Risk') return (b.risk_score || 0) - (a.risk_score || 0);
                    if(sortOrder === 'Lowest Risk') return (a.risk_score || 0) - (b.risk_score || 0);
                    if(sortOrder === 'Amount Due') return b.amount_due - a.amount_due;
                    return 0;
                  });

                if (filteredTuitions.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        No active tuition records traced by AI engine matching your filters.
                      </td>
                    </tr>
                  );
                }

                return filteredTuitions.map(t => {
                  const student = getStudent(t.student_id);
                  const isHighRisk = t.risk_score >= 0.8;
                  const isMediumRisk = t.risk_score >= 0.5 && t.risk_score < 0.8;
                  const isLowRisk = t.risk_score < 0.5;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {student.profile_image ? (
                            <img src={student.profile_image} className="w-8 h-8 rounded-full object-cover mr-3 bg-slate-100 dark:bg-slate-700 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                          )}
                          <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{student.last_name}, {student.first_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">₱{t.amount_due.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">₱{t.amount_paid.toLocaleString()}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((t.amount_paid / t.amount_due) * 100, 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : t.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold font-sans">
                        {isHighRisk && (
                          <div className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900">
                            <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            High Default Exposure
                          </div>
                        )}
                        {isMediumRisk && (
                          <div className="flex items-center text-amber-600 dark:text-amber-400">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Medium Exposure Alerts
                          </div>
                        )}
                        {isLowRisk && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Stable Financial Model
                          </div>
                        )}
                      </td>
                      {currentRole === 'Cashier' && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setEditingTuition({...t})}
                            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition"
                          >
                            Adjust Ledger
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Ledger Modal */}
      {editingTuition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Adjust Financial Ledger
              </h3>
              <button onClick={() => setEditingTuition(null)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleLedgerUpdate} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Context</label>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 font-bold h-[38px] flex items-center">
                    {getStudent(editingTuition.student_id).first_name} {getStudent(editingTuition.student_id).last_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tracked School Year</label>
                  <select 
                    value={editingTuition.term || 'Annual SY 2025-2026'} 
                    onChange={e => setEditingTuition({...editingTuition, term: e.target.value})}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-bold h-[38px]"
                  >
                    <option value={editingTuition.term || 'Annual SY 2025-2026'}>{editingTuition.term || 'Annual SY 2025-2026'}</option>
                    {['Annual SY 2024-2025', 'Annual SY 2023-2024'].filter(t => t !== editingTuition.term).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Due</label>
                  <input type="number" step="0.01" required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingTuition.amount_due} onChange={e => handleDueChange(parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid</label>
                  <input type="number" step="0.01" required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={editingTuition.amount_paid} onChange={e => handlePaidChange(parseFloat(e.target.value))} />
                </div>
              </div>

              {/* Quick Transaction Menu */}
              <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-800 space-y-3">
                 <label className="block text-sm font-bold text-brand-700 dark:text-brand-400">Incoming Payment (Cash/Transfer)</label>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <div className="flex-1">
                     <input type="text" id="or_num" required className="w-full border border-brand-200 dark:border-brand-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-800 dark:text-white" placeholder="O.R. Number..." />
                   </div>
                   <div className="flex-1">
                     <input type="number" step="0.01" id="quick_pay" className="w-full border border-brand-200 dark:border-brand-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-800 dark:text-white" placeholder="Amount..." />
                   </div>
                 </div>
                 <div className="flex justify-end space-x-2">
                   <button type="button" onClick={async () => {
                     const val = parseFloat(document.getElementById('quick_pay').value);
                     const orn = document.getElementById('or_num').value;
                     if (!isNaN(val) && val > 0 && orn.trim() !== '') {
                       const payload = { amount: val, or_number: orn.trim(), date_recorded: new Date().toISOString() };
                       const res = await authFetch(`${API}/tuition/${editingTuition.id}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                       if(res?.ok) {
                         const n = await res.json();
                         const nPaid = editingTuition.amount_paid + val;
                         let nStatus = editingTuition.status;
                         if(nPaid >= editingTuition.amount_due) nStatus = 'Paid';
                         setEditingTuition({...editingTuition, amount_paid: nPaid, status: nStatus, payments: [...(editingTuition.payments||[]), n]});
                         document.getElementById('quick_pay').value = '';
                         document.getElementById('or_num').value = '';
                         fetchData();
                       }
                     }
                   }} className="px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-md hover:bg-brand-700 transition">Save Payment & Record O.R.</button>
                 </div>
                 
                 {/* Transaction History Log inside modal */}
                 {editingTuition.payments && editingTuition.payments.length > 0 && (
                   <div className="mt-4 pt-3 border-t border-brand-200/50 dark:border-brand-800/50">
                     <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Transaction Log</h4>
                     <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                       {editingTuition.payments.map((p, idx) => (
                         <li key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-100 dark:border-slate-700 shadow-sm">
                           <span className="font-bold text-slate-700 dark:text-slate-300">O.R. {p.or_number}</span>
                           <div className="text-right">
                             <div className="font-bold text-green-600 dark:text-green-400">+₱{p.amount.toLocaleString()}</div>
                             <div className="text-[9px] text-slate-400">{new Date(p.date_recorded).toLocaleDateString()}</div>
                           </div>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Pipeline</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-bold" value={editingTuition.status} onChange={e => setEditingTuition({...editingTuition, status:e.target.value})}>
                  {['Paid','Pending','Overdue'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setEditingTuition(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition">Commit Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
