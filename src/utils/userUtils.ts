/**
 * User formatting and role helper utilities
 * Standardized Role Labels:
 * - Student -> 'Student'
 * - Faculty -> 'Faculty/Admin'
 * - Super Admin -> 'URELIA'
 */

import { UserRole, User } from '../types';

/**
 * Standardized role display label mapping:
 * - Student -> 'Student'
 * - Faculty -> 'Faculty/Admin'
 * - Super Admin -> 'URELIA'
 */
export function getUserRoleDisplayLabel(roleOrUser?: UserRole | string | User | null): string {
  if (!roleOrUser) return 'Guest';

  // If user object passed
  if (typeof roleOrUser === 'object') {
    const u = roleOrUser as User;
    if (isUreliaUser(u)) {
      return 'URELIA';
    }
    if (isFacultyUser(u)) {
      return 'Faculty/Admin';
    }
    return 'Student';
  }

  // If string/role value passed
  const r = String(roleOrUser).toLowerCase().trim();
  if (r === 'super_admin' || r === 'super admin' || r === 'admin' || r === 'urelia') {
    return 'URELIA';
  }
  if (r === 'faculty' || r === 'faculty_admin' || r === 'faculty/admin' || r.includes('faculty')) {
    return 'Faculty/Admin';
  }
  if (r === 'student' || r === 'student_faculty') {
    return 'Student';
  }
  return 'Student';
}

/**
 * Checks if user has central URELIA Super Admin privileges
 */
export function isUreliaUser(user?: User | null): boolean {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  const userType = String(user.userType || '').toLowerCase();
  return (
    role === 'super_admin' ||
    role === 'super admin' ||
    role === 'admin' ||
    userType === 'super admin' ||
    userType === 'urelia' ||
    user.email?.toLowerCase().includes('.urelia@') ||
    user.email?.toLowerCase().startsWith('sysadmin@')
  );
}

/**
 * Checks if user is authenticated Faculty/Admin
 */
export function isFacultyUser(user?: User | null): boolean {
  if (!user) return false;
  if (isUreliaUser(user)) return false;

  const role = String(user.role || '').toLowerCase();
  const userType = String(user.userType || '').toLowerCase();

  return (
    userType === 'faculty_admin' ||
    userType === 'faculty' ||
    userType === 'faculty/admin' ||
    userType.includes('faculty') ||
    role === 'faculty' ||
    role === 'faculty_admin' ||
    role === 'faculty/admin' ||
    role.includes('faculty') ||
    user.email?.toLowerCase().startsWith('faculty@') ||
    user.email?.toLowerCase().startsWith('prof.') ||
    user.name?.toLowerCase().startsWith('prof.') ||
    user.name?.toLowerCase().startsWith('dr.')
  );
}

/**
 * Checks if user is Student
 */
export function isStudentUser(user?: User | null): boolean {
  if (!user) return false;
  return !isUreliaUser(user) && !isFacultyUser(user);
}

/**
 * Authorization check for research submission:
 * Only Faculty/Admin and URELIA may submit research.
 * Students and Guests are strictly unauthorized.
 */
export function canSubmitResearch(user?: User | null): boolean {
  if (!user) return false;
  return isUreliaUser(user) || isFacultyUser(user);
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
