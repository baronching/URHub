/**
 * User formatting and role helper utilities
 */

import { UserRole } from '../types';

export function getUserRoleDisplayLabel(role?: UserRole | string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin (URELIA)';
    case 'admin':
      return 'URELIA Reviewer / Admin';
    case 'student_faculty':
    default:
      return 'Student / Faculty Researcher';
  }
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
