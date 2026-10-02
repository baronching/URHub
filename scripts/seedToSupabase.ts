import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_RESEARCH, INITIAL_USERS, INITIAL_SUBMISSIONS } from '../src/data/mockDatabase';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be provided in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Connecting to Supabase at ${supabaseUrl}...`);

  console.log(`Seeding ${INITIAL_RESEARCH.length} researches...`);
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
  const { error: rErr } = await supabase.from('researches').upsert(formattedResearches);
  if (rErr) console.error('Failed to seed researches:', rErr.message);
  else console.log('✓ Researches seeded successfully.');

  console.log(`Seeding ${INITIAL_USERS.length} users...`);
  const formattedUsers = INITIAL_USERS.map(u => ({
    id: u.userID,
    name: u.name,
    full_name: u.fullName || u.name,
    email: u.email,
    role: u.role,
    user_type: u.userType || 'Student',
    college: u.college || 'CCS',
    id_number: u.idNumber || '',
    course_program: u.courseProgram || u.course || ''
  }));
  const { error: uErr } = await supabase.from('users').upsert(formattedUsers);
  if (uErr) console.error('Failed to seed users:', uErr.message);
  else console.log('✓ Users seeded successfully.');

  console.log(`Seeding ${INITIAL_SUBMISSIONS.length} submissions...`);
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
  const { error: sErr } = await supabase.from('submissions').upsert(formattedSubmissions);
  if (sErr) console.error('Failed to seed submissions:', sErr.message);
  else console.log('✓ Submissions seeded successfully.');

  console.log('Seeding process complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
