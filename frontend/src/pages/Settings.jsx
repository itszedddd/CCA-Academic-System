import { useState } from 'react';

const API = '/api';

export default function Settings({ user, authFetch }) {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profile_picture || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', type: '' });

    if (!passwordForm.currentPassword) {
      setStatusMsg({ text: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setStatusMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ old_password: passwordForm.currentPassword, new_password: passwordForm.newPassword })
      });
      if (res.ok) {
        setStatusMsg({ text: 'Password updated successfully.', type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        setStatusMsg({ text: data.detail || 'Failed to update password. Verify your current password.', type: 'error' });
      }
    } catch (e) {
      setStatusMsg({ text: 'Network error.', type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePicFile) {
      setStatusMsg({ text: 'Please select an image file first.', type: 'error' });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', profilePicFile);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users/${user.id}/upload_profile_picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        setStatusMsg({ text: 'Profile picture updated successfully!', type: 'success' });
        setProfilePicFile(null);
      } else {
        setStatusMsg({ text: 'Failed to upload profile picture.', type: 'error' });
      }
    } catch (e) {
      setStatusMsg({ text: 'Network error.', type: 'error' });
    }
  };

  const canEditProfilePic = user?.role === 'Teacher' || user?.role === 'Student';

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-2xl font-black font-cinzel tracking-wider text-slate-800 dark:text-white mb-2">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your account credentials and personal preferences.</p>

        {statusMsg.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Change Password */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter current password" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="••••••••" 
                />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow transition">
                Update Password
              </button>
            </form>
          </div>

          {/* Change Profile Picture */}
          {canEditProfilePic && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Change Profile Picture
              </h3>
              <form onSubmit={handleProfilePicUpload} className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-md" alt="Profile Preview" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {user?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Choose Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 dark:file:bg-brand-900/30 file:text-brand-700 dark:file:text-brand-300 file:font-bold hover:file:bg-brand-100 dark:hover:file:bg-brand-800/40 cursor-pointer border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
                <button type="submit" disabled={!profilePicFile} className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow transition">
                  Upload Profile Picture
                </button>
              </form>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
