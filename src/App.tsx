import React, { useState, useEffect, useMemo } from 'react';
import udmBuildingBg from './assets/images/udm_hero_building_1785654888561.jpg';
import { Research, Submission, AccessRequest, User, SearchFilters, Recommendation, UDMCollege } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SearchAndFilter } from './components/SearchAndFilter';
import { ResearchCard } from './components/ResearchCard';
import { ResearchDetailModal } from './components/ResearchDetailModal';
import { SubmissionFormModal } from './components/SubmissionFormModal';
import { RecommendationSection } from './components/RecommendationSection';
import { AdminReviewDashboard } from './components/AdminReviewDashboard';
import { AnalyticsAndReports } from './components/AnalyticsAndReports';
import { SuperAdminManagement } from './components/SuperAdminManagement';
import { SDGSection } from './components/SDGSection';
import { AuthModal } from './components/AuthModal';
import { PrivacyConsentModal } from './components/PrivacyConsentModal';
import { BookOpen, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  seedInitialDatabaseIfEmpty,
  subscribeToResearches,
  subscribeToSubmissions,
  subscribeToAccessRequests,
  recordResearchView,
  recordResearchDownload,
  recordUserReadingHistory,
  approveSubmission,
  rejectSubmission,
  reviewAccessRequest,
  createAccessRequest,
  logoutUserWithSupabase
} from './services/supabaseService';
import { calculateIDF, getResearchTokens, scoreSearchRelevance, generateHybridRecommendations } from './utils/mlEngine';
import { INITIAL_USERS, INITIAL_RESEARCH, INITIAL_SUBMISSIONS } from './data/mockDatabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('udm_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('archive');
  const [rawResearchList, setRawResearchList] = useState<Research[]>(INITIAL_RESEARCH);
  const [filteredResearchList, setFilteredResearchList] = useState<Research[]>(INITIAL_RESEARCH);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [accessRequestsList, setAccessRequestsList] = useState<AccessRequest[]>([]);
  const [recommendations, setRecommendations] = useState<(Recommendation & { paper?: Research })[]>([]);
  const [targetRecommendationCollege, setTargetRecommendationCollege] = useState<UDMCollege>('CCS');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(() => {
    // Show privacy pop-up if user has not yet consented
    return !localStorage.getItem('udm_privacy_consent_accepted');
  });
  const [isReviewingPrivacy, setIsReviewingPrivacy] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    college: 'ALL',
    year: 'ALL',
    keyword: 'ALL',
    sortBy: 'relevance'
  });

  // Protect Admin tabs if user is not authenticated or not an admin
  useEffect(() => {
    if (!currentUser && (activeTab === 'admin_review' || activeTab === 'analytics' || activeTab === 'super_admin')) {
      setActiveTab('archive');
    }
  }, [currentUser, activeTab]);

  // Show Toast
  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Safe handler for submission modal trigger
  const handleOpenSubmissionModal = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      triggerToast('Please log in with your UDM account to submit research papers.', 'error');
    } else {
      setShowSubmissionModal(true);
    }
  };

  // 1. Initialize & Subscribe to live Supabase database & Auth
  useEffect(() => {
    // Seed initial records if Supabase database is empty
    seedInitialDatabaseIfEmpty();

    // Live Supabase Auth state listener
    let unsubscribeAuth = () => {};
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            if (profile) {
              setCurrentUser({
                userID: profile.id,
                name: profile.name || profile.full_name || session.user.email?.split('@')[0],
                fullName: profile.full_name || profile.name,
                email: profile.email || session.user.email || '',
                role: profile.role || 'student_faculty',
                userType: profile.user_type || 'Student',
                college: profile.college || 'CCS',
                idNumber: profile.id_number || '',
                courseProgram: profile.course_program || '',
                readingHistory: profile.reading_history || []
              });
            }
          } catch (err) {
            console.warn('Could not load user profile from Supabase:', err);
          }
        } else {
          // If no active Supabase session, check if a demo user is logged in
          const savedDemoUser = localStorage.getItem('udm_active_user');
          if (!savedDemoUser) {
            setCurrentUser(null);
          }
        }
      });
      unsubscribeAuth = () => authListener.subscription.unsubscribe();
    }

    // Live subscription to Researches collection
    const unsubscribeResearches = subscribeToResearches((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setRawResearchList(data);
      }
    });

    // Live subscription to Submissions collection
    const unsubscribeSubmissions = subscribeToSubmissions((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSubmissionsList(data);
      }
    });

    // Live subscription to Access Requests collection
    const unsubscribeAccessRequests = subscribeToAccessRequests((data) => {
      setAccessRequestsList(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeResearches();
      unsubscribeSubmissions();
      unsubscribeAccessRequests();
    };
  }, []);

  // 2. Client-side Search & TF-IDF Relevance Scoring on live Firestore papers
  useEffect(() => {
    let list = rawResearchList.filter(r => r.status === 'approved' || !r.status);

    // Compute IDF across all approved papers in the corpus for stable weights
    const approvedCorpusTokens = list.map(getResearchTokens);
    const idf = calculateIDF(approvedCorpusTokens);

    // Combine category filters with clean AND logic
    if (filters.college !== 'ALL') {
      list = list.filter(r => r.department === filters.college);
    }

    if (filters.year !== 'ALL' && !isNaN(filters.year as number)) {
      list = list.filter(r => r.year === filters.year);
    }

    if (filters.keyword !== 'ALL') {
      list = list.filter(r => r.keywords.some(k => k.toLowerCase() === filters.keyword.toLowerCase()));
    }

    // Apply Search Query: calculate relevance and filter out zero/non-matching papers
    if (filters.query.trim()) {
      list = list
        .map(item => ({
          ...item,
          relevanceScore: scoreSearchRelevance(filters.query, item, idf)
        }))
        .filter(item => (item.relevanceScore || 0) > 0);

      if (filters.sortBy === 'relevance') {
        list.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      }
    }

    if (filters.sortBy === 'newest') {
      list.sort((a, b) => b.year - a.year || new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
    } else if (filters.sortBy === 'views') {
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    setFilteredResearchList(list);
  }, [rawResearchList, filters]);

  // Sync target recommendation college with user profile on login
  useEffect(() => {
    if (currentUser?.college) {
      setTargetRecommendationCollege(currentUser.college);
    }
  }, [currentUser?.college]);

  // 3. Generate ML Hybrid Recommendations
  useEffect(() => {
    if (!currentUser || rawResearchList.length === 0) return;

    const effectiveUser: User = {
      ...currentUser,
      college: targetRecommendationCollege || currentUser.college || 'CCS'
    };

    const recs = generateHybridRecommendations(
      effectiveUser,
      INITIAL_USERS,
      rawResearchList,
      0.6,
      0.4
    );

    const enriched = recs.map(rec => {
      const paper = rawResearchList.find(r => r.researchID === rec.researchID);
      return { ...rec, paper };
    }).filter(rec => rec.paper !== undefined);

    setRecommendations(enriched);
  }, [currentUser, rawResearchList, targetRecommendationCollege]);

  // 4. Calculate Analytics from live Firestore records
  useEffect(() => {
    const collegeBreakdown: Record<UDMCollege, number> = {
      CBM: 0, CAS: 0, CPPG: 0, CCS: 0, CHS: 0, CED: 0, CCJ: 0
    };
    const courseBreakdown: Record<string, number> = {};
    const yearlyDistribution: Record<number, number> = {};

    rawResearchList.forEach(r => {
      if (r.department in collegeBreakdown) {
        collegeBreakdown[r.department] += 1;
      }
      if (r.course) {
        courseBreakdown[r.course] = (courseBreakdown[r.course] || 0) + 1;
      }
      if (r.year) {
        yearlyDistribution[r.year] = (yearlyDistribution[r.year] || 0) + 1;
      }
    });

    const pendingCount = submissionsList.filter(s => s.status === 'pending').length;
    const approvedCount = submissionsList.filter(s => s.status === 'approved').length;
    const rejectedCount = submissionsList.filter(s => s.status === 'rejected').length;

    setAnalyticsData({
      totalResearches: rawResearchList.length,
      collegeBreakdown,
      courseBreakdown,
      yearlyDistribution,
      totalSubmissions: submissionsList.length,
      pendingCount,
      approvedCount,
      rejectedCount
    });
  }, [rawResearchList, submissionsList]);

  // Handle Paper Selection -> Increment View
  const handleSelectResearch = async (paper: Research) => {
    setSelectedResearch(paper);
    recordResearchView(paper.researchID);
    if (currentUser) {
      recordUserReadingHistory(currentUser.userID, paper.researchID);
    }
  };

  // Handle Abstract Download -> Increment Download
  const handleDownloadAbstract = (paper: Research, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedResearch(paper);
    recordResearchDownload(paper.researchID);
  };

  // Handle Admin Review Submission
  const handleReviewSubmission = async (
    submissionID: string,
    status: 'approved' | 'rejected',
    reviewNote: string
  ) => {
    try {
      const targetSub = submissionsList.find(s => s.submissionID === submissionID);
      if (!targetSub) throw new Error('Submission not found.');

      if (status === 'approved') {
        const approvedPaper: Research = {
          researchID: targetSub.researchID,
          title: targetSub.title,
          abstract: targetSub.abstract,
          authors: targetSub.authors,
          keywords: targetSub.keywords,
          department: targetSub.department,
          course: targetSub.course,
          year: targetSub.year,
          status: 'approved',
          viewsCount: 0,
          downloadsCount: 0,
          submittedBy: targetSub.submittedBy,
          dateAdded: new Date().toISOString().split('T')[0]
        };
        await approveSubmission(targetSub, approvedPaper);
      } else {
        await rejectSubmission(submissionID, reviewNote || 'Does not meet publication guidelines');
      }

      triggerToast(`Submission ${status} successfully!`);
    } catch (err: any) {
      triggerToast(err.message || 'Review failed', 'error');
    }
  };

  // Handle Access Request Creation by Student/Faculty
  const handleRequestAccess = async (research: Research) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      await createAccessRequest(currentUser, research);
      triggerToast('Access request submitted to URELIA Office!');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to submit access request', 'error');
    }
  };

  // Handle Access Request Review by Admin
  const handleReviewAccessRequest = async (
    requestID: string,
    status: 'approved' | 'rejected',
    reviewNote: string
  ) => {
    try {
      await reviewAccessRequest(
        requestID,
        status,
        reviewNote,
        currentUser?.name || 'Research Admin'
      );
      triggerToast(`Access request ${status} successfully!`);
    } catch (err: any) {
      triggerToast(err.message || 'Review failed', 'error');
    }
  };

  // Dynamically extract and rank keywords from the currently visible/matching research papers
  const availableKeywords = useMemo(() => {
    if (!filteredResearchList || filteredResearchList.length === 0) return [];

    const frequencyMap = new Map<string, number>();
    filteredResearchList.forEach(paper => {
      if (Array.isArray(paper.keywords)) {
        paper.keywords.forEach(kw => {
          const trimmed = kw.trim();
          if (trimmed) {
            frequencyMap.set(trimmed, (frequencyMap.get(trimmed) || 0) + 1);
          }
        });
      }
    });

    return Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([keyword]) => keyword)
      .slice(0, 8);
  }, [filteredResearchList]);

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans selection:bg-[#c9a84c] selection:text-[#1a4731] relative overflow-x-hidden w-full max-w-full">
      
      {/* Full-Page Fixed Background Image with Dark Green (#1a4731) Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={udmBuildingBg}
          alt="Universidad de Manila Campus Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Consistent dark green overlay (#1a4731) across the entire page */}
        <div className="absolute inset-0 bg-[#1a4731]/80 backdrop-blur-[1px]" />
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-center space-x-3 text-xs font-bold ${
              toastMsg.type === 'success'
                ? 'bg-[#1a4731] border-[#c9a84c] text-white'
                : 'bg-white border-rose-500 text-rose-800'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#c9a84c]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Official Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={async () => {
          try {
            localStorage.removeItem('udm_active_user');
            await logoutUserWithSupabase();
          } catch (e) {
            console.warn(e);
          }
          setCurrentUser(null);
          setActiveTab('archive');
          triggerToast('Logged out of UDM account.');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmission={handleOpenSubmissionModal}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* TAB 1: RESEARCH ARCHIVE */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            {/* Homepage Hero Section with UDM facade image & #1a4731 dark green overlay */}
            <HeroBanner
              totalPapers={rawResearchList.length}
              onOpenSubmission={handleOpenSubmissionModal}
              onExploreClick={() => {
                const searchEl = document.getElementById('search-filter-section');
                if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Search and Filters */}
            <div id="search-filter-section">
              <SearchAndFilter
                filters={filters}
                onChangeFilters={setFilters}
                availableKeywords={availableKeywords}
                totalResults={filteredResearchList.length}
              />
            </div>

            {/* Research Cards Grid */}
            {filteredResearchList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-[#1a4731]">
                  No Research Papers Found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {filters.query
                    ? `No research papers matched your search for "${filters.query}". Try searching by different keywords, course, author, or clearing category filters.`
                    : 'No research papers match the selected college, year, or keyword filters.'}
                </p>
                {(filters.query || filters.college !== 'ALL' || filters.year !== 'ALL' || filters.keyword !== 'ALL') && (
                  <div className="pt-2">
                    <button
                      onClick={() => setFilters({ query: '', college: 'ALL', year: 'ALL', keyword: 'ALL', sortBy: 'relevance' })}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResearchList.map((paper) => (
                  <ResearchCard
                    key={paper.researchID}
                    research={paper}
                    onSelect={handleSelectResearch}
                    onDownloadAbstract={handleDownloadAbstract}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <RecommendationSection
            currentUser={currentUser}
            recommendations={recommendations}
            targetCollege={targetRecommendationCollege}
            onTargetCollegeChange={setTargetRecommendationCollege}
            onSelectResearch={handleSelectResearch}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* TAB 3: ADMIN REVIEW QUEUE */}
        {activeTab === 'admin_review' && (
          <AdminReviewDashboard
            submissions={submissionsList}
            accessRequests={accessRequestsList}
            onReviewSubmission={handleReviewSubmission}
            onReviewAccessRequest={handleReviewAccessRequest}
          />
        )}

        {/* TAB 4: ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && (
          <AnalyticsAndReports analyticsData={analyticsData} />
        )}

        {/* TAB 5: SUPER ADMIN MANAGEMENT */}
        {activeTab === 'super_admin' && (
          <SuperAdminManagement />
        )}

        {/* UN Sustainable Development Goals (SDG) Alignment Section */}
        {activeTab === 'archive' && <SDGSection />}
      </main>

      {/* Modals */}
      <ResearchDetailModal
        research={selectedResearch}
        allResearch={rawResearchList}
        currentUser={currentUser}
        accessRequests={accessRequestsList}
        onClose={() => setSelectedResearch(null)}
        onSelectResearch={handleSelectResearch}
        onRequestAccess={handleRequestAccess}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {showSubmissionModal && (
        <SubmissionFormModal
          currentUser={currentUser}
          onClose={() => setShowSubmissionModal(false)}
          onSubmitSuccess={() => {
            triggerToast('Research paper submitted to URELIA Office for review!');
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            try {
              localStorage.setItem('udm_active_user', JSON.stringify(user));
            } catch {}
            if (user.role === 'admin') {
              setActiveTab('admin_review');
            } else if (user.role === 'super_admin') {
              setActiveTab('super_admin');
            }
            triggerToast(`Welcome back, ${user.name}!`);
          }}
        />
      )}

      {/* Republic Act 10173 & Cookie Compliance Modal */}
      <PrivacyConsentModal
        isOpen={showPrivacyModal || isReviewingPrivacy}
        isReviewMode={isReviewingPrivacy}
        onAccept={(_prefs) => {
          setShowPrivacyModal(false);
          setIsReviewingPrivacy(false);
          triggerToast('Data privacy and compliance preferences recorded.', 'success');
        }}
        onDecline={() => {
          triggerToast('Compliance with RA 10173 & UDM Policy is required to access records.', 'error');
        }}
        onCloseReview={() => setIsReviewingPrivacy(false)}
      />

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-600 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-[#1a4731] block mb-0.5 uppercase tracking-wide">
              © 2026 Universidad de Manila • URELIA Office Archive Management System
            </span>
            <p className="text-slate-500 text-[11px]">
              AI-Powered Web-Based Research Archives using Machine Learning (TF-IDF Vectorization & Cosine Similarity Algorithm)
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-slate-500 text-[11px] font-medium">
            <span>7 Colleges: CBM • CAS • CPPG • CCS • CHS • CED • CCJ</span>
            <span>•</span>
            <button
              onClick={() => setIsReviewingPrivacy(true)}
              className="inline-flex items-center gap-1.5 text-[#1a4731] hover:text-[#113122] font-bold cursor-pointer underline hover:no-underline transition"
              title="Review Republic Act 10173, Cookie & Academic Ethics Policies"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1a4731]" />
              <span>Data Privacy Act (RA 10173) & Cookies</span>
            </button>
            <span>•</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">Abstract Only Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
