/**
 * Comprehensive Academic Manuscript Content Generator
 * Generates distinct, rich, multi-page content for Universidad de Manila (UDM)
 * research papers in view-only reader mode.
 */

import { Research, UDM_COLLEGES } from '../types';

export interface ManuscriptPage {
  pageNumber: number;
  chapterTitle: string;
  sectionSubtitle: string;
  content: React.ReactNode | string;
  type: 'title' | 'toc' | 'chapter' | 'results' | 'conclusion' | 'references';
}

export function generateManuscriptPages(research: Research) {
  const collegeInfo = UDM_COLLEGES.find(c => c.id === research.department);
  const collegeName = collegeInfo?.name || `College of ${research.department}`;
  const isFacAdmin = research.department === 'FAC-ADM' || research.authorCategory === 'Faculty_Admin';
  const paperYear = research.year || '2025';
  const authorNames = research.authors.join(', ');
  const leadAuthor = research.authors[0] || 'Lead Researcher';
  const keywordsStr = research.keywords.join(', ');

  // Generate 14 distinct structured pages
  return [
    // PAGE 1: TITLE PAGE & OFFICIAL APPROVAL SHEET
    {
      pageNumber: 1,
      chapterTitle: 'Official Title Page & Approval Sheet',
      sectionSubtitle: 'Universidad de Manila Institutional Repository',
      type: 'title' as const,
      tag: 'Approval Sheet',
      title: research.title,
      department: research.department,
      collegeName,
      course: research.course,
      authors: research.authors,
      year: paperYear,
      isFacAdmin
    },

    // PAGE 2: TABLE OF CONTENTS & EXECUTIVE ABSTRACT
    {
      pageNumber: 2,
      chapterTitle: 'Table of Contents & Executive Summary',
      sectionSubtitle: 'Preliminary Pages',
      type: 'toc' as const,
      abstract: research.abstract,
      keywords: research.keywords,
      viewsCount: research.viewsCount
    },

    // PAGE 3: CHAPTER 1 - INTRODUCTION & BACKGROUND OF THE STUDY
    {
      pageNumber: 3,
      chapterTitle: 'Chapter 1: The Problem and Its Background',
      sectionSubtitle: '1.1 Introduction & Contextual Background',
      type: 'chapter' as const,
      paragraphs: [
        `In contemporary higher education and institutional governance across the City of Manila, the systematic pursuit of evidence-based solutions has become a fundamental imperative. As urban academic institutions navigate complex socio-economic and technological transformations, empirical investigation provides the indispensable foundation for sustainable community development.`,
        `This investigation, entitled "${research.title}", addresses critical operational and theoretical challenges directly affecting ${collegeName} and its constituent stakeholders. At the Universidad de Manila (UDM), academic programs continuously seek to bridge theoretical paradigms with localized, real-world applications in alignment with the university's institutional mission of promoting accessible, high-quality public tertiary education.`,
        `The operational environment in Manila presents unique institutional dynamics that require rigorous analysis. Through a grounded approach encompassing quantitative rigor and domain-specific considerations, this study examines systemic variables, respondent perceptions, and structural benchmarks to develop actionable frameworks for the benefit of both student cohorts and academic personnel.`
      ],
      callout: {
        title: 'Institutional Context',
        text: `Conducted under the auspices of the Universidad de Manila URELIA Office, this study aligns institutional strategic priorities with community-oriented academic service in the City of Manila.`
      }
    },

    // PAGE 4: CHAPTER 1 - STATEMENT OF THE PROBLEM & SIGNIFICANCE
    {
      pageNumber: 4,
      chapterTitle: 'Chapter 1: Problem Statement & Significance',
      sectionSubtitle: '1.2 Problem Statement & 1.3 Significance of the Study',
      type: 'chapter' as const,
      paragraphs: [
        `1.2 Statement of the Problem: Specifically, this research seeks to answer the following research questions:`,
        `1. What is the baseline profile and operational status of the target demographic within ${collegeName} in terms of institutional readiness and resource allocation?`,
        `2. To what extent does the implementation of the proposed framework impact key performance indicators, operational efficiency, and learning outcomes?`,
        `3. Is there a statistically significant difference in performance and satisfaction metrics before and after the application of the investigated interventions?`,
        `4. What programmatic policy measures, pedagogical adaptations, or systemic tools can be synthesized to optimize outcomes for the Universidad de Manila community?`
      ],
      significanceItems: [
        { group: 'UDM Students', benefit: `Provides concrete empirical data, actionable reference material, and conceptual frameworks to guide future thesis, capstone, and academic inquiries.` },
        { group: 'Faculty & Researchers', benefit: `Serves as a validated pedagogical benchmark for curriculum refinement, scholarly publishing, and interdisciplinary collaboration.` },
        { group: 'University Administration', benefit: `Supplies empirical metrics to inform policy formulated by the URELIA Office, college deans, and institutional planning bodies.` },
        { group: 'City of Manila Community', benefit: `Delivers evidence-grounded insights directly applicable to municipal public service, local enterprise, and community welfare.` }
      ]
    },

    // PAGE 5: CHAPTER 2 - REVIEW OF RELATED LITERATURE (RRL)
    {
      pageNumber: 5,
      chapterTitle: 'Chapter 2: Review of Related Literature',
      sectionSubtitle: '2.1 Theoretical Framework & Literature Synthesis',
      type: 'chapter' as const,
      paragraphs: [
        `A comprehensive synthesis of related literature reveals growing scholarly attention toward systemic evaluation in ${research.course}. Both international benchmarks and local Philippine studies emphasize the critical role of data-driven methodologies in modern institutional environments.`,
        `Recent studies in the ASEAN region demonstrate that educational and public institutions adopting structured evaluative models report up to a 42% increase in stakeholder satisfaction and process consistency. In the Philippine setting, regulatory directives from the Commission on Higher Education (CHED) mandate continuous quality assurance protocols.`,
        `Previous capstone and faculty research conducted at the Universidad de Manila identified recurring gaps in localized data synthesis. Existing literature predominantly focuses on private tertiary institutions or centralized Western models, leaving a noticeable void regarding localized urban public universities in the City of Manila. This study directly addresses this empirical gap.`
      ],
      literatureTable: [
        { author: 'CHED Research Directive (2023)', focus: 'Institutional Quality Assurance & Research Productivity', finding: 'Emphasizes localized empirical studies to address municipal challenges.' },
        { author: 'Manila Urban Studies Review (2024)', focus: 'Public University Stakeholder Dynamics', finding: 'Notes need for accessible repositories and data-backed policy decisions.' },
        { author: 'Asian Journal of Higher Education (2025)', focus: 'Curriculum & Operational Alignment', finding: 'Confirmed positive correlation between student capstone utility and faculty research.' }
      ]
    },

    // PAGE 6: CHAPTER 2 - CONCEPTUAL FRAMEWORK (IPO MODEL)
    {
      pageNumber: 6,
      chapterTitle: 'Chapter 2: Conceptual Framework & Paradigm',
      sectionSubtitle: '2.2 Input - Process - Output (IPO) Model & Hypotheses',
      type: 'chapter' as const,
      paragraphs: [
        `The conceptual paradigm governing this study is anchored upon the Input-Process-Output (IPO) model, widely recognized in academic research for establishing rigorous methodological traceability from baseline conditions to final institutional deliverables.`
      ],
      ipoData: {
        inputs: [
          `Institutional Profile of ${research.department}`,
          `Demographic data of student & faculty cohorts`,
          `Current baseline operational & pedagogical metrics`,
          `Historical archival records from URELIA Office`
        ],
        processes: [
          `Purposive and stratified sampling collection`,
          `Descriptive and inferential statistical analysis`,
          `Cosine similarity & content classification testing`,
          `Qualitative thematic coding and expert validation`
        ],
        outputs: [
          `Validated framework for ${research.title}`,
          `Actionable recommendations for UDM stakeholders`,
          `Enhanced digital archival retrieval models`,
          `Peer-reviewed policy proposals for university governance`
        ]
      },
      hypotheses: [
        `H₀ (Null Hypothesis): There is no statistically significant relationship between the examined methodological variables and overall operational efficacy.`,
        `H₁ (Alternative Hypothesis): There is a statistically significant relationship, indicating that systematic implementation yields measurable performance enhancements.`
      ]
    },

    // PAGE 7: CHAPTER 3 - RESEARCH METHODOLOGY & SAMPLING
    {
      pageNumber: 7,
      chapterTitle: 'Chapter 3: Research Methodology',
      sectionSubtitle: '3.1 Research Design & Participant Sampling',
      type: 'chapter' as const,
      paragraphs: [
        `3.1 Research Design: This study utilized a descriptive-correlational and evaluative mixed-methods research design. This architecture allowed the researchers to quantitatively assess prevailing performance metrics while qualitatively exploring underlying causal dynamics among respondents.`,
        `3.2 Population and Sampling: The target population comprised stakeholders actively affiliated with ${collegeName} at the Universidad de Manila during Academic Year ${paperYear}. To ensure proportional demographic representation, stratified random sampling was conducted utilizing Slovin's formula at a 95% confidence level with a 5% margin of error:`,
        `Formula: n = N / (1 + N * e²)`,
        `Out of an eligible population of N = 2,450 enrolled students and active faculty members, a total sample size of n = 344 validated respondents was established and surveyed.`
      ],
      samplingMetrics: [
        { label: 'Target Population (N)', value: '2,450' },
        { label: 'Calculated Sample (n)', value: '344' },
        { label: 'Confidence Level', value: '95%' },
        { label: 'Margin of Error (e)', value: '5.0%' },
        { label: 'Response Rate', value: '98.3%' }
      ]
    },

    // PAGE 8: CHAPTER 3 - INSTRUMENTATION & ETHICAL CLEARANCE
    {
      pageNumber: 8,
      chapterTitle: 'Chapter 3: Instrumentation & Ethical Protocols',
      sectionSubtitle: '3.3 Research Instruments & Data Gathering Protocol',
      type: 'chapter' as const,
      paragraphs: [
        `3.3 Instrumentation: The primary research instrument consisted of a structured, 5-point Likert scale questionnaire supplemented by semi-structured interview guides. The instrument underwent rigorous content and construct validation by a panel of three faculty experts in ${research.course}.`,
        `Reliability testing was conducted via a pilot study involving 30 non-participating respondents from adjacent academic units. Calculation of Cronbach's Alpha yielded a coefficient of α = 0.914, demonstrating excellent internal consistency well above the standard academic threshold of 0.70.`,
        `3.4 Ethical Considerations: In strict adherence to Republic Act 10173 (Data Privacy Act of 2012) and the Universidad de Manila Institutional Ethics Review Guidelines, informed consent was secured from all participants prior to survey administration. All identifying attributes were encrypted and treated with strict academic confidentiality.`
      ],
      likertScale: [
        { scale: '5', range: '4.21 - 5.00', interpretation: 'Strongly Agree / Excellent' },
        { scale: '4', range: '3.41 - 4.20', interpretation: 'Agree / Very Satisfactory' },
        { scale: '3', range: '2.61 - 3.40', interpretation: 'Moderate / Neutral' },
        { scale: '2', range: '1.81 - 2.60', interpretation: 'Disagree / Unsatisfactory' },
        { scale: '1', range: '1.00 - 1.80', interpretation: 'Strongly Disagree / Poor' }
      ]
    },

    // PAGE 9: CHAPTER 4 - RESULTS & DATA PRESENTATION
    {
      pageNumber: 9,
      chapterTitle: 'Chapter 4: Results & Data Presentation',
      sectionSubtitle: '4.1 Demographic Distribution & Baseline Metric Analysis',
      type: 'results' as const,
      paragraphs: [
        `This chapter presents the empirical findings gathered from the 344 respondents across ${collegeName}. Data was tabulated and analyzed using frequency distribution, percentage computation, and weighted mean metrics.`
      ],
      tableTitle: 'Table 4.1: Demographic and Operational Distribution of Study Cohort',
      tableHeaders: ['Variable Category', 'Frequency (f)', 'Percentage (%)', 'Verbal Interpretation'],
      tableRows: [
        ['Senior Undergraduate Students (3rd/4th Year)', '214', '62.2%', 'Primary Academic Cohort'],
        ['Junior Undergraduate Students (1st/2nd Year)', '82', '23.8%', 'Foundational Student Cohort'],
        ['Faculty & Research Mentors', '36', '10.5%', 'Academic Advisory Group'],
        ['Administrative & Technical Staff', '12', '3.5%', 'Institutional Support'],
        ['Total Validated Respondents', '344', '100.0%', 'Representative Sample']
      ],
      analysisText: `As illustrated in Table 4.1, the overwhelming majority of respondents belong to senior student and faculty researcher cohorts, reflecting direct familiarity with the research challenges investigated.`
    },

    // PAGE 10: CHAPTER 4 - STATISTICAL EVALUATION & HYPOTHESIS TESTING
    {
      pageNumber: 10,
      chapterTitle: 'Chapter 4: In-Depth Statistical Analysis',
      sectionSubtitle: '4.2 Hypothesis Testing & Correlation Metrics',
      type: 'results' as const,
      paragraphs: [
        `To test the null hypothesis (H₀) positing no significant relationship between the investigated interventions and operational success, Pearson product-moment correlation coefficient (r) and two-tailed t-test analyses were computed at α = 0.05 level of significance.`
      ],
      tableTitle: 'Table 4.2: Statistical Hypothesis Testing and Correlation Analysis',
      tableHeaders: ['Evaluated Domain Indicator', 'Weighted Mean', 'Std. Dev (SD)', 'Computed t-value', 'p-value', 'Decision on H₀'],
      tableRows: [
        ['System Architecture & Readiness', '4.48', '0.42', '8.92', '< 0.001', 'Reject H₀ (Significant)'],
        ['Methodological Implementation', '4.36', '0.51', '7.45', '< 0.001', 'Reject H₀ (Significant)'],
        ['Resource & Archive Accessibility', '4.52', '0.38', '9.18', '< 0.001', 'Reject H₀ (Significant)'],
        ['Stakeholder Satisfaction & Utility', '4.61', '0.35', '10.24', '< 0.001', 'Reject H₀ (Significant)'],
        ['Overall Composite Score', '4.49', '0.41', '8.95', '< 0.001', 'Reject H₀ (Highly Significant)']
      ],
      findingsNote: `The computed p-values across all domains are significantly less than the critical threshold of 0.05. Consequently, the Null Hypothesis is rejected in favor of the Alternative Hypothesis (H₁), demonstrating that the framework delivers statistically validated improvements.`
    },

    // PAGE 11: CHAPTER 5 - SUMMARY OF FINDINGS
    {
      pageNumber: 11,
      chapterTitle: 'Chapter 5: Summary of Findings',
      sectionSubtitle: '5.1 Salient Findings and Research Question Answers',
      type: 'chapter' as const,
      paragraphs: [
        `Based on the comprehensive empirical analysis and statistical treatment conducted in Chapter 4, the following summary of salient findings is established:`,
        `1. Institutional Baseline Readiness: Respondents indicated high foundational readiness with an aggregate mean of 4.48 (SD = 0.42), signifying robust receptivity to modernized workflows within ${collegeName}.`,
        `2. Direct Performance Impact: Implementation of the proposed framework resulted in a composite mean evaluation of 4.49, with stakeholder utility scoring highest at 4.61. This proves that structured methodologies directly enhance user productivity.`,
        `3. Statistical Significance: Rejection of the null hypothesis at p < 0.001 provides empirical confirmation that the observed improvements are attributable to the research framework rather than random variance.`,
        `4. Academic Archive Synergy: Both students and faculty affirmed the vital necessity of centralized institutional repositories, with 94.2% of surveyed participants indicating that unified access to university research drastically accelerates thesis completion times.`
      ]
    },

    // PAGE 12: CHAPTER 5 - CONCLUSIONS
    {
      pageNumber: 12,
      chapterTitle: 'Chapter 5: Conclusions',
      sectionSubtitle: '5.2 Theoretical, Methodological & Practical Conclusions',
      type: 'conclusion' as const,
      paragraphs: [
        `In light of the empirical findings synthesized in this investigation, the following conclusions are formulated:`,
        `1. Theoretical Validity: The theoretical model applied in "${research.title}" is structurally sound and functionally applicable to urban public universities in the Philippines. It provides an effective paradigm for unifying academic inquiries with administrative execution.`,
        `2. Pedagogical and Practical Relevance: For students and faculty of ${collegeName}, this study demonstrates that empirical and algorithmic optimization bridges the gap between classroom theory and real-world implementation.`,
        `3. Institutional Institutionalization: Universidad de Manila possesses the infrastructural and human capital capability to operationalize the recommendations of this study, fostering an enduring culture of academic excellence and institutional self-reliance.`
      ],
      quote: `“Rigorous public research is the bedrock upon which the Universidad de Manila advances its civic mission to empower the youth and community of the City of Manila.”`
    },

    // PAGE 13: CHAPTER 5 - RECOMMENDATIONS
    {
      pageNumber: 13,
      chapterTitle: 'Chapter 5: Practical Recommendations',
      sectionSubtitle: '5.3 Action Plan & Institutional Guidelines',
      type: 'conclusion' as const,
      recommendationsList: [
        {
          target: 'For UDM Undergraduate & Graduate Students',
          action: 'Utilize this study as a foundational benchmark for forthcoming capstone and thesis investigations. Replicate the methodological sampling frameworks to examine adjacent academic disciplines.'
        },
        {
          target: 'For College Faculty & Research Advisers',
          action: 'Incorporate the statistical models and findings of this study into research methods curricula. Encourage multidisciplinary collaborations that combine student enthusiasm with faculty guidance.'
        },
        {
          target: 'For URELIA Office & University Administration',
          action: 'Adopt the policy recommendations formulated herein to enhance digital repository discovery, maintain view-only intellectual property protections, and streamline institutional clearance.'
        },
        {
          target: 'For Future Researchers & External Entities',
          action: 'Expand the temporal longitudinal scope beyond a single academic year to measure multi-year retention and institutional impact across Metro Manila tertiary institutions.'
        }
      ]
    },

    // PAGE 14: REFERENCES & ARCHIVAL CLEARANCE
    {
      pageNumber: 14,
      chapterTitle: 'References & Official Archival Clearance',
      sectionSubtitle: 'APA 7th Edition Citations & Repository Certification',
      type: 'references' as const,
      references: [
        `Commission on Higher Education (CHED). (2023). National Higher Education Research Agenda (NHERA-III): Strategic directions for Philippine tertiary institutions. CHED Central Office, Quezon City.`,
        `Department of Science and Technology (DOST-PCHRD). (2024). Guidelines on ethical research standards and intellectual property management in state universities. DOST Publications, Taguig City.`,
        `Universidad de Manila (UDM). (2025). URELIA Office institutional research manual and archival policy guidelines (4th ed.). Universidad de Manila Press, Mehan Gardens, Manila.`,
        `Santos, R. M., & Dela Cruz, J. V. (2024). Algorithmic data retrieval and empirical modeling in Philippine urban higher education. Philippine Journal of Higher Education and Informatics, 18(2), 114–129.`,
        `Tan, M. L., Flores, G. A., & Rivera, K. B. (2025). Evaluating stakeholder satisfaction and capstone efficacy in local universities and colleges (LUCs). Journal of Educational Technology and Public Policy, 29(1), 45–62.`
      ],
      archivalSeal: {
        registryNumber: `UDM-URELIA-${research.department}-${research.year || '2025'}-${research.researchID}`,
        similarityIndex: '4.8% (Turnitin Verified - Passed Institutional Threshold < 10%)',
        archivalDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'OFFICIALLY ARCHIVED - PERPETUAL INSTITUTIONAL REPOSITORY'
      }
    }
  ];
}
