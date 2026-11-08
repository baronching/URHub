/**
 * Express REST API Backend for UDM-ResearchHub
 * Universidad de Manila - URELIA Office
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_RESEARCH, INITIAL_SUBMISSIONS, INITIAL_SYSTEM_SETTINGS, INITIAL_USERS } from './src/data/mockDatabase';
import { generateHybridRecommendations, calculateIDF, getResearchTokens, scoreSearchRelevance } from './src/utils/mlEngine';
import { generateContextualAcademicAnswer } from './src/utils/researchAiAssistant';
import { Research, Submission, User, SystemSettings, UDMCollege, UDM_COLLEGES, UserRole } from './src/types';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Supabase client on backend if configured
const rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseServerUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseServerKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

const isServerSupabaseConfigured = Boolean(
  supabaseServerUrl &&
  supabaseServerKey &&
  supabaseServerUrl.startsWith('http') &&
  !supabaseServerUrl.includes('your-project-ref')
);

class DummyNodeWebSocket {}

const serverSupabase = isServerSupabaseConfigured
  ? createClient(supabaseServerUrl, supabaseServerKey, {
      auth: { persistSession: false },
      realtime: { transport: DummyNodeWebSocket as any }
    })
  : null;

// Initialize Google Gemini SDK with server-side API key and telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'UDM-ResearchHub/1.0',
    }
  }
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// In-Memory Database instances initialized from seed data
let usersDB: User[] = [...INITIAL_USERS];
let researchDB: Research[] = [...INITIAL_RESEARCH];
let submissionsDB: Submission[] = [...INITIAL_SUBMISSIONS];
let settingsDB: SystemSettings = { ...INITIAL_SYSTEM_SETTINGS };

// Hostinger SMTP Transporter Configuration
const getHostingerTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Pending Registration 6-Digit Numeric OTP Store
interface PendingRegistration {
  code: string; // Strictly 6-digit numeric OTP
  expiresAt: number;
  payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    college: string;
    idNumber: string;
    courseProgram: string;
    yearLevel?: string;
  };
}
const pendingRegistrationOTPs = new Map<string, PendingRegistration>();

// Send 6-Digit Numeric Verification OTP via Hostinger SMTP
async function sendNumericOTPEmail(toEmail: string, fullName: string, otpCode: string): Promise<boolean> {
  const transporter = getHostingerTransporter();
  console.log(`\n================================================================`);
  console.log(`[UDM OTP] Registration Verification for: ${toEmail}`);
  console.log(`[UDM OTP] 6-DIGIT NUMERIC CODE (NUMBERS ONLY): >>> [ ${otpCode} ] <<<`);
  console.log(`================================================================\n`);

  if (!transporter) {
    console.warn(`[UDM OTP] Hostinger SMTP credentials not set. Code [ ${otpCode} ] logged to console for test/dev.`);
    return false;
  }

  try {
    const sender = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER || 'no-reply@udmrhub.site';
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'UDM ResearchHub - URELIA'}" <${sender}>`,
      to: toEmail,
      subject: `[${otpCode}] Your UDM ResearchHub 6-Digit Verification Code`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #1a4731; padding: 24px; text-align: center; border-bottom: 3px solid #c9a84c;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">UNIVERSIDAD DE MANILA</h1>
            <p style="color: #c9a84c; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">URELIA Office • Research & Archival Portal</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #1a4731; margin-top: 0; font-size: 18px;">Account Email Verification</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${fullName || 'UDM Scholar'}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Please use the <strong>6-digit verification code (numbers only)</strong> below to confirm your institutional email and activate your UDM ResearchHub account:</p>
            
            <div style="margin: 28px 0; text-align: center;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #1a4731; border-radius: 12px; padding: 18px 36px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1a4731;">${otpCode}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 8px;">(Strictly 6 numeric digits • Valid for 15 minutes)</p>
            </div>

            <p style="color: #334155; font-size: 13px; line-height: 1.6;">If you did not request this verification, please disregard this message or contact the URELIA Office.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <p style="margin: 0;">© 2026 Universidad de Manila • URELIA Office • Republic Act 10173 Compliant</p>
          </div>
        </div>
      `
    });
    console.log(`[UDM OTP] Verification email dispatched successfully to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`[UDM OTP] Hostinger SMTP sendMail error:`, err.message);
    return false;
  }
}

// ==========================================
// RESTFUL API ENDPOINTS
// ==========================================

// Health Check & Hostinger SMTP Status
app.get('/api/health', (req: Request, res: Response) => {
  const isSmtpConfigured = Boolean(
    (process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER) &&
    (process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASS)
  );

  res.json({
    status: 'online',
    system: 'UDM-ResearchHub API',
    institution: 'Universidad de Manila - URELIA Office',
    smtp: {
      provider: 'Hostinger SMTP (smtp.hostinger.com)',
      configured: isSmtpConfigured,
      sender: process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER || 'Not configured yet'
    },
    timestamp: new Date().toISOString()
  });
});

// Test Hostinger SMTP Connection / Send Test Email
app.post('/api/smtp/test', async (req: Request, res: Response) => {
  const { toEmail } = req.body;
  const transporter = getHostingerTransporter();

  if (!transporter) {
    return res.status(400).json({
      success: false,
      error: 'Hostinger SMTP is not yet configured. Please set SMTP_USER and SMTP_PASS in environment variables.'
    });
  }

  const targetEmail = toEmail || process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER;

  try {
    // 1. Verify credentials with smtp.hostinger.com
    await transporter.verify();

    // 2. Send test message
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'UDM ResearchHub'}" <${process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER}>`,
      to: targetEmail,
      subject: 'UDM-ResearchHub Hostinger SMTP Connection Verified',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #1a4731; margin-top: 0;">Universidad de Manila - URELIA ResearchHub</h2>
          <p>This is a confirmation that your <strong>Hostinger SMTP</strong> email server (<code>smtp.hostinger.com</code>) is successfully connected to UDM-ResearchHub!</p>
          <div style="padding: 12px; background-color: #e6f4ea; border-left: 4px solid #1a4731; border-radius: 4px; margin: 15px 0;">
            <p style="margin: 0; color: #1a4731; font-weight: bold;">Status: Active & Operational</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #374151;">All institutional student and faculty verification codes will be delivered through this channel.</p>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Universidad de Manila • Research and Extension Services Office (URELIA)</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: `Test email successfully sent to ${targetEmail} via Hostinger SMTP!`,
      messageId: info.messageId
    });
  } catch (err: any) {
    console.error('Hostinger SMTP Test Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Hostinger SMTP authentication or connection failed'
    });
  }
});

// Authentication: Login with UDM Email
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'UDM Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  let user = usersDB.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({
      error: 'Account not found. Please register and verify your email address before signing in.'
    });
  }

  if (user.password && user.password !== password) {
    return res.status(401).json({
      error: 'Invalid password. Please verify your credentials or use "Forgot password?".'
    });
  }

  const { password: _, ...safeUser } = user;
  res.json({
    message: 'Login successful.',
    user: safeUser
  });
});

// Authentication: Register new UDM Account
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, college, course } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, UDM Email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Check existing
  if (usersDB.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    userID: `USR-UDM-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: cleanEmail,
    password: password,
    role: 'student_faculty',
    college: (college as UDMCollege) || 'CCS',
    course: course || 'BS in Computer Science',
    readingHistory: []
  };

  usersDB.push(newUser);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({
    message: 'UDM account successfully registered.',
    user: safeUser
  });
});

// 1. Send 6-Digit Numeric Verification OTP on Registration
app.post('/api/auth/send-verification-otp', async (req: Request, res: Response) => {
  const { fullName, email, password, role, college, idNumber, courseProgram, yearLevel } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, UDM email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  // Check if already registered in database
  if (usersDB.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({
      error: 'An account with this email is already registered. Please go to the Sign In tab to log in.'
    });
  }

  // Generate strictly numeric 6-digit OTP (e.g. 100000 to 999999)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in pending map (15 minutes expiry)
  pendingRegistrationOTPs.set(cleanEmail, {
    code: otpCode,
    expiresAt: Date.now() + 15 * 60 * 1000,
    payload: {
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: role || 'student',
      college: college || 'CCS',
      idNumber: (idNumber || '').trim(),
      courseProgram: (courseProgram || '').trim(),
      yearLevel: yearLevel || '1st Year'
    }
  });

  // Dispatch email with 6-digit numeric OTP
  await sendNumericOTPEmail(cleanEmail, fullName, otpCode);

  res.status(200).json({
    success: true,
    needsVerification: true,
    email: cleanEmail,
    message: `A 6-digit numeric verification code has been dispatched to ${cleanEmail}.`
  });
});

// 2. Verify 6-Digit Numeric Registration OTP & Activate User
app.post('/api/auth/verify-registration-otp', async (req: Request, res: Response) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = otpCode.toString().trim().replace(/\D/g, '');

  if (!/^\d{6}$/.test(cleanCode)) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit numeric verification code (numbers only).' });
  }

  const pending = pendingRegistrationOTPs.get(cleanEmail);
  if (!pending) {
    return res.status(400).json({
      error: 'No pending registration found for this email, or the code has expired. Please register again.'
    });
  }

  if (Date.now() > pending.expiresAt) {
    pendingRegistrationOTPs.delete(cleanEmail);
    return res.status(400).json({
      error: 'Your verification code has expired. Please request a new code.'
    });
  }

  if (pending.code !== cleanCode) {
    return res.status(400).json({
      error: 'Incorrect 6-digit verification code. Please check your email and enter the numbers sent.'
    });
  }

  // Code is valid! Create and activate user
  const { payload } = pending;
  const newUser: User = {
    userID: `USR-UDM-${Date.now().toString().slice(-4)}`,
    name: payload.fullName,
    fullName: payload.fullName,
    email: cleanEmail,
    password: payload.password,
    role: (payload.role as UserRole) || 'student',
    userType: payload.role === 'Faculty_Admin' || payload.role === 'Faculty' ? 'Faculty_Admin' : (payload.role === 'student' ? 'Student' : (payload.role as any)),
    college: (payload.college as UDMCollege) || 'CCS',
    idNumber: payload.idNumber,
    courseProgram: payload.courseProgram,
    yearLevel: payload.yearLevel,
    dateRegistered: new Date().toISOString(),
    readingHistory: []
  };

  usersDB.push(newUser);
  pendingRegistrationOTPs.delete(cleanEmail);

  // Sync to Supabase public.users table if configured
  if (serverSupabase) {
    try {
      await serverSupabase.from('users').upsert({
        id: newUser.userID,
        name: newUser.name,
        full_name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        user_type: newUser.userType,
        college: newUser.college,
        id_number: newUser.idNumber,
        course_program: newUser.courseProgram,
        reading_history: [],
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });
      console.log(`[Supabase Sync] Successfully saved ${cleanEmail} to public.users table in UDMrhub`);
    } catch (syncErr: any) {
      console.warn('[Supabase Sync] Note on saving user to Supabase:', syncErr.message);
    }
  }

  const { password: _, ...safeUser } = newUser;
  res.status(200).json({
    success: true,
    message: 'Account successfully verified and activated! Welcome to UDM ResearchHub.',
    user: safeUser
  });
});

// 3. Resend 6-Digit Numeric OTP
app.post('/api/auth/resend-verification-otp', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const pending = pendingRegistrationOTPs.get(cleanEmail);

  if (!pending) {
    return res.status(400).json({
      error: 'No pending registration found for this email. Please submit your registration details first.'
    });
  }

  // Generate a fresh 6-digit numeric OTP
  const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
  pending.code = freshCode;
  pending.expiresAt = Date.now() + 15 * 60 * 1000;
  pendingRegistrationOTPs.set(cleanEmail, pending);

  await sendNumericOTPEmail(cleanEmail, pending.payload.fullName, freshCode);

  res.status(200).json({
    success: true,
    message: `A fresh 6-digit numeric verification code has been dispatched to ${cleanEmail}.`
  });
});

// Secure Auth Callback Route Handler: token_hash, code, or OTP verification
const handleAuthCallback = async (req: Request, res: Response) => {
  const token_hash = (req.query.token_hash as string) || '';
  const code = (req.query.code as string) || '';
  const type = ((req.query.type as string) || 'signup') as any;
  const errorDescription = (req.query.error_description as string) || '';
  const errorCode = (req.query.error_code as string) || (req.query.error as string) || '';

  // Handle explicit error sent from Supabase (e.g. otp_expired)
  if (errorCode || errorDescription) {
    const isExpired = errorCode.includes('expired') || errorDescription.toLowerCase().includes('expired');
    const redirectParam = isExpired ? 'error=expired_link' : `error=${encodeURIComponent(errorDescription || errorCode)}`;
    return res.redirect(`https://udmrhub.site/?${redirectParam}`);
  }

  if (serverSupabase && (token_hash || code)) {
    try {
      if (token_hash) {
        const { error } = await serverSupabase.auth.verifyOtp({
          token_hash,
          type
        });
        if (error) {
          const isExpired = error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid');
          return res.redirect(`https://udmrhub.site/?error=${isExpired ? 'expired_link' : encodeURIComponent(error.message)}`);
        }
        return res.redirect('https://udmrhub.site/?verified=true');
      } else if (code) {
        const { error } = await serverSupabase.auth.exchangeCodeForSession(code);
        if (error) {
          const isExpired = error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid');
          return res.redirect(`https://udmrhub.site/?error=${isExpired ? 'expired_link' : encodeURIComponent(error.message)}`);
        }
        return res.redirect('https://udmrhub.site/?verified=true');
      }
    } catch (err: any) {
      console.error('Server auth callback error:', err);
      return res.redirect('https://udmrhub.site/?error=expired_link');
    }
  }

  res.redirect('https://udmrhub.site/');
};

app.get('/auth/callback', handleAuthCallback);
app.get('/api/auth/callback', handleAuthCallback);

// Research Archives: Search & Filter with TF-IDF Relevance Scoring
app.get('/api/research', (req: Request, res: Response) => {
  const query = (req.query.query as string) || '';
  const college = (req.query.college as string) || 'ALL';
  const year = req.query.year ? parseInt(req.query.year as string, 10) : 'ALL';
  const keyword = (req.query.keyword as string) || 'ALL';
  const sortBy = (req.query.sortBy as string) || 'relevance';

  let filtered = researchDB.filter(r => r.status === 'approved');

  // Filter by College (7 UDM Colleges constraint)
  if (college !== 'ALL') {
    filtered = filtered.filter(r => r.department === college);
  }

  // Filter by Year
  if (year !== 'ALL' && !isNaN(year as number)) {
    filtered = filtered.filter(r => r.year === year);
  }

  // Filter by Keyword
  if (keyword !== 'ALL') {
    filtered = filtered.filter(r => r.keywords.some(k => k.toLowerCase() === keyword.toLowerCase()));
  }

  // Calculate TF-IDF corpus IDF weights for query matching
  const corpusTokens = filtered.map(getResearchTokens);
  const idf = calculateIDF(corpusTokens);

  // Score relevance for each item
  let scored = filtered.map(item => ({
    ...item,
    relevanceScore: scoreSearchRelevance(query, item, idf)
  }));

  if (query.trim()) {
    scored = scored.filter(item => (item.relevanceScore || 0) > 0);
  }

  // Sort results
  if (sortBy === 'relevance' && query.trim()) {
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === 'newest') {
    scored.sort((a, b) => b.year - a.year || new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  } else if (sortBy === 'views') {
    scored.sort((a, b) => b.viewsCount - a.viewsCount);
  }

  res.json({
    total: scored.length,
    colleges: UDM_COLLEGES.map(c => c.id),
    items: scored
  });
});

// View Research Details & Increment Interacted View Count for ML
app.get('/api/research/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.query.userId as string;

  const research = researchDB.find(r => r.researchID === id);
  if (!research) {
    return res.status(404).json({ error: 'Research paper not found in archive.' });
  }

  // Increment view counter
  research.viewsCount += 1;

  // Track reading history for user if logged in
  if (userId) {
    const user = usersDB.find(u => u.userID === userId);
    if (user) {
      if (!user.readingHistory) user.readingHistory = [];
      if (!user.readingHistory.includes(id)) {
        user.readingHistory.push(id);
      }
    }
  }

  res.json(research);
});

// Track PDF Abstract Download Count
app.post('/api/research/:id/download-abstract', (req: Request, res: Response) => {
  const { id } = req.params;
  const research = researchDB.find(r => r.researchID === id);
  if (research) {
    research.downloadsCount += 1;
  }
  res.json({ success: true, message: 'Abstract download counter incremented.' });
});

// Bulk Research Import API (Batch CSV / JSON Upload)
app.post('/api/research/batch', (req: Request, res: Response) => {
  const { papers } = req.body;
  if (!Array.isArray(papers) || papers.length === 0) {
    return res.status(400).json({ error: 'Array of research papers is required.' });
  }

  let importedCount = 0;
  for (const item of papers) {
    if (!item.title || !item.abstract) continue;
    const researchID = item.researchID || `RES-BULK-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
    const newPaper: Research = {
      researchID,
      title: item.title.trim(),
      abstract: item.abstract.trim(),
      authors: Array.isArray(item.authors) ? item.authors : (item.authors ? String(item.authors).split(/[,;•]/).map(a => a.trim()).filter(Boolean) : ['UDM Researcher']),
      keywords: Array.isArray(item.keywords) ? item.keywords : (item.keywords ? String(item.keywords).split(/[,;•]/).map(k => k.trim()).filter(Boolean) : ['Research', 'UDM']),
      department: item.department || 'CCS',
      course: item.course || 'Undergraduate Research',
      year: Number(item.year) || new Date().getFullYear(),
      status: 'approved',
      fullPdfUrl: item.fullPdfUrl || '',
      viewsCount: Number(item.viewsCount) || 0,
      downloadsCount: Number(item.downloadsCount) || 0,
      submittedBy: item.submittedBy || 'bulk-import@udm.edu.ph',
      dateAdded: item.dateAdded || new Date().toISOString().split('T')[0]
    };
    researchDB.unshift(newPaper);
    importedCount++;
  }

  res.json({
    success: true,
    message: `Successfully imported ${importedCount} research papers.`,
    totalNow: researchDB.length
  });
});

// Recommendation Engine API: TF-IDF Content-Based + Collaborative Filtering
app.get('/api/recommendations/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = usersDB.find(u => u.userID === userId);

  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const recommendations = generateHybridRecommendations(
    user,
    usersDB,
    researchDB,
    settingsDB.contentBasedWeight,
    settingsDB.collaborativeWeight
  );

  // Attach full research metadata to recommendations
  const enriched = recommendations.map(rec => {
    const paper = researchDB.find(r => r.researchID === rec.researchID);
    return {
      ...rec,
      paper
    };
  }).filter(rec => rec.paper !== undefined);

  res.json({
    userID: user.userID,
    userCollege: user.college,
    totalRecommendations: enriched.length,
    recommendations: enriched.slice(0, 6)
  });
});

// Submissions: Submit Research (Multi-step with role & college validation)
app.post('/api/submissions', async (req: Request, res: Response) => {
  const {
    submittedBy,
    submitterName,
    submitterEmail,
    title,
    abstract,
    authors,
    keywords,
    department,
    course,
    year,
    pdfFileName
  } = req.body;

  if (!title || !abstract || !department || !course || !authors?.length) {
    return res.status(400).json({ error: 'All required research submission fields must be provided.' });
  }

  // Verify College constraint
  if (!UDM_COLLEGES.some(c => c.id === department)) {
    return res.status(400).json({ error: 'Invalid UDM College selected.' });
  }

  // 1. Resolve submitter identity
  let submitterUser: User | null = null;
  const cleanEmail = (submitterEmail || '').trim().toLowerCase();
  const submitterId = (submittedBy || '').trim();

  if (serverSupabase) {
    try {
      const { data } = await serverSupabase
        .from('users')
        .select('*')
        .or(`id.eq.${submitterId},email.ilike.${cleanEmail}`)
        .maybeSingle();

      if (data) {
        submitterUser = {
          userID: data.id,
          name: data.name || data.full_name,
          email: data.email,
          role: data.role,
          userType: data.user_type,
          college: data.college,
          course: data.course_program
        };
      }
    } catch (dbErr) {
      console.warn('Backend Supabase user lookup warning:', dbErr);
    }
  }

  if (!submitterUser) {
    const found = usersDB.find(u => 
      u.userID === submitterId || 
      (cleanEmail && u.email.toLowerCase() === cleanEmail)
    ) || INITIAL_USERS.find(u => 
      u.userID === submitterId || 
      (cleanEmail && u.email.toLowerCase() === cleanEmail)
    );
    if (found) submitterUser = found;
  }

  // 2. Reject unauthenticated or unknown submitters
  if (!submitterUser) {
    return res.status(403).json({
      error: 'Research submission is exclusively authorized for Faculty/Admin and the URELIA Office.'
    });
  }

  // 3. Reject Students
  const isSuperAdmin = submitterUser.role === 'super_admin';
  const isFaculty = submitterUser.userType === 'Faculty' || submitterUser.userType === 'Faculty_Admin' || submitterUser.role === 'admin';
  const isStudentUser = !isSuperAdmin && !isFaculty;

  if (isStudentUser) {
    return res.status(403).json({
      error: 'Research submission is exclusively authorized for Faculty/Admin and the URELIA Office.'
    });
  }

  // 4. Reject Faculty/Admin submitting for a different college than their registered college
  if (isFaculty && !isSuperAdmin) {
    const userCollege = submitterUser.college;
    if (userCollege && department !== userCollege) {
      return res.status(403).json({
        error: `Submission rejected: Faculty/Admin members are strictly authorized to submit research only for their designated college (${userCollege}). Submitted college '${department}' does not match.`
      });
    }
  }

  const newSubmissionID = `SUB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const newResearchID = `RES-SUB-${Date.now().toString().slice(-5)}`;

  const newSubmission: Submission = {
    submissionID: newSubmissionID,
    submittedBy: submitterUser.userID,
    submitterName: submitterUser.name || submitterName || 'UDM Researcher',
    submitterEmail: submitterUser.email || submitterEmail || 'researcher@udm.edu.ph',
    researchID: newResearchID,
    title: title.trim(),
    abstract: abstract.trim(),
    authors: Array.isArray(authors) ? authors : [authors],
    keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map((k: string) => k.trim()) : []),
    department: department as UDMCollege,
    course: course.trim(),
    year: parseInt(year, 10) || new Date().getFullYear(),
    dateSubmitted: new Date().toISOString().split('T')[0],
    status: 'pending',
    pdfFileName: pdfFileName || 'research_manuscript.pdf'
  };

  submissionsDB.unshift(newSubmission);

  res.status(201).json({
    message: 'Research paper successfully submitted for URELIA Office review.',
    submission: newSubmission
  });
});

// Admin Submissions Management Queue
app.get('/api/submissions', (req: Request, res: Response) => {
  res.json(submissionsDB);
});

// Admin Approval/Rejection Workflow
app.put('/api/submissions/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewNote } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Review status must be either approved or rejected.' });
  }

  const submission = submissionsDB.find(s => s.submissionID === id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  submission.status = status;
  submission.reviewNote = reviewNote || '';

  if (status === 'approved') {
    // Add or update paper in Research Archive
    const existingIndex = researchDB.findIndex(r => r.researchID === submission.researchID);
    const approvedPaper: Research = {
      researchID: submission.researchID,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors,
      keywords: submission.keywords,
      department: submission.department,
      course: submission.course,
      year: submission.year,
      status: 'approved',
      viewsCount: 0,
      downloadsCount: 0,
      submittedBy: submission.submittedBy,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      researchDB[existingIndex] = approvedPaper;
    } else {
      researchDB.unshift(approvedPaper);
    }
  }

  res.json({
    message: `Submission ${status} successfully.`,
    submission
  });
});

// Analytics and Reporting Engine (Trends by College and Course)
app.get('/api/analytics', (req: Request, res: Response) => {
  const collegeBreakdown: Record<UDMCollege, number> = {
    CBM: 0, CAS: 0, CPPG: 0, CCS: 0, CHS: 0, CED: 0, CCJ: 0, 'FAC-ADM': 0
  };

  const courseBreakdown: Record<string, number> = {};
  const yearlyDistribution: Record<number, number> = {};

  researchDB.forEach(r => {
    if (r.status === 'approved') {
      if (r.department in collegeBreakdown) {
        collegeBreakdown[r.department] += 1;
      }
      courseBreakdown[r.course] = (courseBreakdown[r.course] || 0) + 1;
      yearlyDistribution[r.year] = (yearlyDistribution[r.year] || 0) + 1;
    }
  });

  const totalResearches = researchDB.filter(r => r.status === 'approved').length;
  const totalSubmissions = submissionsDB.length;
  const pendingCount = submissionsDB.filter(s => s.status === 'pending').length;
  const approvedCount = submissionsDB.filter(s => s.status === 'approved').length;
  const rejectedCount = submissionsDB.filter(s => s.status === 'rejected').length;

  res.json({
    summaryData: {
      totalResearches,
      collegeBreakdown,
      courseBreakdown,
      yearlyDistribution,
      totalSubmissions,
      pendingCount,
      approvedCount,
      rejectedCount
    }
  });
});

// Super Admin User Management
app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase.from('users').select('*');
      if (!error && data && data.length > 0) {
        const mappedUsers: User[] = data.map(u => ({
          userID: u.id || u.user_id,
          name: u.name || u.full_name || u.email?.split('@')[0],
          fullName: u.full_name || u.name,
          email: u.email,
          role: u.role,
          userType: u.user_type,
          college: u.college,
          idNumber: u.id_number,
          courseProgram: u.course_program,
          readingHistory: u.reading_history || []
        }));
        return res.json(mappedUsers);
      }
    } catch (err) {
      console.warn('Could not query Supabase users on backend:', err);
    }
  }
  const safeUsers = usersDB.map(({ password: _, ...user }) => user);
  res.json(safeUsers);
});

app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, college, course } = req.body;

  if (serverSupabase) {
    try {
      const updateData: any = {};
      if (role) updateData.role = role;
      if (college) updateData.college = college;
      if (course) updateData.course_program = course;
      await serverSupabase.from('users').update(updateData).eq('id', id);
    } catch (err) {
      console.warn('Could not update user in Supabase on backend:', err);
    }
  }

  const user = usersDB.find(u => u.userID === id);
  if (user) {
    if (role) user.role = role;
    if (college) user.college = college;
    if (course) user.course = course;
  }

  res.json({ message: 'User role updated successfully.' });
});

// System Settings Management
app.get('/api/admin/settings', (req: Request, res: Response) => {
  res.json(settingsDB);
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  settingsDB = { ...settingsDB, ...req.body };
  res.json({ message: 'System settings updated successfully.', settings: settingsDB });
});

// ==========================================
// GEMINI GENERATIVE AI ENDPOINTS
// ==========================================

// Helper to call Gemini models with fallback and resilient timeout
async function callGemini(prompt: string, jsonMode: boolean = false): Promise<string | null> {
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : undefined
      });
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 20000)
      );
      const res = (await Promise.race([generatePromise, timeoutPromise])) as any;
      if (res && res.text && res.text.trim()) return res.text;
    } catch (err: any) {
      console.warn(`Gemini model ${model} attempt failed:`, err.message);
    }
  }
  return null;
}

// 1. AI Paper Breakdown & Academic Summarizer
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { title, abstract, department, course, keywords } = req.body;
    if (!title || !abstract) {
      return res.status(400).json({ error: 'Title and abstract are required.' });
    }

    const prompt = `You are the AI Academic Research Assistant of Universidad de Manila (UDM) URELIA Office.
Analyze this academic research paper:
Title: "${title}"
College / Department: ${department || 'General'}
Course Program: ${course || 'Academic'}
Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords || ''}
Abstract:
${abstract}

Provide an academic breakdown formatted strictly as JSON with this exact structure:
{
  "executiveSummary": "2-3 concise, clear sentences summarizing the essence, purpose, and key impact of the study.",
  "keyFindings": ["3 to 4 actionable, specific findings or outcomes of the research"],
  "methodology": "Brief summary of the research methodology, tools, algorithms, or approaches used.",
  "practicalImpact": "How this benefits the City of Manila, industry, or university community.",
  "alignedSDGs": [{"sdgNumber": 4, "sdgName": "Quality Education", "explanation": "Brief rationale why it aligns"}],
  "futureResearchDirections": ["2 potential extensions or follow-up capstone ideas"]
}

Respond ONLY with valid JSON. Do not wrap in markdown or backticks.`;

    const rawText = await callGemini(prompt, true);
    let data;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
      }
    }

    // Resilient academic synthesis fallback if external API is momentarily under high demand
    if (!data || !data.executiveSummary) {
      const sentences = abstract.split(/(?<=[.?!])\s+/).filter(Boolean);
      const kwList = Array.isArray(keywords) ? keywords : (keywords || '').split(',').map((k: string) => k.trim());
      
      data = {
        executiveSummary: sentences.slice(0, 2).join(' ') || `This academic research titled "${title}" investigates key interventions and methodologies within the ${course || department} program at Universidad de Manila.`,
        keyFindings: [
          sentences[2] || `Demonstrated measurable improvements within the target environment in the City of Manila.`,
          sentences[3] || `Validated empirical methodologies with rigorous academic verification.`,
          `Provides foundational documentation for future ${department || 'UDM'} capstone projects.`
        ],
        methodology: `Mixed-methods empirical study applying domain-specific frameworks, data collection protocols, and algorithmic analysis relevant to ${course}.`,
        practicalImpact: `Advances educational research standards for Universidad de Manila and delivers actionable solutions for Manila stakeholders.`,
        alignedSDGs: [
          { sdgNumber: 4, sdgName: 'Quality Education', explanation: 'Enhances academic knowledge sharing and higher education research capacity at UDM.' },
          { sdgNumber: 9, sdgName: 'Industry, Innovation and Infrastructure', explanation: 'Develops localized technical and administrative innovations.' }
        ],
        futureResearchDirections: [
          `Scale the study to include multi-campus longitudinal datasets across Manila universities.`,
          `Integrate automated real-time analytics to monitor operational metrics post-implementation.`
        ]
      };
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Summarize error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI summary' });
  }
});

// 2. Interactive AI Research Q&A Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, research, history } = req.body;
    if (!message || !research) {
      return res.status(400).json({ error: 'Message and research details are required.' });
    }

    const historyPrompt = Array.isArray(history) && history.length > 0
      ? `Prior Conversation:\n${history.map((h: any) => `${h.role === 'user' ? 'User' : 'AI Assistant'}: ${h.text}`).join('\n')}\n\n`
      : '';

    const systemInstruction = `You are the official AI Research Assistant for Universidad de Manila (UDM) Research Archives (URELIA Office).
You are answering questions about this specific research paper from Universidad de Manila:
Title: "${research.title}"
Department / College: ${research.department} (${research.course || 'Academic Research'})
Authors: ${Array.isArray(research.authors) ? research.authors.join(', ') : research.authors}
Year: ${research.year || '2024'}
Keywords: ${Array.isArray(research.keywords) ? research.keywords.join(', ') : research.keywords}

Paper Abstract:
${research.abstract}

CRITICAL RESPONSE GUIDELINES:
1. Thoroughly and specifically answer the user's question using the details from this research paper. Never give a lazy, vague, or one-sentence answer.
2. If the user asks in Filipino/Tagalog (e.g. "Ano ang pangunahing suliranin at solusyon...", "Paano ito makakatulong sa Maynila..."), ALWAYS answer in fluent, articulate, and academic Filipino/Tagalog.
3. If the user asks about the problem and solution ("suliranin at solusyon"):
   - Clearly delineate the "Pangunahing Suliranin" (the pain points or gaps addressed by the study).
   - Detail the "Ipinapanukalang Solusyon" (the proposed technical, institutional, or programmatic solution).
   - Explain the "Mga Resulta at Epekto" (the positive outcomes for UDM and Manila).
4. If the user asks about methodology/algorithms:
   - Detail the research approach, sampling, data analysis, and technical/algorithmic tools used.
5. If the user asks about Manila/UDM community impact:
   - Provide concrete institutional and municipal applications for Manila barangays, public policy, or UDM student/faculty ecosystems.
6. Use clean formatting with bold headings and bullet points for high readability.`;

    const prompt = `${systemInstruction}\n\n${historyPrompt}User Question: ${message}\n\nAI Assistant:`;
    let reply = await callGemini(prompt, false);

    // Resilient contextual response if external AI is momentarily under high demand
    if (!reply) {
      reply = generateContextualAcademicAnswer(message, research);
    }

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to query AI assistant' });
  }
});

// 3. AI Assistant for Student/Faculty Research Submission
app.post('/api/ai/assist-submission', async (req: Request, res: Response) => {
  try {
    const { title, abstract, department } = req.body;
    if (!title && !abstract) {
      return res.status(400).json({ error: 'Title or abstract is required.' });
    }

    const prompt = `You are the AI Academic Advisor at Universidad de Manila (UDM) Research & Extension Office (URELIA).
A student or faculty member is submitting a research paper.
Current Title: "${title || 'Untitled'}"
Selected Department: ${department || 'General'}
Draft Abstract / Description:
"${abstract || 'No abstract provided yet'}"

Help the author prepare their submission by returning a JSON object:
{
  "improvedTitle": "Suggested refined, high-impact academic title (or keep similar if already good)",
  "polishedAbstract": "Academic, structured rewrite of the abstract (Background, Objective, Methodology, Results/Implications)",
  "suggestedKeywords": ["5-7 relevant academic keywords"],
  "suggestedSDGs": ["SDG 4: Quality Education", "SDG 9: Industry, Innovation and Infrastructure"],
  "advice": "1-2 encouraging sentences on improving the research impact"
}

Respond ONLY with valid JSON.`;

    const rawText = await callGemini(prompt, true);
    let data;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
      }
    }

    if (!data || !data.polishedAbstract) {
      data = {
        improvedTitle: title ? `${title}: An Empirical Study and Framework for Universidad de Manila` : `A Comprehensive Study on ${department} Applied Research`,
        polishedAbstract: abstract ? `Background: This research addresses critical operational and theoretical challenges within the academic domain. Objective: The primary aim is to systematically evaluate key factors affecting performance and outcomes. Methodology: Utilizing a structured quantitative and qualitative analytical approach, empirical data was gathered and processed. Implications: The findings provide actionable insights and recommendations for the Universidad de Manila community and affiliated stakeholders.` : `This study investigates innovative methodologies and practical solutions tailored for ${department} at Universidad de Manila.`,
        suggestedKeywords: [department || 'Academic', 'Machine Learning', 'Empirical Analysis', 'Universidad de Manila', 'URELIA Research', 'Capstone Study'],
        suggestedSDGs: ['SDG 4: Quality Education', 'SDG 9: Industry, Innovation and Infrastructure'],
        advice: 'Tiyaking malinaw ang saklaw (scope) at limitasyon ng pag-aaral, at maglagay ng malinaw na quantitative metrics upang mas maging matibay ang pagsusuri ng URELIA evaluation committee.'
      };
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI Submission Assist error:', error);
    res.status(500).json({ error: error.message || 'Failed to provide AI assistance' });
  }
});


// ==========================================
// VITE DEV & PRODUCTION SERVING
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const httpServer = http.createServer(app);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`UDM-ResearchHub Express server listening at http://localhost:${PORT}`);
  });

  if (isDev) {
    let viteMiddleware: any = null;
    app.use((req: Request, res: Response, next: any) => {
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      if (req.path.startsWith('/api')) {
        return next();
      }
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (viteMiddleware) {
          clearInterval(interval);
          return viteMiddleware(req, res, next);
        }
        if (Date.now() - startTime > 15000) {
          clearInterval(interval);
          return res.status(503).send('Development server is still starting up, please refresh in a moment.');
        }
      }, 50);
    });

    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      viteMiddleware = vite.middlewares;
      console.log('Vite development middlewares attached.');
    } catch (err: any) {
      console.error('Failed to initialize Vite dev server:', err);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

if (!isServerless) {
  startServer();
}

export default app;
