/**
 * Machine Learning Engine for UDM-ResearchHub
 * Implements:
 * 1. TF-IDF (Term Frequency - Inverse Document Frequency) search relevance scoring
 * 2. Tokenization & text preprocessing with stopword removal
 * 3. Hybrid Recommendation Engine combining:
 *    - Content-Based Filtering (College, Course, Keywords & Reading History)
 *    - Collaborative Filtering (User-User Academic Cosine Similarity)
 */

import { Research, User, Recommendation, UDM_COLLEGES } from '../types';

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these',
  'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Tokenize a string into cleaned lowercase alphanumeric terms without stopwords.
 * Length threshold >= 2 allows indexing acronyms like AI, ML, IT, VR, AR, DB, OS, 5G.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 2 && !STOPWORDS.has(token));
}

/**
 * Extract tokens representing a research paper for corpus TF-IDF
 * Indexes: Title, Abstract, Keywords, Authors, Course/Program, and College/Department
 */
export function getResearchTokens(research: {
  title: string;
  abstract: string;
  keywords: string[];
  authors?: string[];
  department?: string;
  course?: string;
}): string[] {
  const titleTokens = tokenize(research.title);
  const abstractTokens = tokenize(research.abstract);
  const keywordTokens = (research.keywords || []).flatMap(k => tokenize(k));
  const authorTokens = (research.authors || []).flatMap(a => tokenize(a));
  const deptTokens = tokenize(research.department || '');
  const courseTokens = tokenize(research.course || '');

  // Weighted tokens: title, keywords, authors and course have highest occurrence
  return [
    ...titleTokens,
    ...titleTokens,
    ...titleTokens,
    ...keywordTokens,
    ...keywordTokens,
    ...keywordTokens,
    ...authorTokens,
    ...authorTokens,
    ...authorTokens,
    ...courseTokens,
    ...courseTokens,
    ...deptTokens,
    ...abstractTokens
  ];
}

/**
 * Calculate Inverse Document Frequency (IDF) table across all documents
 */
export function calculateIDF(corpusTokens: string[][]): Record<string, number> {
  const docCount = corpusTokens.length;
  if (docCount === 0) return {};

  const docFreq: Record<string, number> = {};

  for (const doc of corpusTokens) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      docFreq[term] = (docFreq[term] || 0) + 1;
    }
  }

  const idf: Record<string, number> = {};
  for (const [term, freq] of Object.entries(docFreq)) {
    idf[term] = Math.log((docCount + 1) / (freq + 1)) + 1;
  }

  return idf;
}

/**
 * Compute Term Frequency (TF) for a document
 */
export function calculateTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total tokens
  for (const token of Object.keys(tf)) {
    tf[token] = tf[token] / tokens.length;
  }

  return tf;
}

/**
 * Score research paper relevance against a user search query using TF-IDF and field matching.
 * Thoroughly searches across: Title, Abstract, Keywords, Authors, and Topics (Course & College).
 */
export function scoreSearchRelevance(
  query: string,
  research: Research,
  idf: Record<string, number>
): number {
  const rawQuery = (query || '').trim();
  if (!rawQuery) return 1.0;

  const queryLower = rawQuery.toLowerCase();
  const queryTokens = tokenize(rawQuery);
  const effectiveTokens = queryTokens.length > 0 ? queryTokens : [queryLower];

  const docTokens = getResearchTokens(research);
  const tf = calculateTF(docTokens);

  let rawScore = 0;
  let matches = 0;

  const titleLower = (research.title || '').toLowerCase();
  const abstractLower = (research.abstract || '').toLowerCase();
  const keywordsArray = (research.keywords || []).map(k => k.toLowerCase());
  const keywordsLower = keywordsArray.join(' ');
  const authorsArray = (research.authors || []).map(a => a.toLowerCase());
  const authorsLower = authorsArray.join(' ');
  const courseLower = (research.course || '').toLowerCase();
  const deptLower = (research.department || '').toLowerCase();
  const collegeObj = UDM_COLLEGES.find(c => c.id === research.department);
  const collegeNameLower = (collegeObj?.name || '').toLowerCase();

  // 1. Direct Full-Query Exact & Substring Matches (Highest precision)
  if (titleLower.includes(queryLower)) {
    rawScore += 12.0;
    matches++;
  }
  if (authorsArray.some(a => a.includes(queryLower)) || authorsLower.includes(queryLower)) {
    rawScore += 12.0;
    matches++;
  }
  if (keywordsArray.some(k => k.includes(queryLower)) || keywordsLower.includes(queryLower)) {
    rawScore += 10.0;
    matches++;
  }
  if (courseLower.includes(queryLower) || collegeNameLower.includes(queryLower)) {
    rawScore += 8.0;
    matches++;
  }
  if (deptLower === queryLower || queryLower.includes(deptLower)) {
    rawScore += 6.0;
    matches++;
  }
  if (abstractLower.includes(queryLower)) {
    rawScore += 4.0;
    matches++;
  }

  // 2. Token-level TF-IDF and Individual Field Matches
  for (const qToken of effectiveTokens) {
    const tokenTf = tf[qToken] || 0;
    const tokenIdf = idf[qToken] || 1.5;
    let tokenMatched = false;

    if (tokenTf > 0) {
      tokenMatched = true;
      rawScore += tokenTf * tokenIdf * 2.0;
    }

    if (titleLower.includes(qToken)) {
      rawScore += 3.5;
      tokenMatched = true;
    }
    if (authorsLower.includes(qToken)) {
      rawScore += 4.0;
      tokenMatched = true;
    }
    if (keywordsLower.includes(qToken)) {
      rawScore += 3.0;
      tokenMatched = true;
    }
    if (courseLower.includes(qToken) || collegeNameLower.includes(qToken)) {
      rawScore += 2.5;
      tokenMatched = true;
    }
    if (abstractLower.includes(qToken)) {
      rawScore += 1.0;
      tokenMatched = true;
    }
    if (deptLower === qToken || deptLower.includes(qToken)) {
      rawScore += 3.0;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matches++;
    }
  }

  // 3. Multi-token coverage requirement
  if (effectiveTokens.length > 1) {
    const matchedCount = effectiveTokens.filter(t =>
      titleLower.includes(t) ||
      authorsLower.includes(t) ||
      keywordsLower.includes(t) ||
      courseLower.includes(t) ||
      collegeNameLower.includes(t) ||
      abstractLower.includes(t) ||
      deptLower.includes(t)
    ).length;

    // Discard false positives if none of the query tokens matched and no phrase match
    if (matchedCount === 0 && !titleLower.includes(queryLower) && !authorsLower.includes(queryLower) && !keywordsLower.includes(queryLower)) {
      return 0;
    }

    // Scale by fraction of query tokens satisfied
    rawScore = rawScore * (matchedCount / effectiveTokens.length);
  }

  if (matches === 0 && rawScore === 0) {
    return 0;
  }

  // Normalize score between 1 and 100
  const normalized = Math.min(100, Math.round((rawScore / (effectiveTokens.length * 3.0)) * 100));
  return Math.max(1, normalized);
}

/**
 * Hybrid Recommendation Engine (Content-Based + Collaborative Filtering)
 */
export function generateHybridRecommendations(
  user: User,
  allUsers: User[],
  allResearch: Research[],
  contentWeight = 0.6,
  collabWeight = 0.4
): (Recommendation & { matchReasons?: string[]; contentScore?: number })[] {
  const approvedPapers = allResearch.filter(r => r.status === 'approved' || !r.status);
  if (approvedPapers.length === 0) return [];

  const userReadHistory = new Set(user.readingHistory || []);
  const scores: (Recommendation & { matchReasons?: string[]; contentScore?: number })[] = [];

  // 1. Content-Based Scoring: Match User College, Course, and historical keywords
  const userCollege = user.college || 'CCS';
  const userCourse = user.course || '';

  // Extract preferred topics from reading history
  const historyPapers = approvedPapers.filter(r => userReadHistory.has(r.researchID));
  const preferredKeywords = new Set<string>();
  for (const p of historyPapers) {
    for (const kw of p.keywords || []) {
      preferredKeywords.add(kw.toLowerCase());
    }
  }

  // 2. Collaborative Filtering: Find academic peers in the same college / course
  const peers = allUsers.filter(u => u.userID !== user.userID && (u.college === userCollege || u.course === userCourse));
  const peerReadCounts: Record<string, number> = {};

  for (const peer of peers) {
    for (const paperId of peer.readingHistory || []) {
      peerReadCounts[paperId] = (peerReadCounts[paperId] || 0) + 1;
    }
  }

  for (const paper of approvedPapers) {
    // We can recommend papers even if read, but prioritize unread
    const isUnread = !userReadHistory.has(paper.researchID);
    const matchReasons: string[] = [];

    // --- Content Score (0 - 100) ---
    let contentScore = 0;

    // College alignment
    if (paper.department === userCollege) {
      contentScore += 45;
      matchReasons.push(`Official ${userCollege} Curriculum`);
    }

    // Course alignment
    if (userCourse && paper.course && (paper.course.includes(userCourse) || userCourse.includes(paper.course))) {
      contentScore += 25;
      matchReasons.push(`Direct match for ${userCourse}`);
    }

    // Historical topic interest match
    let topicOverlap = 0;
    for (const kw of paper.keywords || []) {
      if (preferredKeywords.has(kw.toLowerCase())) {
        topicOverlap++;
      }
    }
    if (topicOverlap > 0) {
      contentScore += Math.min(25, topicOverlap * 10);
      matchReasons.push(`Shares research themes with your reading history`);
    }

    // Popularity prior (views and downloads)
    const popularityBonus = Math.min(10, ((paper.viewsCount || 0) * 0.1) + ((paper.downloadsCount || 0) * 0.5));
    contentScore += popularityBonus;
    contentScore = Math.min(100, contentScore);

    // --- Collaborative Score (0 - 100) ---
    let collabScore = 0;
    const peerReads = peerReadCounts[paper.researchID] || 0;
    if (peerReads > 0) {
      collabScore = Math.min(100, peerReads * 30 + 20);
      matchReasons.push(`Trending among ${userCollege} peers and faculty`);
    } else {
      // General peer interest baseline
      collabScore = Math.min(50, (paper.viewsCount || 0) * 2);
    }

    // --- Hybrid Combination ---
    let hybridScore = Math.round((contentScore * contentWeight) + (collabScore * collabWeight));
    if (isUnread) {
      hybridScore = Math.min(100, hybridScore + 5);
    }

    if (matchReasons.length === 0) {
      matchReasons.push(`Recommended academic research across Universidad de Manila`);
    }

    scores.push({
      recommendID: `rec-${user.userID}-${paper.researchID}`,
      userID: user.userID,
      researchID: paper.researchID,
      score: hybridScore / 100,
      contentBasedScore: contentScore / 100,
      collaborativeScore: collabScore / 100,
      matchedKeywords: (paper.keywords && paper.keywords.length > 0) ? paper.keywords : [paper.department, 'Academic Research'],
      matchReasons: Array.from(new Set(matchReasons)),
      contentScore
    });
  }

  // Sort descending by highest score
  scores.sort((a, b) => b.score - a.score);
  return scores;
}
