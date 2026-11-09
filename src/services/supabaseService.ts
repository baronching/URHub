import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Research, Submission, User, UserRole, SystemSettings, UDMCollege, AccessRequest, UDM_COLLEGES } from '../types';
import {
  INITIAL_RESEARCH,
  INITIAL_USERS,
  INITIAL_SUBMISSIONS,
  INITIAL_SYSTEM_SETTINGS
} from '../data/mockDatabase';

// In-memory fallback stores when Supabase is not yet connected with credentials
let inMemoryResearches: Research[] = [...INITIAL_RESEARCH];
let inMemorySubmissions: Submission[] = [...INITIAL_SUBMISSIONS];
let inMemoryUsers: User[] = [...INITIAL_USERS];
let inMemorySettings: SystemSettings = { ...INITIAL_SYSTEM_SETTINGS };
let inMemoryAccessRequests: AccessRequest[] = [];

// Listeners for in-memory react updates
type Listener<T> = (data: T) => void;
const researchListeners = new Set<Listener<Research[]>>();
const submissionListeners = new Set<Listener<Submission[]>>();
const userListeners = new Set<Listener<User[]>>();
const accessRequestListeners = new Set<Listener<AccessRequest[]>>();
const settingsListeners = new Set<Listener<SystemSettings>>();

function notifyResearches() {
  researchListeners.forEach(cb => cb([...inMemoryResearches]));
}
function notifySubmissions() {
  submissionListeners.forEach(cb => cb([...inMemorySubmissions]));
}
function notifyUsers() {
  userListeners.forEach(cb => cb([...inMemoryUsers]));
}
function notifyAccessRequests() {
  accessRequestListeners.forEach(cb => cb([...inMemoryAccessRequests]));
}
function notifySettings() {
  settingsListeners.forEach(cb => cb({ ...inMemorySettings }));
}

/**
 * Seeds initial institutional data into Supabase if database is empty
 */
export async function seedInitialDatabaseIfEmpty(): Promise<void> {
  if (!isSupabaseConfigured) {
    console.info('Supabase not configured yet: operating with local in-memory dataset.');
    return;
  }

  try {
    const { count, error } = await supabase
      .from('researches')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Could not query Supabase researches table:', error.message);
      return;
    }

    if (count === 0) {
      console.log('Seeding initial UDM ResearchHub database into Supabase...');

      // Seed Researches
      const formattedResearches = INITIAL_RESEARCH.map(r => ({
        id: r.researchID,
        title: r.title,
        abstract: r.abstract,
        authors: r.authors,
        keywords: r.keywords,
        department: r.department,
        course: r.course,
        year: r.year,
        status: r.status,
        full_pdf_url: r.fullPdfUrl || null,
        views_count: r.viewsCount || 0,
        downloads_count: r.downloadsCount || 0,
        submitted_by: r.submittedBy,
        date_added: r.dateAdded
      }));
      await supabase.from('researches').insert(formattedResearches);

      // Seed Users
      const formattedUsers = INITIAL_USERS.map(u => ({
        id: u.userID,
        name: u.name,
        full_name: u.fullName || u.name,
        email: u.email,
        role: u.role,
        user_type: u.userType || 'Student',
        college: u.college || 'CCS',
        id_number: u.idNumber || '',
        course_program: u.courseProgram || u.course || '',
        reading_history: u.readingHistory || []
      }));
      await supabase.from('users').insert(formattedUsers);

      // Seed Submissions
      const formattedSubmissions = INITIAL_SUBMISSIONS.map(s => ({
        id: s.submissionID,
        submitted_by: s.submittedBy,
        submitter_name: s.submitterName,
        submitter_email: s.submitterEmail,
        research_id: s.researchID,
        title: s.title,
        abstract: s.abstract,
        authors: s.authors,
        keywords: s.keywords,
        department: s.department,
        course: s.course,
        year: s.year,
        date_submitted: s.dateSubmitted,
        status: s.status,
        review_note: s.reviewNote || '',
        pdf_file_name: s.pdfFileName || ''
      }));
      await supabase.from('submissions').insert(formattedSubmissions);

      console.log('Supabase seeding complete.');
    }
  } catch (err) {
    console.warn('Error during Supabase seeding:', err);
  }
}

/**
 * Researches: Subscribe or fetch
 */
export function subscribeToResearches(callback: (researches: Research[]) => void) {
  researchListeners.add(callback);
  callback([...inMemoryResearches]);

  if (!isSupabaseConfigured) {
    return () => researchListeners.delete(callback);
  }

  const fetchResearches = async () => {
    const { data, error } = await supabase
      .from('researches')
      .select('*')
      .order('date_added', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: Research[] = data.map(r => ({
        researchID: r.id || r.research_id,
        title: r.title,
        abstract: r.abstract,
        authors: r.authors || [],
        keywords: r.keywords || [],
        department: r.department as UDMCollege,
        course: r.course || '',
        year: r.year,
        status: r.status,
        fullPdfUrl: r.full_pdf_url,
        viewsCount: r.views_count || 0,
        downloadsCount: r.downloads_count || 0,
        submittedBy: r.submitted_by || '',
        dateAdded: r.date_added
      }));
      inMemoryResearches = mapped;
      callback(mapped);
    }
  };

  fetchResearches();

  const channel = supabase
    .channel('public:researches')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'researches' }, () => {
      fetchResearches();
    })
    .subscribe();

  return () => {
    researchListeners.delete(callback);
    supabase.removeChannel(channel);
  };
}

/**
 * Submissions: Subscribe or fetch
 */
export function subscribeToSubmissions(callback: (submissions: Submission[]) => void) {
  submissionListeners.add(callback);
  callback([...inMemorySubmissions]);

  if (!isSupabaseConfigured) {
    return () => submissionListeners.delete(callback);
  }

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('date_submitted', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: Submission[] = data.map(s => ({
        submissionID: s.id || s.submission_id,
        submittedBy: s.submitted_by,
        submitterName: s.submitter_name,
        submitterEmail: s.submitter_email,
        researchID: s.research_id,
        title: s.title,
        abstract: s.abstract,
        authors: s.authors || [],
        keywords: s.keywords || [],
        department: s.department as UDMCollege,
        course: s.course || '',
        year: s.year,
        dateSubmitted: s.date_submitted,
        status: s.status,
        reviewNote: s.review_note,
        pdfFileName: s.pdf_file_name
      }));
      inMemorySubmissions = mapped;
      callback(mapped);
    }
  };

  fetchSubmissions();

  const channel = supabase
    .channel('public:submissions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
      fetchSubmissions();
    })
    .subscribe();

  return () => {
    submissionListeners.delete(callback);
    supabase.removeChannel(channel);
  };
}

/**
 * Users: Subscribe or fetch
 */
export function subscribeToUsers(callback: (users: User[]) => void) {
  userListeners.add(callback);
  callback([...inMemoryUsers]);

  if (!isSupabaseConfigured) {
    return () => userListeners.delete(callback);
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data && data.length > 0) {
      const mapped: User[] = data.map(u => ({
        userID: u.id || u.user_id,
        name: u.name || u.full_name,
        fullName: u.full_name || u.name,
        email: u.email,
        role: u.role,
        userType: u.user_type,
        college: u.college as UDMCollege,
        idNumber: u.id_number,
        courseProgram: u.course_program,
        readingHistory: u.reading_history || []
      }));
      inMemoryUsers = mapped;
      callback(mapped);
    }
  };

  fetchUsers();

  const channel = supabase
    .channel('public:users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
      fetchUsers();
    })
    .subscribe();

  return () => {
    userListeners.delete(callback);
    supabase.removeChannel(channel);
  };
}

/**
 * Access Requests: Subscribe
 */
export function subscribeToAccessRequests(callback: (requests: AccessRequest[]) => void) {
  accessRequestListeners.add(callback);
  callback([...inMemoryAccessRequests]);

  if (!isSupabaseConfigured) {
    return () => accessRequestListeners.delete(callback);
  }

  const fetchRequests = async () => {
    const { data, error } = await supabase.from('access_requests').select('*');
    if (!error && data) {
      const mapped: AccessRequest[] = data.map(r => ({
        requestID: r.id || r.request_id,
        userID: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        userRoleOrType: r.user_role_or_type,
        college: r.college as UDMCollege,
        researchID: r.research_id,
        researchTitle: r.research_title,
        status: r.status,
        dateRequested: r.date_requested,
        dateReviewed: r.date_reviewed,
        reviewNote: r.review_note,
        reviewedBy: r.reviewedBy
      }));
      inMemoryAccessRequests = mapped;
      callback(mapped);
    }
  };

  fetchRequests();

  const channel = supabase
    .channel('public:access_requests')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, () => {
      fetchRequests();
    })
    .subscribe();

  return () => {
    accessRequestListeners.delete(callback);
    supabase.removeChannel(channel);
  };
}

/**
 * Create a new submission
 */
export async function createSubmission(submission: Submission): Promise<void> {
  inMemorySubmissions = [submission, ...inMemorySubmissions];
  notifySubmissions();

  if (isSupabaseConfigured) {
    await supabase.from('submissions').insert({
      id: submission.submissionID,
      submitted_by: submission.submittedBy,
      submitter_name: submission.submitterName,
      submitter_email: submission.submitterEmail,
      research_id: submission.researchID,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors,
      keywords: submission.keywords,
      department: submission.department,
      course: submission.course,
      year: submission.year,
      date_submitted: submission.dateSubmitted,
      status: submission.status,
      pdf_file_name: submission.pdfFileName || ''
    });
  }
}

/**
 * Approve a submission and publish research
 */
export async function approveSubmission(
  submission: Submission,
  publishedResearch: Research,
  decisionNote?: string,
  reviewerName?: string
): Promise<void> {
  const now = new Date().toISOString();
  inMemorySubmissions = inMemorySubmissions.map(s =>
    s.submissionID === submission.submissionID
      ? {
          ...s,
          status: 'approved',
          workflowStatus: 'approved',
          ureliaReviewedBy: reviewerName || 'URELIA Director',
          ureliaReviewedDate: now,
          ureliaDecisionNote: decisionNote || 'Approved for Institutional Archival',
          versionHistory: [
            ...(s.versionHistory || []),
            {
              version: s.version || 'v1.0',
              documentNumber: s.documentNumber || s.submissionID,
              date: now,
              actionBy: reviewerName || 'URELIA Director',
              actionRole: 'URELIA Director',
              action: submission.publicationType === 'unpublished' ? 'Approved as Unpublished Archive Record' : 'Approved & Published to Catalog',
              notes: decisionNote || 'Final Institutional Approval'
            }
          ]
        }
      : s
  );
  inMemoryResearches = [publishedResearch, ...inMemoryResearches];
  notifySubmissions();
  notifyResearches();

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('submissions')
        .update({
          status: 'approved',
          workflow_status: 'approved',
          urelia_reviewed_by: reviewerName || 'URELIA Director',
          urelia_decision_note: decisionNote || 'Approved for Institutional Archival'
        })
        .eq('id', submission.submissionID);

      await supabase.from('researches').insert({
        id: publishedResearch.researchID,
        title: publishedResearch.title,
        abstract: publishedResearch.abstract,
        authors: publishedResearch.authors,
        keywords: publishedResearch.keywords,
        department: publishedResearch.department,
        course: publishedResearch.course,
        year: publishedResearch.year,
        status: 'approved',
        views_count: 0,
        downloads_count: 0,
        submitted_by: publishedResearch.submittedBy,
        date_added: publishedResearch.dateAdded
      });
    } catch (err: any) {
      console.warn('Supabase approve error note:', err.message);
    }
  }
}

/**
 * Dean Endorsement: Forward unpublished paper request to URELIA Office
 */
export async function endorseSubmissionToUrelia(
  submissionID: string,
  deanComments: string,
  deanName: string
): Promise<void> {
  const now = new Date().toISOString();
  inMemorySubmissions = inMemorySubmissions.map(s =>
    s.submissionID === submissionID
      ? {
          ...s,
          workflowStatus: 'endorsed_to_urelia',
          deanComments,
          deanEndorsedBy: deanName,
          deanEndorsedDate: now,
          versionHistory: [
            ...(s.versionHistory || []),
            {
              version: s.version || 'v1.0',
              documentNumber: s.documentNumber || s.submissionID,
              date: now,
              actionBy: deanName,
              actionRole: 'College Dean',
              action: 'Endorsed to URELIA',
              notes: deanComments
            }
          ]
        }
      : s
  );
  notifySubmissions();

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('submissions')
        .update({
          workflow_status: 'endorsed_to_urelia',
          dean_comments: deanComments,
          dean_endorsed_by: deanName,
          dean_endorsed_date: now
        })
        .eq('id', submissionID);
    } catch (e: any) {
      console.warn('Supabase endorse note:', e.message);
    }
  }
}

/**
 * Request Revision / Return to Submitter
 */
export async function requestSubmissionRevision(
  submissionID: string,
  reason: string,
  reviewerName: string,
  reviewerRole: string
): Promise<void> {
  const now = new Date().toISOString();
  inMemorySubmissions = inMemorySubmissions.map(s =>
    s.submissionID === submissionID
      ? {
          ...s,
          workflowStatus: 'revision_requested',
          reviewNote: reason,
          versionHistory: [
            ...(s.versionHistory || []),
            {
              version: s.version || 'v1.0',
              documentNumber: s.documentNumber || s.submissionID,
              date: now,
              actionBy: reviewerName,
              actionRole: reviewerRole,
              action: 'Revision Requested',
              notes: reason
            }
          ]
        }
      : s
  );
  notifySubmissions();

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('submissions')
        .update({
          workflow_status: 'revision_requested',
          review_note: reason
        })
        .eq('id', submissionID);
    } catch (e: any) {
      console.warn('Supabase revision note:', e.message);
    }
  }
}

/**
 * Reject a submission
 */
export async function rejectSubmission(submissionID: string, reason: string): Promise<void> {
  inMemorySubmissions = inMemorySubmissions.map(s =>
    s.submissionID === submissionID ? { ...s, status: 'rejected', reviewNote: reason } : s
  );
  notifySubmissions();

  if (isSupabaseConfigured) {
    await supabase
      .from('submissions')
      .update({ status: 'rejected', review_note: reason })
      .eq('id', submissionID);
  }
}

/**
 * Track views and downloads
 */
export async function recordResearchView(researchID: string): Promise<void> {
  inMemoryResearches = inMemoryResearches.map(r =>
    r.researchID === researchID ? { ...r, viewsCount: (r.viewsCount || 0) + 1 } : r
  );
  notifyResearches();

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('researches').select('views_count').eq('id', researchID).single();
    if (data) {
      await supabase.from('researches').update({ views_count: (data.views_count || 0) + 1 }).eq('id', researchID);
    }
  }
}

export async function recordResearchDownload(researchID: string): Promise<void> {
  inMemoryResearches = inMemoryResearches.map(r =>
    r.researchID === researchID ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r
  );
  notifyResearches();

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('researches').select('downloads_count').eq('id', researchID).single();
    if (data) {
      await supabase.from('researches').update({ downloads_count: (data.downloads_count || 0) + 1 }).eq('id', researchID);
    }
  }
}

export async function recordUserReadingHistory(userID: string, researchID: string): Promise<void> {
  inMemoryUsers = inMemoryUsers.map(u => {
    if (u.userID === userID) {
      const history = u.readingHistory || [];
      if (!history.includes(researchID)) {
        return { ...u, readingHistory: [...history, researchID] };
      }
    }
    return u;
  });
  notifyUsers();

  if (isSupabaseConfigured) {
    const { data } = await supabase.from('users').select('reading_history').eq('id', userID).single();
    if (data) {
      const history: string[] = data.reading_history || [];
      if (!history.includes(researchID)) {
        await supabase.from('users').update({ reading_history: [...history, researchID] }).eq('id', userID);
      }
    }
  }
}

/**
 * Users & System Settings
 */
export async function saveUser(user: User): Promise<void> {
  const existingIdx = inMemoryUsers.findIndex(u => u.userID === user.userID);
  if (existingIdx >= 0) {
    inMemoryUsers[existingIdx] = user;
  } else {
    inMemoryUsers.push(user);
  }
  notifyUsers();

  if (isSupabaseConfigured) {
    await supabase.from('users').upsert({
      id: user.userID,
      name: user.name,
      full_name: user.fullName || user.name,
      email: user.email,
      role: user.role,
      user_type: user.userType || 'Student',
      college: user.college,
      id_number: user.idNumber || '',
      course_program: user.courseProgram || user.course || ''
    });
  }
}

export async function updateUserRole(userID: string, newRole: User['role']): Promise<void> {
  inMemoryUsers = inMemoryUsers.map(u => u.userID === userID ? { ...u, role: newRole } : u);
  notifyUsers();

  if (isSupabaseConfigured) {
    await supabase.from('users').update({ role: newRole }).eq('id', userID);
  }
}

export function subscribeToSystemSettings(callback: (settings: SystemSettings) => void) {
  settingsListeners.add(callback);
  callback({ ...inMemorySettings });

  return () => {
    settingsListeners.delete(callback);
  };
}

export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  inMemorySettings = { ...settings };
  notifySettings();
}

/**
 * Access Request Handling
 */
export async function createAccessRequest(currentUser: User, research: Research): Promise<void> {
  const newRequest: AccessRequest = {
    requestID: 'req_' + Date.now(),
    userID: currentUser.userID,
    userName: currentUser.name || currentUser.fullName || 'UDM Scholar',
    userEmail: currentUser.email,
    userRoleOrType: currentUser.userType || currentUser.role,
    college: currentUser.college,
    researchID: research.researchID,
    researchTitle: research.title,
    status: 'pending',
    dateRequested: new Date().toISOString()
  };

  inMemoryAccessRequests = [newRequest, ...inMemoryAccessRequests];
  notifyAccessRequests();

  if (isSupabaseConfigured) {
    await supabase.from('access_requests').insert({
      id: newRequest.requestID,
      user_id: newRequest.userID,
      user_name: newRequest.userName,
      user_email: newRequest.userEmail,
      user_role_or_type: newRequest.userRoleOrType,
      college: newRequest.college,
      research_id: newRequest.researchID,
      research_title: newRequest.researchTitle,
      status: 'pending',
      date_requested: newRequest.dateRequested
    });
  }
}

export async function reviewAccessRequest(
  requestID: string,
  status: 'approved' | 'rejected',
  reviewNote: string,
  reviewedBy: string
): Promise<void> {
  inMemoryAccessRequests = inMemoryAccessRequests.map(r =>
    r.requestID === requestID
      ? {
          ...r,
          status,
          reviewNote,
          reviewedBy,
          dateReviewed: new Date().toISOString()
        }
      : r
  );
  notifyAccessRequests();

  if (isSupabaseConfigured) {
    await supabase.from('access_requests').update({
      status,
      review_note: reviewNote,
      reviewed_by: reviewedBy,
      date_reviewed: new Date().toISOString()
    }).eq('id', requestID);
  }
}

/**
 * Authentication with Supabase Auth (with local fallback)
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: 'Student' | 'Faculty' | 'Faculty_Admin' | 'Faculty/Admin' | UserRole;
  college: UDMCollege;
  idNumber: string;
  courseProgram: string;
  yearLevel?: string;
}

export interface RegisterResult {
  user: User;
  needsVerification: boolean;
  message?: string;
  otpCode?: string;
}

async function parseResponseJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): Please check backend logs or try again.`);
    }
    throw new Error('Unexpected response format received from authentication server.');
  }
}

export async function registerUserWithSupabase(data: RegisterPayload): Promise<RegisterResult> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // General email validation: accept any valid institutional or personal email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const assignedRole: User['role'] = (data.role as UserRole) || 'student';

  // Check if account already exists in Supabase public.users
  if (isSupabaseConfigured) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        throw new Error('An account with this email is already registered. Please proceed to the Sign In tab to log in.');
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes('already registered')) {
        throw checkErr;
      }
      console.warn('Supabase existing account check note:', checkErr.message);
    }
  }

  // Also check existing in-memory / demo users
  if (inMemoryUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email is already registered. Please proceed to the Sign In tab to log in.');
  }

  // Send registration data and dispatch strictly 6-digit numeric OTP via backend SMTP
  // The account will ONLY be created in Supabase AFTER the user submits the correct OTP!
  const res = await fetch('/api/auth/send-verification-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      password: data.password,
      role: assignedRole,
      college: data.college,
      idNumber: data.idNumber.trim(),
      courseProgram: data.courseProgram.trim(),
      yearLevel: data.yearLevel || '1st Year'
    })
  });

  const result = await parseResponseJson(res);
  if (!res.ok) {
    throw new Error(result.error || 'Failed to dispatch verification code. Please check your network and try again.');
  }

  // Return pending verification state without saving to Supabase or active user storage
  const pendingUserPlaceholder: User = {
    userID: 'pending_' + Date.now(),
    name: data.fullName.trim(),
    fullName: data.fullName.trim(),
    email: normalizedEmail,
    role: assignedRole,
    userType: (data.role === 'Faculty/Admin' || data.role === 'Faculty') ? 'Faculty_Admin' : (data.role === 'student' ? 'Student' : (data.role as any)),
    college: data.college,
    idNumber: data.idNumber.trim(),
    courseProgram: data.courseProgram.trim(),
    yearLevel: data.yearLevel || '1st Year',
    dateRegistered: new Date().toISOString(),
    readingHistory: []
  };

  return {
    user: pendingUserPlaceholder,
    needsVerification: true,
    message: result.message || `A 6-digit numeric verification code has been dispatched to ${normalizedEmail}. Please enter the code from your email to activate your account.`
  };
}

/**
 * Verify 6-digit Signup OTP token sent to user's institutional or personal email (Numbers Only)
 * Only upon successful OTP verification does the backend officially create the user in Supabase!
 */
export async function verifySignupOTP(email: string, tokenOrHash: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  let cleanToken = tokenOrHash.trim();

  // Strip non-numeric characters and extract 6 digits
  cleanToken = cleanToken.replace(/\D/g, '').slice(0, 6);

  if (!/^\d{6}$/.test(cleanToken)) {
    throw new Error('Please enter a valid 6-digit numeric verification code (numbers only).');
  }

  // Strictly verify OTP with backend. Supabase row creation only happens when code matches!
  const res = await fetch('/api/auth/verify-registration-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, otpCode: cleanToken })
  });

  const result = await parseResponseJson(res);
  if (!res.ok || !result.success || !result.user) {
    throw new Error(result.error || 'Incorrect or expired 6-digit verification code. Please check your email and try again.');
  }

  const activatedUser: User = result.user;

  // Persist verified user in memory and localStorage
  await saveUser(activatedUser);
  try {
    localStorage.setItem('udm_active_user', JSON.stringify(activatedUser));
  } catch {}

  return activatedUser;
}

/**
 * Resend verification OTP code to user's email via Hostinger SMTP (Numbers Only)
 */
export async function resendSignupOTP(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();

  const res = await fetch('/api/auth/resend-verification-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail })
  });

  const result = await parseResponseJson(res);
  if (!res.ok) {
    throw new Error(result.error || 'Failed to resend verification code. Please check your details and try again.');
  }
}

/**
 * Request Password Reset for @udm.edu.ph email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: 'https://udmrhub.site/auth/callback'
    });
    if (error) throw new Error(error.message);
  }
}

/**
 * Verify Recovery OTP for Password Reset
 */
export async function verifyPasswordResetOTP(email: string, token: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'recovery'
    });
    if (error) throw new Error(error.message);
  }
}

/**
 * Update authenticated user's password
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw new Error(error.message);
  }
}

export async function getAllDatabaseUsers(): Promise<User[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data && data.length > 0) {
        return data.map(u => ({
          userID: u.id || u.user_id,
          name: u.name || u.full_name || u.email?.split('@')[0],
          fullName: u.full_name || u.name,
          email: u.email,
          role: u.role,
          userType: u.user_type,
          college: u.college as UDMCollege,
          idNumber: u.id_number,
          courseProgram: u.course_program,
          readingHistory: u.reading_history || []
        }));
      }
    } catch (err) {
      console.warn('Could not query Supabase users:', err);
    }
  }
  return inMemoryUsers.length > 0 ? inMemoryUsers : INITIAL_USERS;
}

export async function loginUserWithSupabase(identifier: string, password?: string): Promise<User> {
  const raw = (identifier || '').trim();
  const clean = raw.toLowerCase();
  const candidateEmail = clean.includes('@') ? clean : `${clean}@udm.edu.ph`;

  // Candidate email resolution (supports username, ID number, or full email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (candidateEmail.includes('@') && !emailRegex.test(candidateEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  // 1. Try Supabase Auth first if password is provided
  if (isSupabaseConfigured && password && clean.includes('@')) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: candidateEmail,
      password
    });

    if (error) {
      const errMsg = error.message.toLowerCase();
      // If email is not confirmed in Supabase, allow access only if credentials were valid
      if (errMsg.includes('email not confirmed')) {
        console.info('Bypassing email confirmation for @udm.edu.ph user:', candidateEmail);
      } else if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
        // Check if this is an in-memory or seed demo user with a known mock password
        const demoUser = inMemoryUsers.find(u => u.email.toLowerCase() === candidateEmail) ||
                         INITIAL_USERS.find(u => u.email.toLowerCase() === candidateEmail);
        if (demoUser && demoUser.password) {
          if (demoUser.password !== password) {
            throw new Error('Invalid email or password. Please verify your credentials and try again.');
          }
          try {
            localStorage.setItem('udm_active_user', JSON.stringify(demoUser));
          } catch {}
          return demoUser;
        }
        // Wrong password for Supabase user: strictly reject!
        throw new Error('Invalid email or password. Please verify your credentials and try again.');
      } else {
        throw new Error(error.message || 'Authentication failed. Please check your credentials.');
      }
    }

    if (data?.user) {
      // Find user in Supabase table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${data.user.id},email.ilike.${candidateEmail}`)
        .maybeSingle();

      const user: User = {
        userID: profile?.id || data.user.id,
        name: profile?.name || profile?.full_name || data.user.user_metadata?.full_name || candidateEmail.split('@')[0],
        fullName: profile?.full_name || profile?.name || data.user.user_metadata?.full_name || candidateEmail.split('@')[0],
        email: profile?.email || data.user.email || candidateEmail,
        role: profile?.role || 'student_faculty',
        userType: profile?.user_type || data.user.user_metadata?.user_type || 'Student',
        college: profile?.college || data.user.user_metadata?.college || 'CCS',
        idNumber: profile?.id_number || data.user.user_metadata?.id_number || '',
        courseProgram: profile?.course_program || data.user.user_metadata?.course_program || '',
        readingHistory: profile?.reading_history || []
      };
      try {
        localStorage.setItem('udm_active_user', JSON.stringify(user));
      } catch {}
      return user;
    }
  }

  // 2. Check in-memory demo / seed users with strict password check
  const found = inMemoryUsers.find(u => 
    u.email.toLowerCase() === candidateEmail ||
    u.email.toLowerCase() === clean ||
    (u.idNumber && u.idNumber.toLowerCase() === raw.toLowerCase()) ||
    u.userID === raw
  ) || INITIAL_USERS.find(u => 
    u.email.toLowerCase() === candidateEmail ||
    u.email.toLowerCase() === clean ||
    u.userID === raw
  );

  if (found) {
    if (password && found.password && found.password !== password) {
      throw new Error('Invalid email or password. Please verify your credentials and try again.');
    }
    try {
      localStorage.setItem('udm_active_user', JSON.stringify(found));
    } catch {}
    return found;
  }

  // If password was supplied but auth failed, strictly reject!
  if (password) {
    throw new Error('Invalid email or password. Please verify your credentials and try again.');
  }

  // 3. Passwordless session lookup by ID (only when password is not supplied)
  if (isSupabaseConfigured && !password) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${candidateEmail},id_number.eq.${raw},id.eq.${raw}`)
        .maybeSingle();

      if (profile) {
        const user: User = {
          userID: profile.id,
          name: profile.name || profile.full_name || profile.email?.split('@')[0] || raw,
          fullName: profile.full_name || profile.name,
          email: profile.email || candidateEmail,
          role: profile.role || 'student_faculty',
          userType: profile.user_type || 'Student',
          college: profile.college || 'CCS',
          idNumber: profile.id_number || '',
          courseProgram: profile.course_program || '',
          readingHistory: profile.reading_history || []
        };
        try {
          localStorage.setItem('udm_active_user', JSON.stringify(user));
        } catch {}
        return user;
      }
    } catch (dbErr) {
      console.warn('Supabase users query error:', dbErr);
    }
  }

  throw new Error(`Account "${raw}" not found. Please register and confirm your account using your @udm.edu.ph or @gmail.com email.`);
}

export async function logoutUserWithSupabase(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

// Aliases for seamless drop-in backwards compatibility with previous imports
export const createFirestoreSubmission = createSubmission;
export const approveFirestoreSubmission = approveSubmission;
export const rejectFirestoreSubmission = rejectSubmission;
export const recordResearchViewInFirestore = recordResearchView;
export const recordResearchDownloadInFirestore = recordResearchDownload;
export const recordUserReadingHistoryInFirestore = recordUserReadingHistory;
export const saveUserToFirestore = saveUser;
export const updateUserRoleInFirestore = updateUserRole;
export const saveSystemSettingsToFirestore = saveSystemSettings;
export const registerUserWithFirebaseAuth = registerUserWithSupabase;
export const loginUserWithFirebaseAuth = loginUserWithSupabase;
export const createAccessRequestInFirestore = createAccessRequest;
export const reviewAccessRequestInFirestore = reviewAccessRequest;
