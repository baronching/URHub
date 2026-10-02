/**
 * UDM-ResearchHub Database Entities & System Types
 * Based on Universidad de Manila URELIA Office Capstone Specification
 */

export type UDMCollege = 'CBM' | 'CAS' | 'CPPG' | 'CCS' | 'CHS' | 'CED' | 'CCJ';

export const UDM_COLLEGES: { id: UDMCollege; name: string; courses: string[] }[] = [
  {
    id: 'CBM',
    name: 'College of Business Management',
    courses: ['BS in Business Administration', 'BS in Accountancy', 'BS in Real Estate Management', 'BS in Hospitality Management']
  },
  {
    id: 'CAS',
    name: 'College of Arts and Sciences',
    courses: ['BS in Psychology', 'BS in Mathematics', 'BA in Communication', 'BS in Social Work']
  },
  {
    id: 'CPPG',
    name: 'College of Public Policy and Governance',
    courses: ['BS in Public Administration', 'BA in Political Science']
  },
  {
    id: 'CCS',
    name: 'College of Computer Studies',
    courses: ['BS in Computer Science', 'BS in Information Technology']
  },
  {
    id: 'CHS',
    name: 'College of Health Sciences',
    courses: ['BS in Nursing', 'BS in Physical Therapy']
  },
  {
    id: 'CED',
    name: 'College of Education',
    courses: ['Bachelor of Secondary Education', 'Bachelor of Elementary Education', 'Bachelor of Physical Education']
  },
  {
    id: 'CCJ',
    name: 'College of Criminology and Justice',
    courses: ['BS in Criminology']
  }
];

export type UserRole = 'student_faculty' | 'admin' | 'super_admin';

export interface User {
  userID: string;
  name: string;
  fullName?: string;
  email: string;
  password?: string;
  role: UserRole;
  userType?: 'Student' | 'Faculty';
  college?: UDMCollege;
  idNumber?: string;
  courseProgram?: string;
  course?: string;
  yearLevel?: string;
  dateRegistered?: string;
  readingHistory?: string[]; // researchIDs interacted with
}

export type ResearchStatus = 'pending' | 'approved' | 'rejected';

export interface Research {
  researchID: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  department: UDMCollege; // Maps to UDM 7 Colleges
  course: string;
  year: number;
  status: ResearchStatus;
  fullPdfUrl?: string;
  viewsCount: number;
  downloadsCount: number;
  submittedBy: string;
  dateAdded: string;
  relevanceScore?: number;
}

export interface Submission {
  submissionID: string;
  submittedBy: string;
  submitterName: string;
  submitterEmail: string;
  researchID: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  department: UDMCollege;
  course: string;
  year: number;
  dateSubmitted: string;
  status: ResearchStatus;
  reviewNote?: string;
  pdfFileName?: string;
}

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
  requestID: string;
  userID: string;
  userName: string;
  userEmail: string;
  userRoleOrType?: string;
  college?: UDMCollege;
  researchID: string;
  researchTitle: string;
  status: AccessRequestStatus;
  dateRequested: string;
  dateReviewed?: string;
  reviewNote?: string;
  reviewedBy?: string;
}

export interface Recommendation {
  recommendID: string;
  userID: string;
  researchID: string;
  score: number; // 0.0 to 1.0 (Match percentage)
  contentBasedScore: number;
  collaborativeScore: number;
  matchedKeywords: string[];
}

export interface Report {
  reportID: string;
  generatedBy: string;
  dateGenerated: string;
  type: 'college_trends' | 'course_trends' | 'submission_analytics' | 'user_activity';
  summaryData: {
    totalResearches: number;
    collegeBreakdown: Record<UDMCollege, number>;
    courseBreakdown: Record<string, number>;
    yearlyDistribution: Record<number, number>;
  };
}

export interface SystemSettings {
  allowedDomains: string[];
  maxPdfUploadMb: number;
  requireAdminApproval: boolean;
  enableMlRecommendations: boolean;
  tfIdfTopKeywordsCount: number;
  collaborativeWeight: number; // e.g. 0.4
  contentBasedWeight: number; // e.g. 0.6
}

export interface SearchFilters {
  query: string;
  college: UDMCollege | 'ALL';
  year: number | 'ALL';
  keyword: string | 'ALL';
  sortBy: 'relevance' | 'newest' | 'views';
}
