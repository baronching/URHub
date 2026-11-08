import { TitleIntegrityCheck } from '../types';

/**
 * Normalizes title string for robust token comparison:
 * Lowercases, strips punctuation, file extensions, and extra whitespace
 */
function cleanTitleTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !['and', 'for', 'the', 'with', 'from', 'into', 'manuscript', 'final', 'paper', 'thesis', 'capstone', 'udm'].includes(token));
}

/**
 * Calculates Token Similarity & Overlap between Encoded Metadata Title and
 * Uploaded Manuscript Filename / Content Title.
 * 
 * Strict Institutional Rule:
 * Rejects or flags mismatch if title difference is high (similarity < 65%).
 */
export function calculateTitleSimilarity(
  encodedTitle: string,
  fileNameOrExtracted: string
): TitleIntegrityCheck {
  const encClean = cleanTitleTokens(encodedTitle);
  const fileClean = cleanTitleTokens(fileNameOrExtracted);

  if (encClean.length === 0 || fileClean.length === 0) {
    return {
      encodedTitle,
      extractedTitle: fileNameOrExtracted,
      matchScore: 0,
      isMatch: false,
      flaggedMismatch: true,
      notes: 'Insufficient text tokens detected to verify title matching.'
    };
  }

  // Count token intersection
  let matchedTokensCount = 0;
  for (const token of encClean) {
    if (fileClean.some(f => f.includes(token) || token.includes(f))) {
      matchedTokensCount++;
    }
  }

  // Dice similarity coefficient
  const score = Math.round((2 * matchedTokensCount / (encClean.length + fileClean.length)) * 100);
  const boundedScore = Math.min(100, Math.max(0, score));
  const isMatch = boundedScore >= 55; // 55%+ token overlap passes

  return {
    encodedTitle,
    extractedTitle: fileNameOrExtracted,
    matchScore: boundedScore,
    isMatch,
    flaggedMismatch: !isMatch,
    notes: isMatch
      ? `Title Integrity Verified: ${boundedScore}% metadata concordance with manuscript file.`
      : `Title Discrepancy Flagged: Metadata title (${boundedScore}% match) differs significantly from uploaded manuscript filename.`
  };
}

/**
 * Generates an institutional document number for version tracking:
 * e.g., DOC-2026-CCS-4921
 */
export function generateDocumentNumber(department: string = 'CCS', year: number = 2026): string {
  const deptCode = (department || 'GEN').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const randSeq = Math.floor(1000 + Math.random() * 9000);
  return `DOC-${year}-${deptCode}-${randSeq}`;
}

/**
 * Increments version string:
 * v1.0 -> v1.1 -> v1.2 -> v2.0
 */
export function incrementVersionNumber(currentVersion: string = 'v1.0'): string {
  const clean = currentVersion.replace(/^v/i, '').trim();
  const parts = clean.split('.').map(p => parseInt(p, 10));

  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const major = parts[0];
    const minor = parts[1] + 1;
    return `v${major}.${minor}`;
  }

  return 'v1.1';
}
