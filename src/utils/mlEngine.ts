/**
 * Machine Learning Engine for UDM-ResearchHub
 * Implements:
 * 1. TF-IDF (Term Frequency - Inverse Document Frequency) Vectorization
 * 2. Cosine Similarity Matrix Computation
 * 3. Content-Based Filtering
 * 4. Collaborative Filtering
 */

import { Research, Recommendation, User } from '../types';

// Stopwords to filter out during TF-IDF tokenization
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'did', 'do', 'does', 'doing', 'done', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'udm', 'manila', 'universidad', 'research', 'study', 'using', 'based', 'analysis'
]);

/**
 * Tokenize and normalize text string into clean keywords array
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate Term Frequency (TF) for tokens in a document
 */
export function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;
  if (totalTokens === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total tokens in document
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / totalTokens);
  }

  return tf;
}

/**
 * Calculate Inverse Document Frequency (IDF) across a corpus of research papers
 */
export function calculateIDF(corpusTokens: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = corpusTokens.length;
  if (N === 0) return idf;

  const docFrequency = new Map<string, number>();

  for (const tokens of corpusTokens) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    }
  }

  for (const [token, df] of docFrequency.entries()) {
    // Standard IDF formula with smooth log: log(N / df) + 1
    idf.set(token, Math.log((N + 1) / (df + 1)) + 1);
  }

  return idf;
}

/**
 * Extract combined TF-IDF feature vector for a Research paper
 */
export function getResearchTokens(research: Research): string[] {
  const titleTokens = tokenizeText(research.title);
  const abstractTokens = tokenizeText(research.abstract);
  const keywordTokens = research.keywords.flatMap(kw => tokenizeText(kw));
  const deptTokens = tokenizeText(research.department);
  const courseTokens = tokenizeText(research.course);

  // Give double weight to title, keywords, and department
  return [
    ...titleTokens, ...titleTokens,
    ...keywordTokens, ...keywordTokens,
    ...deptTokens, ...deptTokens,
    ...courseTokens,
    ...abstractTokens
  ];
}

/**
 * Calculate Cosine Similarity between two TF-IDF weight vectors (Map<string, number>)
 */
export function calculateCosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, weightA] of vecA.entries()) {
    normA += weightA * weightA;
    if (vecB.has(term)) {
      dotProduct += weightA * (vecB.get(term) || 0);
    }
  }

  for (const weightB of vecB.values()) {
    normB += weightB * weightB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute Content-Based Filtering Scores for all research papers given a user's reading history
 */
export function computeContentBasedScores(
  user: User,
  allResearch: Research[]
): Map<string, { score: number; matchedKeywords: string[] }> {
  const results = new Map<string, { score: number; matchedKeywords: string[] }>();
  
  if (!allResearch.length) return results;

  // Build corpus tokens
  const corpusTokens = allResearch.map(getResearchTokens);
  const idf = calculateIDF(corpusTokens);

  // Compute TF-IDF vectors for each paper
  const researchVectors = new Map<string, Map<string, number>>();
  allResearch.forEach(p => {
    const tokens = getResearchTokens(p);
    const tf = calculateTF(tokens);
    const tfidf = new Map<string, number>();
    for (const [token, tfVal] of tf.entries()) {
      tfidf.set(token, tfVal * (idf.get(token) || 1.0));
    }
    researchVectors.set(p.researchID, tfidf);
  });

  // Construct User Profile Vector based on reading history + user's college/course
  const userTokens: string[] = [];
  if (user.readingHistory && user.readingHistory.length > 0) {
    user.readingHistory.forEach(id => {
      const p = allResearch.find(r => r.researchID === id);
      if (p) {
        userTokens.push(...getResearchTokens(p));
      }
    });
  }

  // Also seed with user's college and course preference
  if (user.college) userTokens.push(...tokenizeText(user.college), ...tokenizeText(user.college));
  if (user.course) userTokens.push(...tokenizeText(user.course));

  const userTF = calculateTF(userTokens);
  const userVector = new Map<string, number>();
  for (const [token, tfVal] of userTF.entries()) {
    userVector.set(token, tfVal * (idf.get(token) || 1.0));
  }

  // Calculate cosine similarity for each paper
  allResearch.forEach(p => {
    const paperVec = researchVectors.get(p.researchID) || new Map();
    const cosSim = calculateCosineSimilarity(userVector, paperVec);

    // Identify top matching terms
    const matchedKeywords: string[] = [];
    for (const term of userVector.keys()) {
      if (paperVec.has(term) && !matchedKeywords.includes(term)) {
        matchedKeywords.push(term);
        if (matchedKeywords.length >= 4) break;
      }
    }

    let score = cosSim * 1.3;
    if (user.college && p.department === user.college) {
      score += 0.25; // 25% departmental relevance boost for the target college
    }

    results.set(p.researchID, {
      score: Math.min(1.0, Math.max(0.0, score)),
      matchedKeywords
    });
  });

  return results;
}

/**
 * Compute Collaborative Filtering Scores based on User-Item Interaction Overlap
 */
export function computeCollaborativeFilteringScores(
  targetUser: User,
  allUsers: User[],
  allResearch: Research[]
): Map<string, number> {
  const scores = new Map<string, number>();
  
  if (!allUsers.length || !targetUser.readingHistory?.length) {
    // Default baseline for new users based on global view popularity + target college
    const maxViews = Math.max(...allResearch.map(r => r.viewsCount), 1);
    allResearch.forEach(r => {
      let base = r.viewsCount / maxViews;
      if (targetUser.college && r.department === targetUser.college) {
        base += 0.25;
      }
      scores.set(r.researchID, Math.min(1.0, base));
    });
    return scores;
  }

  const targetHistory = new Set(targetUser.readingHistory);

  // Find similar users based on Jaccard similarity of reading history
  const userSimilarities = new Map<string, number>();
  allUsers.forEach(u => {
    if (u.userID === targetUser.userID || !u.readingHistory?.length) return;
    const otherHistory = new Set(u.readingHistory);
    
    let intersection = 0;
    for (const id of targetHistory) {
      if (otherHistory.has(id)) intersection++;
    }

    const union = new Set([...targetHistory, ...otherHistory]).size;
    const jaccardSim = union > 0 ? intersection / union : 0;
    
    // College match bonus
    const collegeBonus = u.college === targetUser.college ? 0.2 : 0;
    userSimilarities.set(u.userID, jaccardSim + collegeBonus);
  });

  // Aggregate item recommendations weighted by user similarities
  allResearch.forEach(r => {
    let weightedSum = 0;
    let simSum = 0;

    allUsers.forEach(u => {
      if (u.userID === targetUser.userID) return;
      const sim = userSimilarities.get(u.userID) || 0;
      if (sim > 0) {
        const hasInteracted = u.readingHistory?.includes(r.researchID) ? 1 : 0;
        weightedSum += sim * hasInteracted;
        simSum += sim;
      }
    });

    const colScore = simSum > 0 ? weightedSum / simSum : (r.viewsCount / 100);
    const collegeBoost = (targetUser.college && r.department === targetUser.college) ? 0.2 : 0;
    scores.set(r.researchID, Math.min(1.0, colScore + collegeBoost));
  });

  return scores;
}

/**
 * Hybrid Machine Learning Recommendation Engine
 * Combines Content-Based Filtering (60%) and Collaborative Filtering (40%)
 */
export function generateHybridRecommendations(
  user: User,
  allUsers: User[],
  allResearch: Research[],
  contentWeight = 0.6,
  collabWeight = 0.4
): Recommendation[] {
  const approvedResearch = allResearch.filter(r => r.status === 'approved');
  if (!approvedResearch.length) return [];

  const cbMap = computeContentBasedScores(user, approvedResearch);
  const cfMap = computeCollaborativeFilteringScores(user, allUsers, approvedResearch);

  const recommendations: Recommendation[] = [];

  approvedResearch.forEach(r => {
    const cb = cbMap.get(r.researchID) || { score: 0.1, matchedKeywords: [] };
    const cf = cfMap.get(r.researchID) || 0.1;

    // Hybrid score formula
    const finalScore = Number(((cb.score * contentWeight) + (cf * collabWeight)).toFixed(3));

    recommendations.push({
      recommendID: `REC-${user.userID.substring(0, 4)}-${r.researchID}`,
      userID: user.userID,
      researchID: r.researchID,
      score: Math.min(0.99, Math.max(0.15, finalScore)),
      contentBasedScore: Number((cb.score).toFixed(2)),
      collaborativeScore: Number((cf).toFixed(2)),
      matchedKeywords: cb.matchedKeywords.length ? cb.matchedKeywords : r.keywords.slice(0, 3)
    });
  });

  // Sort by highest similarity score
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * TF-IDF Search Engine Relevance Scorer for Research Catalog
 */
export function scoreSearchRelevance(query: string, research: Research, idf: Map<string, number>): number {
  const trimmed = query.trim();
  if (!trimmed) return 1.0;

  const rawLowerQuery = trimmed.toLowerCase();
  const queryTokens = tokenizeText(trimmed);

  // If tokenization produced no words (e.g. short 1-2 char terms or pure punctuation), fall back to raw substring search
  if (!queryTokens.length) {
    const combined = `${research.title} ${research.abstract} ${research.keywords.join(' ')} ${research.authors.join(' ')} ${research.department} ${research.course || ''}`.toLowerCase();
    return combined.includes(rawLowerQuery) ? 1.0 : 0;
  }

  const docTokens = getResearchTokens(research);
  const docTF = calculateTF(docTokens);

  let score = 0;
  let matchedTermCount = 0;

  for (const token of queryTokens) {
    const tf = docTF.get(token) || 0;
    const tokenIDF = idf.get(token) || 1.0;
    let tokenMatched = false;

    // Direct title exact term match boost
    if (research.title.toLowerCase().includes(token)) {
      score += 3.0;
      tokenMatched = true;
    }
    // Keyword match boost
    if (research.keywords.some(k => k.toLowerCase().includes(token))) {
      score += 2.5;
      tokenMatched = true;
    }
    // Authors match boost
    if (research.authors.some(a => a.toLowerCase().includes(token))) {
      score += 2.0;
      tokenMatched = true;
    }
    // Department / Course match boost
    if (research.department.toLowerCase().includes(token) || (research.course && research.course.toLowerCase().includes(token))) {
      score += 1.5;
      tokenMatched = true;
    }

    if (tf > 0) {
      score += tf * tokenIDF * 2.0;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchedTermCount++;
    }
  }

  // Exact full-phrase match bonuses
  if (research.title.toLowerCase().includes(rawLowerQuery)) {
    score += 4.0;
    matchedTermCount++;
  } else if (research.abstract.toLowerCase().includes(rawLowerQuery)) {
    score += 2.0;
    matchedTermCount++;
  }

  // If no query terms matched anywhere in this document, return 0 (exclude from results)
  return matchedTermCount > 0 ? Number(score.toFixed(3)) : 0;
}
