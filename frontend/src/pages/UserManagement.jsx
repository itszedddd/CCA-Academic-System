import { useState, useEffect } from 'react';

const API = '/api';

export default function UserManagement({ authFetch, currentRole }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'Principal', student_id: '', is_active: 1, section: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await authFetch(`${API}/users/`);
    if (res?.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'Principal', student_id: '', is_active: 1, section: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role, 
      student_id: user.student_id || '', 
      is_active: user.is_active,
      section: user.section || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    const res = await authFetch(`${API}/users/${id}`, { method: 'DELETE' });
    if (res?.ok) fetchUsers();
    else alert("Failed to delete user. You cannot delete your currently active account.");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      student_id: formData.student_id ? parseInt(formData.student_id) : null,
      is_active: parseInt(formData.is_active),
      section: formData.role === 'Teacher' ? (formData.section || null) : null
    };
    
    if (editingUser) {
      await authFetch(`${API}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      if (!payload.password) {
        alert("Password is required for new accounts");
        return;
      }
      await authFetch(`${API}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setShowModal(false);
    fetchUsers();
  };

  if (currentRole !== 'Superadmin') {
    return <div className="p-8 text-center text-red-500 font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-brand-900 to-brand-700 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg border border-brand-800 dark:border-slate-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center mb-1">
              <svg className="w-5 h-5 mr-2 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <h2 className="text-xl font-extrabold font-cinzel tracking-widest text-white">System User Controls</h2>
            </div>
            <p className="text-sm text-brand-200 dark:text-slate-400 font-medium">Master registry of all authenticated accounts in the CCA network.</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition font-bold shadow flex items-center text-sm backdrop-blur-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Mint System User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role Clearance</th>
                <th className="px-6 py-4">Assigned Section</th>
                <th className="px-6 py-4">Student Link</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">#{u.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.role === 'Principal' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      u.role === 'Teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      u.role === 'Cashier' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      u.role === 'Registrar' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {u.role === 'Teacher' ? (
                      u.section 
                        ? <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs font-bold">{u.section}</span>
                        : <span className="text-slate-400 italic text-xs">No section</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {u.student_id ? `Linked (ID: ${u.student_id})` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-xs font-bold ${u.is_active === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${u.is_active === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {u.is_active === 1 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEditModal(u)} className="text-brand-600 hover:text-brand-800 text-sm font-bold transition">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 text-sm font-bold transition">Revoke</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">No accounts indexed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingUser ? 'Edit System Profile' : 'Mint System Access'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Username</label>
                <input required className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {editingUser ? 'Reset Password (optional)' : 'Set Password'}
                </label>
                <input type="password" required={!editingUser} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-semibold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  {['Superadmin', 'Principal', 'Teacher', 'Registrar', 'Admission', 'Cashier', 'Student', 'Parent'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              
              {formData.role === 'Teacher' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Assigned Section
                  </label>
                  <select 
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-semibold" 
                    value={formData.section} 
                    onChange={e => setFormData({...formData, section: e.target.value})}
                  >
                    <option value="">— None —</option>
                    {['Humility', 'Courage', 'Goodwill', 'Persistence'].map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Must match a section name used on student profiles.</p>
                </div>
              )}

              {formData.role === 'Student' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Link to Student ID</label>
                  <input type="number" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} placeholder="e.g. 1" />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Account Active</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-semibold" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value})}>
                  <option value={1}>Active</option>
                  <option value={0}>Suspended</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition">{editingUser ? 'Save Mutations' : 'Create Access'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
