import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, SystemSettings, UDMCollege, UDM_COLLEGES } from '../types';
import { INITIAL_SYSTEM_SETTINGS } from '../data/mockDatabase';
import {
  getUserRoleDisplayLabel,
  isCollegeLockedRole,
  validateAdministratorOf,
  resolveCollegeForRole,
  URELIA_OFFICE_COLLEGE,
  ADMINISTRATOR_OF_MAX_LENGTH
} from '../utils/userUtils';
import {
  subscribeToUsers,
  updateUserRole,
  adminCreateUser,
  adminUpdateUser,
  subscribeToSystemSettings,
  saveSystemSettings,
  getAuthHeaders
} from '../services/supabaseService';
import {
  Settings,
  Users,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Edit3,
  Lock,
  Building2,
  Filter,
  X
} from 'lucide-react';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'program_chair', label: 'Program Chair' },
  { value: 'dean', label: 'College Dean' },
  { value: 'urelia_personnel', label: 'URELIA / Research Personnel' },
  { value: 'urelia_director', label: 'URELIA Director' },
  { value: 'urelia_admin', label: 'URELIA Admin' },
  { value: 'researcher', label: 'Researcher' }
];

export const SuperAdminManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Add / Edit User Modal State
  const [modalMode, setModalMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingUserId, setEditingUserId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formCollege, setFormCollege] = useState<UDMCollege>('CCS');
  const [formAdministratorOf, setFormAdministratorOf] = useState('');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formCourseProgram, setFormCourseProgram] = useState('');
  const [formError, setFormError] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  useEffect(() => {
    const unsubUsers = subscribeToUsers((liveUsers) => {
      setUsers(liveUsers);
      setIsLoading(false);
    });

    const unsubSettings = subscribeToSystemSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    return () => {
      unsubUsers();
      unsubSettings();
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter(u => u.role === roleFilter);
  }, [users, roleFilter]);

  const showToast = (message: string, isError = false) => {
    if (isError) {
      setErrorMsg(message);
      setMsg('');
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setMsg(message);
      setErrorMsg('');
      setTimeout(() => setMsg(''), 3500);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUserId('');
    setFormFullName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('student');
    setFormCollege('CCS');
    setFormAdministratorOf('');
    setFormIdNumber('');
    setFormCourseProgram('');
    setFormError('');
  };

  const openEditModal = (user: User, overrideRole?: UserRole) => {
    const nextRole = overrideRole || user.role;
    const lockedCollege = isCollegeLockedRole(nextRole)
      ? URELIA_OFFICE_COLLEGE
      : (user.college || 'CCS');
    setModalMode('edit');
    setEditingUserId(user.userID);
    setFormFullName(user.fullName || user.name || '');
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormRole(nextRole);
    setFormCollege(lockedCollege);
    setFormAdministratorOf(nextRole === 'researcher' ? (user.administratorOf || '') : '');
    setFormIdNumber(user.idNumber || '');
    setFormCourseProgram(user.courseProgram || user.course || '');
    setFormError(
      overrideRole === 'researcher' && !(user.administratorOf || '').trim()
        ? 'Please specify "Administrator of / Where they come from" before saving the Researcher role.'
        : ''
    );
  };

  const handleModalRoleChange = (nextRole: UserRole) => {
    setFormRole(nextRole);
    if (isCollegeLockedRole(nextRole)) {
      setFormCollege(URELIA_OFFICE_COLLEGE);
    }
    setFormError('');
  };

  const handleUserModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = formFullName.trim();
    if (!cleanName) {
      setFormError('Full Name is required.');
      return;
    }

    const adminOfCheck = validateAdministratorOf(formRole, formAdministratorOf);
    if (!adminOfCheck.valid) {
      setFormError(adminOfCheck.error || 'Please provide a valid Researcher organization/unit.');
      return;
    }

    const collegeCheck = resolveCollegeForRole(
      formRole,
      isCollegeLockedRole(formRole) ? URELIA_OFFICE_COLLEGE : formCollege
    );
    if (!collegeCheck.valid) {
      setFormError(collegeCheck.error || 'Invalid College / Unit selected.');
      return;
    }

    setIsSavingUser(true);
    try {
      if (modalMode === 'create') {
        const cleanEmail = formEmail.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }
        if (formPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        await adminCreateUser({
          fullName: cleanName,
          email: cleanEmail,
          password: formPassword,
          role: formRole,
          college: collegeCheck.college,
          administratorOf: formRole === 'researcher' ? adminOfCheck.value : undefined,
          idNumber: formIdNumber.trim(),
          courseProgram: formCourseProgram.trim()
        });
        showToast('New user account created and persisted securely.');
      } else if (modalMode === 'edit') {
        await adminUpdateUser(editingUserId, {
          fullName: cleanName,
          role: formRole,
          college: collegeCheck.college,
          administratorOf: formRole === 'researcher' ? adminOfCheck.value : undefined,
          idNumber: formIdNumber.trim(),
          courseProgram: formCourseProgram.trim()
        });
        showToast('User account updated successfully.');
      }
      setModalMode('closed');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save user account.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleRoleUpdate = async (user: User, role: UserRole) => {
    // Switching inline to Researcher without existing administratorOf requires filling the required field
    if (role === 'researcher' && !(user.administratorOf || '').trim()) {
      openEditModal(user, 'researcher');
      return;
    }

    try {
      await updateUserRole(user.userID, role, user.administratorOf);
      showToast('User role updated successfully.');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to update user role.', true);
    }
  };

  const handleSettingsSave = async () => {
    if (!settings) return;
    try {
      await saveSystemSettings(settings);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(settings)
      }).catch(() => null);
      if (res && !res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to persist system settings.');
      }
      showToast('System settings saved successfully.');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to save system settings.', true);
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2">
          {msg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#1a4731] hover:bg-[#123323] text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4 text-[#c9a84c]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-[#1a4731] flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#1a4731]" />
            <span>User Accounts & Role Permissions ({filteredUsers.length} of {users.length})</span>
          </h3>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <label htmlFor="admin-role-filter" className="text-xs font-bold text-slate-600">
              Filter Role:
            </label>
            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as 'ALL' | UserRole)}
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#1a4731] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Name & Affiliation</th>
                <th className="p-3">UDM Email</th>
                <th className="p-3">College</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.userID} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-[#1a4731] font-bold">{u.userID}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] font-bold text-[#1a4731] bg-[#1a4731]/10 px-2 py-0.5 rounded w-max mt-0.5 border border-[#1a4731]/20">
                      {getUserRoleDisplayLabel(u)}
                    </div>
                    {u.role === 'researcher' && u.administratorOf && (
                      <div className="text-[10px] text-slate-600 mt-1 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-[#1a4731]" />
                        <span>Admin of: <strong className="text-slate-800">{u.administratorOf}</strong></span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3 font-mono text-slate-700">
                    {isCollegeLockedRole(u.role) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-2.5 h-2.5" /> {URELIA_OFFICE_COLLEGE}
                      </span>
                    ) : (
                      u.college || 'CCS'
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleUpdate(u, e.target.value as UserRole)}
                      className="bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-1.5 focus:outline-none cursor-pointer font-medium text-xs"
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No user accounts match the selected role filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {modalMode !== 'closed' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
          onClick={() => setModalMode('closed')}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#1a4731] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {modalMode === 'create' ? (
                  <UserPlus className="w-5 h-5 text-[#c9a84c]" />
                ) : (
                  <Edit3 className="w-5 h-5 text-[#c9a84c]" />
                )}
                <h3 className="text-sm font-bold tracking-wide">
                  {modalMode === 'create' ? 'Add New Institutional User' : 'Edit User Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('closed')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUserModalSubmit} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={modalMode === 'edit'}
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="user@udm.edu.ph"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Institutional Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={e => handleModalRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer font-medium"
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <span>College / Unit *</span>
                    {isCollegeLockedRole(formRole) && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded font-bold normal-case">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </label>
                  <select
                    value={isCollegeLockedRole(formRole) ? URELIA_OFFICE_COLLEGE : formCollege}
                    onChange={e => {
                      if (!isCollegeLockedRole(formRole)) {
                        setFormCollege(e.target.value as UDMCollege);
                      }
                    }}
                    disabled={isCollegeLockedRole(formRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    {UDM_COLLEGES.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.id} - {col.name}
                      </option>
                    ))}
                  </select>
                  {isCollegeLockedRole(formRole) && (
                    <p className="text-[10px] text-amber-700 font-medium mt-1">
                      Locked to URELIA Office (FAC-ADM) for URELIA Personnel & Director.
                    </p>
                  )}
                </div>
              </div>

              {formRole === 'researcher' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Administrator of / Where they come from *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formAdministratorOf.trim().length}/{ADMINISTRATOR_OF_MAX_LENGTH}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={ADMINISTRATOR_OF_MAX_LENGTH}
                    value={formAdministratorOf}
                    onChange={e => setFormAdministratorOf(e.target.value)}
                    placeholder="e.g., Office of the Vice President for Research / CCS Extension Unit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Required text field (max {ADMINISTRATOR_OF_MAX_LENGTH} characters). Published researchers only.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={formIdNumber}
                    onChange={e => setFormIdNumber(e.target.value)}
                    placeholder="FAC-2026-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:border-[#1a4731] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Course / Program
                  </label>
                  <input
                    type="text"
                    value={formCourseProgram}
                    onChange={e => setFormCourseProgram(e.target.value)}
                    placeholder="BS Information Technology"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:border-[#1a4731] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalMode('closed')}
                  disabled={isSavingUser}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 rounded-xl font-bold bg-[#1a4731] hover:bg-[#123323] text-white cursor-pointer disabled:opacity-50"
                >
                  {isSavingUser ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
