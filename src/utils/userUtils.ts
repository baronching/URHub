import { User, UserRole } from '../types';

export function isGuest(_user?: User | null): boolean {
  return false;
}

export function isStudent(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'student') return true;
  if (user.role === 'student_faculty' && user.userType !== 'Faculty' && !user.name?.startsWith('Prof.') && !user.name?.startsWith('Dr.')) {
    return true;
  }
  return false;
}

export function isProgramChair(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'program_chair') return true;
  if (user.role === 'student_faculty' && (user.userType === 'Faculty' || user.name?.startsWith('Prof.'))) {
    return true;
  }
  return false;
}

export function isDean(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'dean';
}

export function isUreliaPersonnel(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'urelia_personnel';
}

export function isUreliaDirector(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'urelia_director' || (user.role === 'admin' && Boolean(user.email?.toLowerCase().includes('director')));
}

export function isUreliaAdmin(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'urelia_admin' || user.role === 'super_admin';
}

// URELIA Office Staff (Personnel, Director, or Admin)
export function isUrelia(user?: User | null): boolean {
  if (!user) return false;
  return isUreliaAdmin(user) || isUreliaDirector(user) || isUreliaPersonnel(user) || user.role === 'super_admin' || user.role === 'admin';
}

// Academic Leads & Faculty (Program Chair, Dean, or Faculty/Admin)
export function isFacultyAdmin(user?: User | null): boolean {
  if (!user) return false;
  return (
    isProgramChair(user) ||
    isDean(user) ||
    user.role === 'admin' ||
    user.userType === 'Faculty' ||
    user.userType === 'Faculty_Admin' ||
    Boolean(user.name && (/^(Prof\.|Dr\.)/i.test(user.name.trim())))
  );
}

// ==========================================
// ROLE PERMISSION CHECKS (6 Authenticated Roles)
// ==========================================

// Students CANNOT view unpublished research; Chairs, Deans, & URELIA can
export function canViewUnpublished(user?: User | null): boolean {
  if (!user || isStudent(user)) return false;
  return true;
}

// Research submission is authorized for Program Chairs, Deans, and URELIA
export function canSubmitResearch(user?: User | null): boolean {
  if (!user || isStudent(user)) return false;
  return true;
}

// Review Queue access: Program Chairs, Deans, URELIA Personnel, Director, & Admin
export function canReviewSubmissions(user?: User | null): boolean {
  if (!user || isStudent(user)) return false;
  return true;
}

// Analytics & Reports: Deans, URELIA Personnel, URELIA Director, & URELIA Admin
export function canViewAnalytics(user?: User | null): boolean {
  if (!user || isStudent(user)) return false;
  return isDean(user) || isUrelia(user);
}

// User Management & System Settings: exclusively URELIA Admin
export function canManageUsers(user?: User | null): boolean {
  if (!user) return false;
  return isUreliaAdmin(user);
}

export function getUserRoleDisplayLabel(userOrRole?: User | UserRole | string): string {
  if (!userOrRole) return 'Student';

  let roleStr = '';
  if (typeof userOrRole === 'object') {
    roleStr = userOrRole.role || userOrRole.userType || '';
  } else {
    roleStr = String(userOrRole);
  }

  const normalized = String(roleStr).trim().toLowerCase();

  switch (normalized) {
    case 'student':
      return 'Student';
    case 'program_chair':
    case 'chair':
      return 'Program Chair';
    case 'dean':
      return 'College Dean';
    case 'urelia_personnel':
    case 'research_personnel':
    case 'personnel':
      return 'URELIA / Research Personnel';
    case 'urelia_director':
    case 'director':
      return 'URELIA Director';
    case 'urelia_admin':
      return 'URELIA Admin';
    case 'super_admin':
      return 'URELIA Admin';
    case 'admin':
      return 'Faculty / Admin';
    case 'student_faculty':
      return 'Student';
    default:
      return roleStr || 'Student';
  }
}

export function getRoleBadgeClass(role?: UserRole | string): string {
  const norm = String(role || '').toLowerCase();
  if (norm === 'urelia_admin' || norm === 'super_admin') {
    return 'bg-amber-400/20 text-amber-300 border border-amber-400/40';
  }
  if (norm === 'urelia_director') {
    return 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/40';
  }
  if (norm === 'urelia_personnel') {
    return 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40';
  }
  if (norm === 'dean') {
    return 'bg-amber-600/30 text-amber-200 border border-amber-500/40';
  }
  if (norm === 'program_chair') {
    return 'bg-teal-400/20 text-teal-200 border border-teal-400/40';
  }
  if (norm === 'student') {
    return 'bg-slate-400/20 text-slate-200 border border-slate-400/30';
  }
  return 'bg-slate-400/20 text-slate-200 border border-slate-400/30';
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
