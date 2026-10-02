import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Research, Submission, User, SystemSettings, UDMCollege, AccessRequest } from '../types';
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
export async function approveSubmission(submission: Submission, publishedResearch: Research): Promise<void> {
  inMemorySubmissions = inMemorySubmissions.map(s =>
    s.submissionID === submission.submissionID ? { ...s, status: 'approved' } : s
  );
  inMemoryResearches = [publishedResearch, ...inMemoryResearches];
  notifySubmissions();
  notifyResearches();

  if (isSupabaseConfigured) {
    await supabase
      .from('submissions')
      .update({ status: 'approved' })
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
  role: 'Student' | 'Faculty';
  college: UDMCollege;
  idNumber: string;
  courseProgram: string;
  yearLevel?: string;
}

export async function registerUserWithSupabase(data: RegisterPayload): Promise<User> {
  const assignedRole: User['role'] = 'student_faculty';
  const userID = 'usr_' + Date.now();

  const newUser: User = {
    userID,
    name: data.fullName,
    fullName: data.fullName,
    email: data.email,
    role: assignedRole,
    userType: data.role,
    college: data.college,
    idNumber: data.idNumber,
    courseProgram: data.courseProgram,
    yearLevel: data.yearLevel,
    dateRegistered: new Date().toISOString(),
    readingHistory: []
  };

  if (isSupabaseConfigured && data.password) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          user_type: data.role,
          college: data.college,
          id_number: data.idNumber,
          course_program: data.courseProgram
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (authData.user) {
      newUser.userID = authData.user.id;
    }
  }

  await saveUser(newUser);
  return newUser;
}

export async function loginUserWithSupabase(email: string, password?: string): Promise<User> {
  if (isSupabaseConfigured && password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Find user in table or construct from metadata
      const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      if (profile) {
        return {
          userID: profile.id,
          name: profile.name || profile.full_name || email.split('@')[0],
          fullName: profile.full_name || profile.name,
          email: profile.email || email,
          role: profile.role || 'student_faculty',
          userType: profile.user_type || 'Student',
          college: profile.college || 'CCS',
          idNumber: profile.id_number || '',
          courseProgram: profile.course_program || '',
          readingHistory: profile.reading_history || []
        };
      }
    }
  }

  // Fallback to local users list
  const found = inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    return found;
  }

  // If user not in list yet, create session user
  const dummy: User = {
    userID: 'usr_' + Date.now(),
    name: email.split('@')[0].toUpperCase(),
    fullName: email.split('@')[0].toUpperCase(),
    email,
    role: email.includes('admin') ? 'admin' : 'student_faculty',
    userType: 'Student',
    college: 'CCS',
    readingHistory: []
  };
  await saveUser(dummy);
  return dummy;
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
