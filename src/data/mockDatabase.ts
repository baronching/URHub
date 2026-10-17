/**
 * Initial Seed Database for UDM-ResearchHub
 * Compliant with URELIA Office Capstone Schema (User, Research, Submission, Recommendation, Report)
 */

import { Research, Submission, User, SystemSettings } from '../types';
import { GDRIVE_RESEARCH_PAPERS } from './gdriveJournalsData';

export const INITIAL_USERS: User[] = [
  {
    userID: 'USR-UDM-001',
    name: 'Juan Dela Cruz',
    email: 'jdelacruz@udm.edu.ph',
    password: 'Password123!',
    role: 'student_faculty',
    college: 'CCS',
    course: 'BS in Computer Science',
    readingHistory: ['RES-CCS-2024-001', 'RES-CCS-2024-002', 'RES-CBM-2024-001']
  },
  {
    userID: 'USR-UDM-002',
    name: 'Prof. Maria Santos',
    email: 'msantos@udm.edu.ph',
    password: 'Password123!',
    role: 'student_faculty',
    college: 'CED',
    course: 'Bachelor of Secondary Education',
    readingHistory: ['RES-CED-2024-001', 'RES-CAS-2024-001']
  },
  {
    userID: 'USR-UDM-003',
    name: 'Dr. Alejandro Reyes',
    email: 'areyes.urelia@udm.edu.ph',
    password: 'AdminPassword123!',
    role: 'admin',
    college: 'CPPG',
    course: 'BS in Public Administration',
    readingHistory: ['RES-CPPG-2024-001', 'RES-CCJ-2024-001']
  },
  {
    userID: 'USR-UDM-004',
    name: 'Engr. System Admin',
    email: 'sysadmin@udm.edu.ph',
    password: 'SuperAdmin123!',
    role: 'super_admin',
    college: 'CCS',
    course: 'BS in Information Technology',
    readingHistory: []
  }
];

export const INITIAL_RESEARCH: Research[] = [
  ...GDRIVE_RESEARCH_PAPERS,
  {
    researchID: 'RES-CCS-2024-001',
    title: 'An AI-Based Student Performance Prediction System for Universidad de Manila Using Machine Learning Algorithms',
    abstract: 'This research paper investigates the application of machine learning classification models, specifically Random Forest and Support Vector Machines, to predict academic risk among undergraduate students at Universidad de Manila. By processing historical demographic data, attendance records, and mid-term grades across the seven colleges, the system achieved a 92.4% prediction accuracy. The findings provide the UDM Academic Affairs Office with actionable predictive analytics to deliver timely interventions for at-risk students.',
    authors: ['Juan Dela Cruz', 'Mark Anthony Tan', 'Dr. Elena Reyes'],
    keywords: ['Machine Learning', 'Predictive Analytics', 'Student Performance', 'UDM Education', 'Classifiers'],
    department: 'CCS',
    course: 'BS in Computer Science',
    year: 2024,
    status: 'approved',
    viewsCount: 342,
    downloadsCount: 128,
    submittedBy: 'USR-UDM-001',
    dateAdded: '2024-03-15'
  },
  {
    researchID: 'RES-CCS-2024-002',
    title: 'Web-Based Automated Library Information Management System for UDM Main Library',
    abstract: 'The main library of Universidad de Manila manages thousands of thesis archives and reference books manually. This study designed and developed a web-based automated library management system integrated with QR code verification and search indexing. Evaluated using the ISO/IEC 25010 software quality standards, the platform demonstrated exceptional usability, efficiency, and database response speeds under high concurrency.',
    authors: ['Kenneth Alcantara', 'Rhea Mae Gomez'],
    keywords: ['Library Automation', 'Web Architecture', 'QR Verification', 'ISO 25010', 'Database Management'],
    department: 'CCS',
    course: 'BS in Information Technology',
    year: 2024,
    status: 'approved',
    viewsCount: 289,
    downloadsCount: 94,
    submittedBy: 'USR-UDM-001',
    dateAdded: '2024-02-10'
  },
  {
    researchID: 'RES-CBM-2024-001',
    title: 'Digital Financial Literacy and Micro-Enterprise Resilience Among Manila Vendors Post-Pandemic',
    abstract: 'Micro-entrepreneurs in the vicinity of Universidad de Manila and Santa Cruz facing economic recovery relied heavily on digital payment platforms such as GCash and PayMaya. This empirical study assesses the correlation between financial literacy levels and business resilience among 150 surveyed MSME owners in Manila. Statistical regression revealed that adoption of digital accounting tools significantly increased monthly revenue stability.',
    authors: ['Patricia Mae Ramos', 'Prof. Roberto Garcia'],
    keywords: ['Financial Literacy', 'MSME Resilience', 'Digital Payments', 'Manila Economy', 'CBM Research'],
    department: 'CBM',
    course: 'BS in Business Administration',
    year: 2024,
    status: 'approved',
    viewsCount: 215,
    downloadsCount: 81,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2024-01-20'
  },
  {
    researchID: 'RES-CAS-2024-001',
    title: 'Psychological Well-Being and Academic Stress Coping Mechanisms Among UDM Working Students',
    abstract: 'Working students balance rigorous academic requirements and employment obligations. Utilizing a mixed-method research design, this study examines stress factors, emotional burnout, and coping strategies among 200 working undergraduate students across Universidad de Manila. Results highlight the vital role of institutional peer support groups and flexible academic scheduling in fostering psychological resilience.',
    authors: ['Sophia Loren Miranda', 'Dr. Beatrice Villanueva'],
    keywords: ['Psychological Well-Being', 'Working Students', 'Academic Stress', 'Coping Mechanisms', 'UDM CAS'],
    department: 'CAS',
    course: 'BS in Psychology',
    year: 2023,
    status: 'approved',
    viewsCount: 198,
    downloadsCount: 62,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2023-11-05'
  },
  {
    researchID: 'RES-CPPG-2024-001',
    title: 'Policy Evaluation of Local Government Urban Infrastructure Projects in the City of Manila',
    abstract: 'Effective governance requires rigorous post-implementation policy evaluation. This research analyzes public satisfaction and socioeconomic impact of recent Manila LGU infrastructure initiatives, including park revitalizations and barangay digital hubs. Using governance metrics and stakeholder interviews, the paper recommends policy frameworks for sustainable urban development in historical Manila districts.',
    authors: ['Gabriel Mendoza', 'Atty. Fernando Castro'],
    keywords: ['Public Policy', 'Urban Infrastructure', 'Manila LGU', 'Governance Framework', 'CPPG Research'],
    department: 'CPPG',
    course: 'BS in Public Administration',
    year: 2024,
    status: 'approved',
    viewsCount: 175,
    downloadsCount: 45,
    submittedBy: 'USR-UDM-003',
    dateAdded: '2024-04-12'
  },
  {
    researchID: 'RES-CHS-2024-001',
    title: 'Community Hygiene Awareness and Nursing Intervention Effectiveness in Manila Barangay Health Centers',
    abstract: 'Community nursing interventions play a critical role in preventive public health. This field research conducted by UDM College of Health Sciences evaluates community hygiene awareness campaigns across selected Manila barangays. Statistical analysis showed a 38% decrease in water-borne infection cases following structured student-led health education workshops.',
    authors: ['Angelica Diaz', 'Nurse Supervisor Clarissa Ocampo'],
    keywords: ['Community Nursing', 'Public Health', 'Hygiene Awareness', 'Manila Health', 'CHS Intervention'],
    department: 'CHS',
    course: 'BS in Nursing',
    year: 2023,
    status: 'approved',
    viewsCount: 160,
    downloadsCount: 53,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2023-09-18'
  },
  {
    researchID: 'RES-CED-2024-001',
    title: 'Efficacy of Hybrid Learning Modules in Public High Schools: Pedagogical Perspectives from UDM Student Teachers',
    abstract: 'Transitioning into post-pandemic education necessitated flexible hybrid teaching methodologies. This research evaluates the pedagogical effectiveness of blended learning modules deployed by UDM practice teachers in Manila public secondary schools. Results indicate that interactive digital workbooks significantly improved student engagement and quiz scores compared to traditional static worksheets.',
    authors: ['Prof. Maria Santos', 'Joshua Fernandez'],
    keywords: ['Hybrid Learning', 'Pedagogy', 'Student Teaching', 'Secondary Education', 'CED Modules'],
    department: 'CED',
    course: 'Bachelor of Secondary Education',
    year: 2024,
    status: 'approved',
    viewsCount: 230,
    downloadsCount: 88,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2024-02-28'
  },
  {
    researchID: 'RES-CCJ-2024-001',
    title: 'Cybercrime Awareness and Incident Reporting Preparedness Among Barangay Officials in Manila',
    abstract: 'With the proliferation of online scams and identity theft, local barangay leadership serves as the initial line of community assistance. This study assesses cybercrime awareness, digital forensics understanding, and incident response readiness among 80 barangay officials in Manila. The research presents a standardized preliminary cybercrime reporting protocol for local officers.',
    authors: ['Criminologist Ronald Navarro', 'Capt. Vicente Morales'],
    keywords: ['Cybercrime', 'Digital Forensics', 'Barangay Preparedness', 'Crime Prevention', 'CCJ Research'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2024,
    status: 'approved',
    viewsCount: 310,
    downloadsCount: 112,
    submittedBy: 'USR-UDM-003',
    dateAdded: '2024-03-01',
    authorCategory: 'Student'
  },
  // ==========================================
  // UNIVERSITY FACULTY RESEARCH (FACULTY)
  // ==========================================
  {
    researchID: 'RES-FAC-2025-001',
    title: 'Empirical Assessment of Thesis Mentorship Paradigms and Research Self-Efficacy Among Undergraduate Scholars in Universidad de Manila',
    abstract: 'Undergraduate capstone research represents a pivotal milestone in academic degree completion. This faculty-authored empirical investigation evaluates the direct impact of structured thesis mentorship frameworks, milestone-based literature reviews, and institutional ethics review workshops on student research self-efficacy across 450 UDM students. Quantitative regression analysis reveals that faculty scaffolding during Chapter 1 and Chapter 3 conceptualization reduces research anxiety by 41.8% and accelerates proposal defense readiness. The paper provides undergraduate researchers with verified literature review strategies and defense preparation templates.',
    authors: ['Dr. Maria Victoria Santos', 'Prof. Ramon Hernandez', 'Dr. Carmelita Reyes'],
    keywords: ['Thesis Mentorship', 'Research Methodology', 'Undergraduate Research', 'Academic Self-Efficacy', 'Higher Education Pedagogy'],
    department: 'FACULTY',
    course: 'Faculty Pedagogical & Instructional Studies',
    year: 2025,
    status: 'approved',
    viewsCount: 520,
    downloadsCount: 215,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2025-02-14',
    authorCategory: 'Faculty'
  },
  {
    researchID: 'RES-FAC-2026-002',
    title: 'Aligning Higher Education Capstone Projects with the United Nations Sustainable Development Goals (SDGs): A Faculty Resource Guide and Evaluation Matrix',
    abstract: 'Academic institutions bear a fundamental responsibility to align student scholarship with pressing societal, economic, and environmental imperatives. This faculty publication presents a standardized curriculum matrix designed for UDM undergraduate and graduate researchers to map thesis outputs directly to UN SDGs—predominantly SDG 4 (Quality Education), SDG 9 (Industry, Innovation & Infrastructure), and SDG 11 (Sustainable Cities). Includes benchmark rubrics, qualitative assessment criteria, and empirical case studies from recent UDM technological and policy innovations.',
    authors: ['Prof. Vincent Visitacion', 'Dr. Alejandro Reyes', 'Prof. Danilo Cruz'],
    keywords: ['UN SDGs', 'Capstone Guidelines', 'Sustainable Cities', 'Evaluation Rubrics', 'Curriculum Innovation'],
    department: 'FACULTY',
    course: 'Higher Education Curriculum Innovations',
    year: 2026,
    status: 'approved',
    viewsCount: 680,
    downloadsCount: 310,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2026-01-20',
    authorCategory: 'Faculty'
  },
  {
    researchID: 'RES-FAC-2025-003',
    title: 'Academic Integrity and Responsible Generative AI Integration in University Research: A Practical Protocol for Students and Mentors',
    abstract: 'The rapid emergence of Generative Artificial Intelligence (GenAI) and Large Language Models necessitates clear institutional frameworks distinguishing ethical research augmentation from academic malpractice. This multidisciplinary faculty study examines ethical AI utilization protocols, prompt transparency standards, citation methodologies for AI-generated artifacts, and empirical plagiarism detection thresholds. Provides students with clear operational boundaries for using AI in coding, exploratory literature review, and statistical synthesis.',
    authors: ['Dr. Elena Reyes', 'Prof. Roberto Alcantara', 'Dr. Teresa Morales'],
    keywords: ['Generative AI', 'Academic Integrity', 'Research Ethics', 'Citation Standards', 'AI Guidelines'],
    department: 'FACULTY',
    course: 'Multidisciplinary Faculty Publications',
    year: 2025,
    status: 'approved',
    viewsCount: 890,
    downloadsCount: 440,
    submittedBy: 'USR-UDM-002',
    dateAdded: '2025-04-10',
    authorCategory: 'Faculty'
  },
  // ==========================================
  // UNIVERSITY ADMINISTRATION & INSTITUTIONAL RESEARCH (ADMIN)
  // ==========================================
  {
    researchID: 'RES-ADM-2025-001',
    title: 'Universidad de Manila Institutional Tracer Study: Five-Year Longitudinal Analysis of Graduate Employability, Licensure Performance, and Industry Skill Alignment',
    abstract: 'Conducted by the UDM Administration in coordination with the Office of the Vice President for Academic Affairs (OVPAA) and URELIA, this comprehensive institutional tracer study surveys 3,840 alumni from graduation batches 2020 through 2024 across all degree programs. Highlights include an 88.6% employment rate within six months of graduation, national licensure passing rates exceeding Philippine national averages, and key employer feedback identifying in-demand technical competencies. Offers student researchers invaluable baseline demographic datasets and industry trends for Manila-based studies.',
    authors: ['Office of the Vice President for Academic Affairs (OVPAA)', 'URELIA Research & Extension Directorate'],
    keywords: ['Graduate Tracer Study', 'Employability Metrics', 'Institutional Quality Assurance', 'Alumni Outcomes', 'Manila Workforce'],
    department: 'ADMIN',
    course: 'Institutional Quality Assurance (IQA)',
    year: 2025,
    status: 'approved',
    viewsCount: 740,
    downloadsCount: 290,
    submittedBy: 'USR-UDM-003',
    dateAdded: '2025-03-01',
    authorCategory: 'Administration'
  },
  {
    researchID: 'RES-ADM-2026-002',
    title: 'Smart City Manila Urban Governance and Collaborative University-LGU Research Agenda (2024–2028)',
    abstract: 'Commissioned by the Universidad de Manila University Administration in official partnership with the City of Manila Mayor\'s Office and the Manila City Planning and Development Office (CPDO), this institutional policy paper delineates the city-university research roadmap. Details municipal priorities in flood mitigation telemetry, smart traffic signaling, digital barangay frontline services, and community health monitoring across Manila\'s six legislative districts. Serves as a vital guide for student researchers seeking research topics with direct City Hall grant funding and practical local deployment avenues.',
    authors: ['UDM University Administration', 'Manila City Planning & Development Office (CPDO)'],
    keywords: ['Smart City Manila', 'LGU Research Agenda', 'Urban Governance', 'University-City Partnership', 'Public Administration'],
    department: 'ADMIN',
    course: 'Manila City LGU Policy Collaborations',
    year: 2026,
    status: 'approved',
    viewsCount: 920,
    downloadsCount: 380,
    submittedBy: 'USR-UDM-003',
    dateAdded: '2026-02-18',
    authorCategory: 'Administration'
  },
  {
    researchID: 'RES-ADM-2024-003',
    title: 'URELIA Institutional Research and Ethics Review Manual: Standardized Protocols for Student Theses and Faculty Publications',
    abstract: 'The official university administrative protocol manual published by the URELIA Office. Sets forth comprehensive institutional guidelines governing ethics review board (IRB) clearance, informed consent requirements for human subjects in Manila barangays, intellectual property and copyright registration at the Intellectual Property Office of the Philippines (IPOPHL), and digital archiving procedures on the UDM-ResearchHub portal. Essential reading for every student preparing their manuscript submission.',
    authors: ['URELIA Evaluation Committee', 'University Academic Council'],
    keywords: ['URELIA Manual', 'Ethics Protocols', 'Intellectual Property', 'IRB Clearance', 'University Research Standards'],
    department: 'ADMIN',
    course: 'URELIA Research & Extension Studies',
    year: 2024,
    status: 'approved',
    viewsCount: 1150,
    downloadsCount: 520,
    submittedBy: 'USR-UDM-003',
    dateAdded: '2024-01-15',
    authorCategory: 'Administration'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    submissionID: 'SUB-2026-001',
    submittedBy: 'USR-UDM-001',
    submitterName: 'Juan Dela Cruz',
    submitterEmail: 'jdelacruz@udm.edu.ph',
    researchID: 'RES-PENDING-001',
    title: 'IoT-Based Water Level Monitoring System for Flood Prevention along Pasig River Manila',
    abstract: 'Manila experiences seasonal urban flooding caused by overflowing waterways. This paper introduces a low-cost Internet of Things (IoT) ultrasonic water level sensor array connected via LoRaWAN technology. Real-time telemetry data is broadcast to an emergency alerting dashboard for barangay disaster risk management councils.',
    authors: ['Juan Dela Cruz', 'Rhea Mae Gomez'],
    keywords: ['IoT Sensors', 'Pasig River Flood', 'LoRaWAN', 'Disaster Response', 'Manila LGU'],
    department: 'CCS',
    course: 'BS in Computer Science',
    year: 2026,
    dateSubmitted: '2026-07-28',
    status: 'pending',
    pdfFileName: 'pasig_river_iot_flood_monitoring.pdf'
  },
  {
    submissionID: 'SUB-2026-002',
    submittedBy: 'USR-UDM-002',
    submitterName: 'Prof. Maria Santos',
    submitterEmail: 'msantos@udm.edu.ph',
    researchID: 'RES-PENDING-002',
    title: 'Assessment of In-Service Teacher Training Programs in Special Needs Education in Manila City',
    abstract: 'Inclusive education requires continuous professional development for public school teachers. This study examines current special needs education (SNED) training modules provided across Manila district schools and identifies critical gaps in assistive technology training.',
    authors: ['Prof. Maria Santos', 'Dr. Beatrice Villanueva'],
    keywords: ['Special Education', 'SNED Training', 'Inclusive Education', 'Pedagogy', 'CED Research'],
    department: 'CED',
    course: 'Bachelor of Elementary Education',
    year: 2026,
    dateSubmitted: '2026-07-30',
    status: 'pending',
    pdfFileName: 'sned_teacher_training_assessment.pdf'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  allowedDomains: ['udm.edu.ph', 'pau.udm.edu.ph'],
  maxPdfUploadMb: 100,
  requireAdminApproval: true,
  enableMlRecommendations: true,
  tfIdfTopKeywordsCount: 10,
  collaborativeWeight: 0.4,
  contentBasedWeight: 0.6
};
