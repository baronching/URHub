import { UDMCollege, UDM_COLLEGES, User, UserRole } from '../types';

export const URELIA_OFFICE_COLLEGE: UDMCollege = 'FAC-ADM';
export const ADMINISTRATOR_OF_MAX_LENGTH = 100;

export const ALLOWED_USER_ROLES: UserRole[] = [
  'student',
  'program_chair',
  'dean',
  'urelia_personnel',
  'urelia_director',
  'urelia_admin',
  'researcher',
];

const VALID_COLLEGE_IDS = new Set<string>(UDM_COLLEGES.map(c => c.id));

/**
 * Returns true if the role forces the College / Unit dropdown to be locked to the URELIA office preset.
 */
export function isCollegeLockedRole(role?: string | null): boolean {
  const normalized = String(role || '').trim().toLowerCase();
  return normalized === 'urelia_personnel' || normalized === 'urelia_director';
}

/**
 * Resolves and validates College / Unit for a given role on both frontend and backend.
 * Rejects attempts to bypass the lock on urelia_personnel / urelia_director.
 */
export function resolveCollegeForRole(
  role?: string | null,
  requestedCollege?: unknown
): { valid: boolean; college: UDMCollege; error?: string } {
  const cleanRequested =
    typeof requestedCollege === 'string' ? requestedCollege.trim() : '';

  if (isCollegeLockedRole(role)) {
    if (cleanRequested && cleanRequested !== URELIA_OFFICE_COLLEGE) {
      return {
        valid: false,
        college: URELIA_OFFICE_COLLEGE,
        error:
          'College / Unit is locked to the URELIA Office preset (FAC-ADM) for URELIA Personnel and URELIA Director roles and cannot be manually changed.'
      };
    }
    return { valid: true, college: URELIA_OFFICE_COLLEGE };
  }

  if (!cleanRequested) {
    return { valid: true, college: 'CCS' };
  }

  if (!VALID_COLLEGE_IDS.has(cleanRequested)) {
    return {
      valid: false,
      college: 'CCS',
      error: `Invalid College / Unit "${cleanRequested}".`
    };
  }

  return { valid: true, college: cleanRequested as UDMCollege };
}

/**
 * Validates the required "Administrator of / Where they come from" field when role is 'researcher'.
 * Trims whitespace before validating non-empty and max 100 character limit.
 */
export function validateAdministratorOf(
  role?: string | null,
  value?: unknown
): { valid: boolean; value?: string; error?: string } {
  if (String(role || '').trim().toLowerCase() !== 'researcher') {
    return { valid: true, value: undefined };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: '"Administrator of / Where they come from" is required for Researchers.'
    };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error:
        '"Administrator of / Where they come from" cannot be empty or contain only spaces.'
    };
  }

  if (trimmed.length > ADMINISTRATOR_OF_MAX_LENGTH) {
    return {
      valid: false,
      error: `"Administrator of / Where they come from" must not exceed ${ADMINISTRATOR_OF_MAX_LENGTH} characters (currently ${trimmed.length}).`
    };
  }

  return { valid: true, value: trimmed };
}

export function isGuest(_user?: User | null): boolean {
  return false;
}

export function isStudent(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'student') return true;
  if (user.role === 'student_faculty' && user.userType !== 'Faculty') {
    return true;
  }
  return false;
}

export function isResearcher(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'researcher';
}

export function isProgramChair(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'program_chair') return true;
  if (user.role === 'student_faculty' && user.userType === 'Faculty') {
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
  return user.role === 'urelia_director';
}

export function isUreliaAdmin(user?: User | null): boolean {
  if (!user) return false;
  return (
    user.role === 'urelia_admin' ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  );
}

// URELIA Office Staff (Personnel, Director, or Admin)
export function isUrelia(user?: User | null): boolean {
  if (!user) return false;
  return (
    isUreliaAdmin(user) ||
    isUreliaDirector(user) ||
    isUreliaPersonnel(user)
  );
}

// Academic Leads & Faculty (Program Chair, Dean, or Faculty/Admin)
export function isFacultyAdmin(user?: User | null): boolean {
  if (!user) return false;
  return (
    isProgramChair(user) ||
    isDean(user) ||
    user.role === 'admin' ||
    user.userType === 'Faculty' ||
    user.userType === 'Faculty_Admin'
  );
}

// ==========================================
// ROLE PERMISSION CHECKS
// ==========================================

// Only College Deans, URELIA Director, and URELIA Admin can access unpublished researches
export function canViewUnpublished(user?: User | null): boolean {
  if (!user) return false;
  if (
    user.role === 'student' ||
    user.role === 'program_chair' ||
    user.role === 'urelia_personnel' ||
    user.role === 'researcher'
  ) {
    return false;
  }
  return isDean(user) || isUreliaDirector(user) || isUreliaAdmin(user);
}

// Full PDF viewer access:
// All users have full PDF viewer access to any PUBLISHED research paper.
// Unpublished manuscripts are exclusively accessible by College Deans, URELIA Director, and URELIA Admin.
export function canViewFullPaper(user?: User | null, paper?: any | null): boolean {
  if (paper) {
    const isPublished =
      paper.publicationType !== 'unpublished' &&
      (paper.status === 'approved' || (!paper.status && paper.status !== 'pending' && paper.status !== 'rejected'));
    if (isPublished) return true;
  }
  if (!user) return false;
  return canViewUnpublished(user);
}

// Final Archive & Publish approval is exclusively reserved for URELIA (Director / Admin)
export function canDirectPublish(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'urelia_personnel') return false;
  return isUreliaDirector(user) || isUreliaAdmin(user);
}

// Approval and rejection authority check (URELIA Personnel cannot approve/reject because they submit papers too)
export function canApproveOrRejectSubmissions(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'urelia_personnel') return false;
  return isUreliaDirector(user) || isUreliaAdmin(user);
}

// College Deans endorse unpublished paper requests to URELIA
export function canEndorseSubmissions(user?: User | null): boolean {
  if (!user) return false;
  return isDean(user);
}

// Research submission is authorized for Program Chairs, Deans, URELIA staff, and Researchers (published only)
export function canSubmitResearch(user?: User | null): boolean {
  if (!user || isStudent(user)) return false;
  return (
    isProgramChair(user) ||
    isDean(user) ||
    isUrelia(user) ||
    isResearcher(user)
  );
}

// Review Queue access: Program Chairs, Deans, URELIA Personnel, Director, & Admin
export function canReviewSubmissions(user?: User | null): boolean {
  if (!user || isStudent(user) || isResearcher(user)) return false;
  return isProgramChair(user) || isDean(user) || isUrelia(user);
}

// Analytics & Reports: Deans, URELIA Personnel, URELIA Director, & URELIA Admin
export function canViewAnalytics(user?: User | null): boolean {
  if (!user || isStudent(user) || isResearcher(user)) return false;
  return isDean(user) || isUrelia(user);
}

// User Management & System Settings: exclusively URELIA Admin
export function canManageUsers(user?: User | null): boolean {
  if (!user) return false;
  return isUreliaAdmin(user);
}

export function getUserRoleDisplayLabel(userOrRole?: User | UserRole | string | null): string {
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
      return 'URELIA Personnel';
    case 'urelia_director':
    case 'director':
      return 'URELIA Director';
    case 'urelia_admin':
      return 'URELIA Admin';
    case 'researcher':
      return 'Researcher';
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

export function getRoleBadgeClass(role?: UserRole | string | null): string {
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
  if (norm === 'researcher') {
    return 'bg-sky-400/20 text-sky-200 border border-sky-400/40';
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

/**
 * Sanitizes external or local resource URLs to prevent javascript:, data:, or vbscript: XSS payloads.
 */
export function sanitizeSafeUrl(
  rawUrl?: string | null,
  allowLocalUploadAndBlob: boolean = false
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Reject protocol-relative redirects (//evil.com) and control chars
  if (trimmed.startsWith('//') || /[\x00-\x1f\x7f]/.test(trimmed)) {
    return '';
  }

  if (allowLocalUploadAndBlob) {
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }

  return '';
}

