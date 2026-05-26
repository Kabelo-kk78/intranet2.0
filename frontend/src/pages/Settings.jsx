import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', department: '', position: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const u = res.data || {};
        setProfile({ name: u.name || '', email: u.email || '', department: u.department || '', position: u.position || '' });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(null); setError(null);
    try {
      await api.put('/auth/profile', { name: profile.name, department: profile.department, position: profile.position });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match'); return;
    }
    setSaving(true); setMessage(null); setError(null);
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setMessage('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage your profile and account security</p>
        </header>

        {/* Messages (full width) */}
        <div className="space-y-3 mb-6">
          {message && (
            <div className="w-full p-3 bg-green-100 text-green-800 rounded-lg shadow-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="w-full p-3 bg-red-100 text-red-700 rounded-lg shadow-sm">
              {error}
            </div>
          )}
        </div>

        {/* Grid: two columns on large screens, single column on small */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>

            {loadingProfile ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={e => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={profile.position || ''}
                    onChange={e => setProfile({ ...profile, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Optional: footer spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
