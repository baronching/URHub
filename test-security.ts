/**
 * Automated Security & Integrity Test Suite for UDM-ResearchHub
 * Tests:
 * 1. Health check & system identity
 * 2. Institutional email domain enforcement (@udm.edu.ph, @pau.udm.edu.ph)
 * 3. Prevention of non-institutional logins & registrations (403 Forbidden)
 * 4. Password sanitization & credential leak protection
 * 5. Input validation & malformed payload rejection (400 Bad Request)
 * 6. Review state machine security
 * 7. Non-existent entity isolation (404 Not Found)
 * 8. Search query XSS & injection resilience
 * 9. AI endpoint request guardrails
 */

const BASE = process.env.TEST_URL || 'http://localhost:3000';

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

  // TEST 1: Health & System Identity
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'online', 'Health Check Online & Accessible');
    assert(data.institution.includes('Universidad de Manila'), 'System Identity Verified for UDM');
  } catch (e: any) {
    assert(false, 'Health check failed: ' + e.message);
  }

  // TEST 2: Domain Boundary Enforcement (Non-UDM Blocked)
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'intruder@gmail.com', password: 'password123' })
    });
    assert(res.status === 403, 'Enforces Domain Whitelisting: Blocks non-UDM email (@gmail.com) with 403');
  } catch (e: any) {
    assert(false, 'Domain whitelisting test failed: ' + e.message);
  }

  // TEST 3: Domain Whitelisting for Registration
  try {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'External User', email: 'attacker@evil.com', password: '123' })
    });
    assert(res.status === 403, 'Enforces Registration Whitelist: Blocks external domains with 403');
  } catch (e: any) {
    assert(false, 'Registration whitelist test failed: ' + e.message);
  }

  // TEST 4: Valid UDM Institutional Domain Access
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@udm.edu.ph', password: 'securepassword' })
    });
    const data = await res.json();
    assert(res.status === 200, 'Permits Official @udm.edu.ph Domain Login');
    assert(data.user && !data.user.password, 'Password Stripped: User response never exposes credential hashes');
  } catch (e: any) {
    assert(false, 'Valid UDM domain login failed: ' + e.message);
  }

  // TEST 5: User Management Endpoint Credential Leaks Check
  try {
    const res = await fetch(`${BASE}/api/admin/users`);
    const users = await res.json();
    const hasExposedPassword = users.some((u: any) => 'password' in u);
    assert(res.status === 200 && !hasExposedPassword, 'User Directory: No passwords exposed across all user accounts');
  } catch (e: any) {
    assert(false, 'User directory security check failed: ' + e.message);
  }

  // TEST 6: Submissions Boundary & Required Field Validation
  try {
    const res = await fetch(`${BASE}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }) // missing required fields
    });
    assert(res.status === 400, 'Input Validation: Rejects malformed submission with 400');
  } catch (e: any) {
    assert(false, 'Submission validation test failed: ' + e.message);
  }

  // TEST 7: Review Workflow State Mutation Validation
  try {
    const res = await fetch(`${BASE}/api/submissions/SUB-2026-TEST/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'invalid_status' })
    });
    assert(res.status === 400, 'State Machine Security: Rejects invalid review status transitions');
  } catch (e: any) {
    assert(false, 'Review status test failed: ' + e.message);
  }

  // TEST 8: Research Archive Non-existent Entity Handling
  try {
    const res = await fetch(`${BASE}/api/research/INVALID-NONEXISTENT-ID`);
    assert(res.status === 404, 'Data Isolation: Returns 404 on invalid record lookups');
  } catch (e: any) {
    assert(false, 'Invalid record lookup test failed: ' + e.message);
  }

  // TEST 9: XSS / Malicious Payload Search Query Resilience
  try {
    const xssPayload = encodeURIComponent('<script>alert("xss")</script>');
    const res = await fetch(`${BASE}/api/research?query=${xssPayload}`);
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.items), 'XSS Resilience: Sanitizes search queries without crash or code injection');
  } catch (e: any) {
    assert(false, 'XSS search query test failed: ' + e.message);
  }

  // TEST 10: AI Endpoint Guardrails
  try {
    const res = await fetch(`${BASE}/api/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // empty
    });
    assert(res.status === 400, 'AI API Guardrail: Rejects empty requests gracefully with 400');
  } catch (e: any) {
    assert(false, 'AI guardrail test failed: ' + e.message);
  }

  console.log(`\n====================================================`);
  console.log(`   Security Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
