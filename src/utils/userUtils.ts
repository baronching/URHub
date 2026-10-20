import { User, UserRole } from '../types';

export function isUrelia(user?: User | null): boolean {
  return Boolean(user && user.role === 'super_admin');
}

export function isFacultyAdmin(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return false;
  return user.userType === 'Faculty' || user.userType === 'Faculty_Admin' || user.role === 'admin';
}

export function isStudent(user?: User | null): boolean {
  if (!user) return false;
  return !isUrelia(user) && !isFacultyAdmin(user);
}

export function canSubmitResearch(user?: User | null): boolean {
  return isUrelia(user) || isFacultyAdmin(user);
}

export function getUserRoleDisplayLabel(userOrRole?: User | UserRole | string): string {
  if (!userOrRole) return 'Student';

  if (typeof userOrRole === 'object') {
    if (isUrelia(userOrRole)) return 'URELIA';
    if (isFacultyAdmin(userOrRole)) return 'Faculty/Admin';
    return 'Student';
  }

  const roleStr = String(userOrRole).trim().toLowerCase();
  if (roleStr === 'super_admin' || roleStr === 'urelia') {
    return 'URELIA';
  }
  if (
    roleStr === 'admin' ||
    roleStr === 'faculty' ||
    roleStr === 'faculty_admin' ||
    roleStr === 'faculty/admin'
  ) {
    return 'Faculty/Admin';
  }
  return 'Student';
}

export function formatUserDisplayName(name?: string, email?: string): string {
  if (name && name.trim()) {
    return name.trim();
  }
  if (email && email.includes('@')) {
    return email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();
  }
  return 'UDM Researcher';
}
