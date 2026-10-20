/**
 * User formatting and role helper utilities
 */

import { UserRole, User } from '../types';

export function getUserRoleDisplayLabel(roleOrUser?: UserRole | string | { role?: UserRole | string; userType?: string }): string {
  if (typeof roleOrUser === 'object' && roleOrUser !== null) {
    if (roleOrUser.role === 'super_admin' || (roleOrUser.role as string) === 'URELIA') {
      return 'URELIA';
    }
    if (
      roleOrUser.role === 'admin' ||
      roleOrUser.userType === 'Faculty_Admin' ||
      (roleOrUser.role as string) === 'Faculty/Admin' ||
      (roleOrUser.role as string) === 'Faculty'
    ) {
      return 'Faculty/Admin';
    }
    return 'Student';
  }

  const role = roleOrUser;
  if (role === 'super_admin' || role === 'URELIA') {
    return 'URELIA';
  }
  if (role === 'admin' || role === 'Faculty_Admin' || role === 'Faculty/Admin' || role === 'Faculty') {
    return 'Faculty/Admin';
  }
  return 'Student';
}

export function isUrelia(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin' || (user.role as string) === 'URELIA';
}

export function isFacultyAdmin(user?: User | null): boolean {
  if (!user) return false;
  if (isUrelia(user)) return false;
  return (
    user.role === 'admin' ||
    user.userType === 'Faculty_Admin' ||
    (user.role as string) === 'Faculty/Admin' ||
    (user.role as string) === 'Faculty'
  );
}

export function isStudent(user?: User | null): boolean {
  if (!user) return false;
  if (isUrelia(user) || isFacultyAdmin(user)) return false;
  return user.userType === 'Student' || user.role === 'student_faculty';
}

export function canSubmitResearch(user?: User | null): boolean {
  if (!user) return false;
  if (user.userType === 'Student') return false;
  return isUrelia(user) || isFacultyAdmin(user);
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
