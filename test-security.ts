/**
 * Automated Security & Integrity Test Suite for UDM-ResearchHub
 * Covers OWASP API Security, Role/College Locks (#5), Researcher Rules (#6),
 * Authentication, RBAC, IDOR, CSRF, Upload Hardening, and XSS Resilience (#8).
 */

const BASE = process.env.TEST_URL || 'http://127.0.0.1:3199';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'TestDemoPass#2026';

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

async function loginAs(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  return { res, data, token: data?.token as string | undefined };
}

async function runSecurityTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log('  [PASS]', testName);
      passed++;
    } else {
      console.error('  [FAIL]', testName);
      failed++;
    }
  }

  console.log('====================================================');
  console.log('   UDM-ResearchHub Security & Integrity Test Suite   ');
  console.log('   Universidad de Manila - URELIA Office Archival   ');
  console.log('====================================================\n');

  await waitForServer();

  // TEST 1: Health & Security Response Headers
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'online', 'Health Check Online & Accessible');
    assert(data.institution.includes('Universidad de Manila'), 'System Identity Verified for UDM');
    assert(
      res.headers.get('x-content-type-options') === 'nosniff' &&
      res.headers.get('x-frame-options') === 'SAMEORIGIN' &&
      !res.headers.get('x-powered-by'),
      'Security Headers Present & X-Powered-By Disabled'
    );
  } catch (e: any) {
    assert(false, 'Health & Headers check failed: ' + e.message);
  }

  // TEST 2: Unauthenticated Access Blocked (401)
  try {
    const [rUsers, rSettings, rSubs, rUpload, rRec, rAi] = await Promise.all([
      fetch(`${BASE}/api/admin/users`),
      fetch(`${BASE}/api/admin/settings`),
      fetch(`${BASE}/api/submissions`),
      fetch(`${BASE}/api/upload-pdf`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
      fetch(`${BASE}/api/recommendations/USR-UDM-001`),
      fetch(`${BASE}/api/ai/summarize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    ]);
    assert(
      [rUsers, rSettings, rSubs, rUpload, rRec, rAi].every(r => r.status === 401),
      'Authentication Guard: All protected admin/submission/upload/AI routes return 401 unauthenticated'
    );
  } catch (e: any) {
    assert(false, 'Unauthenticated block check failed: ' + e.message);
  }

  // TEST 3: Wrong Password Rejection & Registration OTP Bypass Disabled
  try {
    const wrongRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sysadmin@udm.edu.ph', password: 'WrongPassword!123' })
    });
    assert(wrongRes.status === 401, 'Broken Auth Fixed: Rejects incorrect password with 401');

    const bypassReg = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bypass Tester',
        email: 'bypass.tester@udm.edu.ph',
        password: 'ValidPassword123',
        role: 'student',
        college: 'CCS'
      })
    });
    assert(bypassReg.status === 403, 'OTP Enforcement: Blocks unverified direct /api/auth/register bypass with 403');
  } catch (e: any) {
    assert(false, 'Auth/OTP bypass check failed: ' + e.message);
  }

  // TEST 4: Cross-Origin CSRF Guard on Mutating API Calls
  try {
    const csrfRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://malicious-attacker.example'
      },
      body: JSON.stringify({ email: 'sysadmin@udm.edu.ph', password: DEMO_PASSWORD })
    });
    assert(csrfRes.status === 403, 'CSRF Guard: Blocks cross-origin POST request with 403');
  } catch (e: any) {
    assert(false, 'CSRF check failed: ' + e.message);
  }

  // TEST 5: Backend Validation (#5 College Lock & #6 Researcher Rules via Direct API / Postman)
  try {
    const personnelCollegeSpoof = await fetch(`${BASE}/api/auth/send-verification-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Tampered Personnel',
        email: 'tamper.personnel@udm.edu.ph',
        password: 'ValidPassword123',
        role: 'urelia_personnel',
        college: 'CCS'
      })
    });
    assert(
      personnelCollegeSpoof.status === 400,
      'College Lock (#5): Rejects URELIA Personnel signup attempting custom college CCS (400)'
    );

    const directorCollegeSpoof = await fetch(`${BASE}/api/auth/send-verification-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Tampered Director',
        email: 'tamper.director@udm.edu.ph',
        password: 'ValidPassword123',
        role: 'urelia_director',
        college: 'CED'
      })
    });
    assert(
      directorCollegeSpoof.status === 400,
      'College Lock (#5): Rejects URELIA Director signup attempting custom college CED (400)'
    );

    const emptyResearcherUnit = await fetch(`${BASE}/api/auth/send-verification-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Empty Researcher',
        email: 'empty.researcher@udm.edu.ph',
        password: 'ValidPassword123',
        role: 'researcher',
        college: 'CCS',
        administratorOf: '     '
      })
    });
    assert(
      emptyResearcherUnit.status === 400,
      'Researcher Rule (#6): Rejects whitespace-only "Administrator of" input with 400'
    );

    const longResearcherUnit = await fetch(`${BASE}/api/auth/send-verification-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Long Researcher',
        email: 'long.researcher@udm.edu.ph',
        password: 'ValidPassword123',
        role: 'researcher',
        college: 'CCS',
        administratorOf: 'A'.repeat(101)
      })
    });
    assert(
      longResearcherUnit.status === 400,
      'Researcher Rule (#6): Rejects >100 character "Administrator of" input with 400'
    );
  } catch (e: any) {
    assert(false, '#5/#6 Registration API validation check failed: ' + e.message);
  }

  // TEST 6: Authenticated Admin, Researcher Role Creation, Filtering & Password Sanitization
  let adminToken = '';
  const researcherEmail = `researcher.audit.${Date.now()}@udm.edu.ph`;
  const researcherPass = 'ResearcherPass#2026';

  try {
    const adminLogin = await loginAs('sysadmin@udm.edu.ph', DEMO_PASSWORD);
    adminToken = adminLogin.token || '';
    const setCookieHeader = adminLogin.res.headers.get('set-cookie') || '';
    assert(
      adminLogin.res.status === 200 &&
      Boolean(adminToken) &&
      adminLogin.data.user &&
      !('password' in adminLogin.data.user) &&
      setCookieHeader.toLowerCase().includes('httponly'),
      'Admin Login Issues Signed Session Token & HttpOnly Cookie Without Password Exposure'
    );

    // Admin cannot bypass College Lock (#5) via POST /api/admin/users
    const spoofCreate = await fetch(`${BASE}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Bad Personnel',
        email: `bad.personnel.${Date.now()}@udm.edu.ph`,
        password: 'ValidPassword123',
        role: 'urelia_personnel',
        college: 'CCS'
      })
    });
    assert(spoofCreate.status === 400, 'Admin Create User Enforces #5 College Lock (400)');

    // Admin creates valid Researcher (#6) with spaces trimmed cleanly
    const createRes = await fetch(`${BASE}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Dr. Elena Cruz',
        email: researcherEmail,
        password: researcherPass,
        role: 'researcher',
        college: 'CCS',
        administratorOf: '  Office of Institutional Research  '
      })
    });
    const createdData = await createRes.json();
    assert(
      createRes.status === 201 &&
      createdData.user?.role === 'researcher' &&
      createdData.user?.administratorOf === 'Office of Institutional Research',
      'Admin Create Researcher (#6) Trims & Persists Administrator Affiliation'
    );

    const listRes = await fetch(`${BASE}/api/admin/users?role=researcher`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const researchers = await listRes.json();
    assert(
      listRes.status === 200 &&
      Array.isArray(researchers) &&
      researchers.length >= 1 &&
      researchers.every((u: any) => u.role === 'researcher' && !('password' in u)),
      'Admin Directory Filter (role=researcher) & Password Stripping Verified'
    );
  } catch (e: any) {
    assert(false, 'Admin & Researcher user test failed: ' + e.message);
  }

  // TEST 7: Student RBAC & Cross-User IDOR Prevention
  try {
    const studentLogin = await loginAs('jdelacruz@udm.edu.ph', DEMO_PASSWORD);
    const studentToken = studentLogin.token || '';
    assert(studentLogin.res.status === 200 && Boolean(studentToken), 'Student Authenticated Cleanly');

    const [admAttempt, idorRecAttempt, submitAttempt, reviewAttempt] = await Promise.all([
      fetch(`${BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${studentToken}` } }),
      fetch(`${BASE}/api/recommendations/USR-UDM-004`, { headers: { Authorization: `Bearer ${studentToken}` } }),
      fetch(`${BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({
          title: 'Unauthorized Student Paper',
          abstract: 'This abstract is sufficiently long to pass the minimum length constraint of 50 chars.',
          authors: ['Juan Dela Cruz'],
          department: 'CCS',
          course: 'BSCS',
          publicationType: 'published',
          publicationProof: { externalUrl: 'https://example.org/paper', publisherName: 'IEEE' }
        })
      }),
      fetch(`${BASE}/api/submissions/SUB-2026-001/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
        body: JSON.stringify({ status: 'approved' })
      })
    ]);

    assert(admAttempt.status === 403, 'RBAC: Student blocked from /api/admin/users (403)');
    assert(idorRecAttempt.status === 403, 'IDOR: Student blocked from accessing another user recommendations (403)');
    assert(submitAttempt.status === 403, 'RBAC: Student blocked from submitting research (403)');
    assert(reviewAttempt.status === 403, 'RBAC: Student blocked from reviewing submissions (403)');
  } catch (e: any) {
    assert(false, 'Student RBAC/IDOR test failed: ' + e.message);
  }

  // TEST 8: Researcher Published-Only Enforcement (#6), URL XSS & PDF Magic-Byte Check (#8)
  try {
    const resLogin = await loginAs(researcherEmail, researcherPass);
    const resToken = resLogin.token || '';
    assert(resLogin.res.status === 200 && Boolean(resToken), 'Researcher Logged In Successfully');

    const unpubSub = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resToken}` },
      body: JSON.stringify({
        title: 'Unpublished Study Attempt',
        abstract: 'Sufficiently descriptive academic abstract over fifty characters long for validation check.',
        authors: ['Dr. Elena Cruz'],
        department: 'CCS',
        course: 'BSCS',
        publicationType: 'unpublished'
      })
    });
    assert(unpubSub.status === 403, 'Researcher Rule (#6): Backend blocks Unpublished submission with 403');

    const jsUrlSub = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resToken}` },
      body: JSON.stringify({
        title: 'XSS URL Attempt',
        abstract: 'Sufficiently descriptive academic abstract over fifty characters long for validation check.',
        authors: ['Dr. Elena Cruz'],
        department: 'CCS',
        course: 'BSCS',
        publicationType: 'published',
        publicationProof: {
          externalUrl: 'javascript:alert(document.domain)',
          publisherName: 'Malicious Press'
        }
      })
    });
    assert(jsUrlSub.status === 400, 'XSS Prevention: Rejects javascript: publicationProof URL with 400');

    const validPubSub = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resToken}` },
      body: JSON.stringify({
        title: 'Published Capstone Benchmarking Study',
        abstract: 'Sufficiently descriptive academic abstract over fifty characters long for validation check.',
        authors: ['Dr. Elena Cruz'],
        department: 'CCS',
        course: 'BSCS',
        publicationType: 'published',
        publicationProof: {
          externalUrl: 'https://ieeexplore.ieee.org/document/999999',
          publisherName: 'IEEE Access'
        }
      })
    });
    assert(validPubSub.status === 201, 'Researcher Rule (#6): Accepts valid Published submission (201)');

    const fakePdf = Buffer.from('<script>alert(1)</script>').toString('base64');
    const badUpload = await fetch(`${BASE}/api/upload-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resToken}` },
      body: JSON.stringify({
        fileName: 'exploit.pdf',
        researchId: 'RES-TEST-001',
        fileBase64: fakePdf
      })
    });
    assert(badUpload.status === 400, 'Upload Hardening: Rejects non-PDF bytes disguised as .pdf (400)');
  } catch (e: any) {
    assert(false, 'Researcher submission/upload test failed: ' + e.message);
  }

  // TEST 9: URELIA Personnel College Lock (#5) in Submission Endpoint
  try {
    const staffLogin = await loginAs('mtan.research@udm.edu.ph', DEMO_PASSWORD);
    const staffToken = staffLogin.token || '';
    const badDeptSub = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        title: 'Personnel Spoofed College Study',
        abstract: 'Sufficiently descriptive academic abstract over fifty characters long for validation check.',
        authors: ['Mark Anthony Tan'],
        department: 'CCS',
        course: 'URELIA Research',
        publicationType: 'unpublished'
      })
    });
    assert(badDeptSub.status === 403, 'College Lock (#5): Blocks URELIA Personnel submitting under non-FAC-ADM college (403)');
  } catch (e: any) {
    assert(false, 'URELIA Personnel college lock submission test failed: ' + e.message);
  }

  // TEST 10: State Machine, 404 Isolation, XSS Query Search, AI Guardrails
  try {
    const reviewRes = await fetch(`${BASE}/api/submissions/SUB-2026-TEST/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'invalid_status' })
    });
    assert(reviewRes.status === 400, 'State Machine Security: Rejects invalid review status transitions (400)');

    const notFoundRes = await fetch(`${BASE}/api/research/INVALID-NONEXISTENT-ID`);
    assert(notFoundRes.status === 404, 'Data Isolation: Returns 404 on invalid record lookups');

    const xssPayload = encodeURIComponent('<script>alert("xss")</script>');
    const xssRes = await fetch(`${BASE}/api/research?query=${xssPayload}`);
    const xssData = await xssRes.json();
    assert(xssRes.status === 200 && Array.isArray(xssData.items), 'XSS Resilience: Safely queries malicious input');

    const aiRes = await fetch(`${BASE}/api/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({})
    });
    assert(aiRes.status === 400, 'AI API Guardrail: Rejects empty authenticated AI requests with 400');
  } catch (e: any) {
    assert(false, 'State/Isolation/XSS/AI test failed: ' + e.message);
  }

  console.log(`\n====================================================`);
  console.log(`   Security Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
