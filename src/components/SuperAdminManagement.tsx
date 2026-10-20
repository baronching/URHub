import React, { useState, useEffect } from 'react';
import { User, UserRole, SystemSettings, UDMCollege, UDM_COLLEGES } from '../types';
import { INITIAL_USERS, INITIAL_SYSTEM_SETTINGS } from '../data/mockDatabase';
import { getUserRoleDisplayLabel } from '../utils/userUtils';
import {
  subscribeToUsers,
  updateUserRole,
  subscribeToSystemSettings,
  saveSystemSettings
} from '../services/supabaseService';
import { Settings, Users, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const SuperAdminManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // 1. Subscribe to live Supabase users (includes all accounts created before or now)
    const unsubUsers = subscribeToUsers((liveUsers) => {
      setUsers(liveUsers);
      setIsLoading(false);
    });

    // 2. Subscribe to live system settings
    const unsubSettings = subscribeToSystemSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    return () => {
      unsubUsers();
      unsubSettings();
    };
  }, []);

  const handleRoleUpdate = async (userID: string, role: UserRole) => {
    try {
      await updateUserRole(userID, role);
      // Also notify backend if online
      fetch(`/api/admin/users/${userID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      }).catch(() => {});

      setMsg('User role updated successfully in Supabase.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to update user role.');
    }
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    try {
      await saveSystemSettings(settings);
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(() => {});
      setMsg('System settings saved successfully.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading System Administration Portal...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              URELIA User & Role Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional oversight of Role-Based Access Control (RBAC), system settings, and research archive security.
          </p>
        </div>

        {msg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}
      </div>

      {/* User Management Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1a4731] flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#1a4731]" />
          <span>User Accounts & Role Permissions ({users.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">UDM Email</th>
                <th className="p-3">College</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u.userID} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-[#1a4731] font-bold">{u.userID}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] font-bold text-[#1a4731] bg-[#1a4731]/10 px-2 py-0.5 rounded w-max mt-0.5 border border-[#1a4731]/20">
                      {getUserRoleDisplayLabel(u)}
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3 font-mono text-slate-700">{u.college || 'CCS'}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleUpdate(u.userID, e.target.value as UserRole)}
                      className="bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-1.5 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="student_faculty">Student</option>
                      <option value="admin">Faculty/Admin</option>
                      <option value="super_admin">URELIA</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Settings Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1a4731] flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#1a4731]" />
          <span>UDM System Configuration Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Allowed UDM Email Domains (Comma Separated)</label>
            <input
              type="text"
              value={settings.allowedDomains.join(', ')}
              onChange={e => setSettings({
                ...settings,
                allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
              })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Max PDF Upload Size (MB)</label>
            <input
              type="number"
              value={settings.maxPdfUploadMb}
              onChange={e => setSettings({ ...settings, maxPdfUploadMb: parseInt(e.target.value, 10) || 25 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Content-Based ML Weight (0.0 to 1.0)</label>
            <input
              type="number"
              step="0.1"
              value={settings.contentBasedWeight}
              onChange={e => setSettings({ ...settings, contentBasedWeight: parseFloat(e.target.value) || 0.6 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Collaborative Filtering Weight (0.0 to 1.0)</label>
            <input
              type="number"
              step="0.1"
              value={settings.collaborativeWeight}
              onChange={e => setSettings({ ...settings, collaborativeWeight: parseFloat(e.target.value) || 0.4 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleSettingsSave}
          className="px-5 py-2.5 bg-[#1a4731] hover:bg-[#123323] text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4 text-[#c9a84c]" />
          <span>Save System Settings</span>
        </button>
      </div>
    </div>
  );
};
