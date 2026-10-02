import { User } from '../types';

/**
 * Strips any trailing parenthetical roles or suffixes (e.g. "(URELIA Coordinator)" or "(UDM Admin)")
 * to guarantee clean display of the user's name without redundant role repetition.
 */
export function formatUserDisplayName(name: string | null | undefined): string {
  if (!name) return 'UDM User';
  return name.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Returns the exact dynamic role label for a user profile
 * Standardized across UDM-ResearchHub: "Student", "Faculty", "Research Admin", "Super Admin"
 */
export function getUserRoleDisplayLabel(user: User | null | undefined): string {
  if (!user) return 'Guest';

  // 1. Super Admin Role
  if (user.role === 'super_admin' || (user.role as string) === 'Super Admin') {
    return 'Super Admin';
  }

  // 2. Research Admin Role
  if (user.role === 'admin' || (user.role as string) === 'Research Admin' || (user.role as string) === 'Admin') {
    return 'Research Admin';
  }

  // 3. Explicit Faculty userType or role
  if (
    user.userType === 'Faculty' ||
    user.role === ('Faculty' as any) ||
    user.role === ('faculty' as any)
  ) {
    return 'Faculty';
  }

  // 4. Explicit Student userType or role
  if (
    user.userType === 'Student' ||
    user.role === ('Student' as any) ||
    user.role === ('student' as any)
  ) {
    return 'Student';
  }

  // 5. Academic title heuristic fallback for initial institutional users
  if (user.name?.startsWith('Prof.') || user.name?.startsWith('Dr.')) {
    return 'Faculty';
  }

  // 6. UserType property fallback
  if (user.userType) {
    return user.userType;
  }

  // Default fallback for student_faculty accounts
  return 'Student';
}
