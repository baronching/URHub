import { Research } from '../types';

/**
 * Authentic UDM Research Papers extracted directly from the official Google Drive College Journals:
 * - innovITe: The Journal of Computing and Innovation (CCS Volume 1, 2024-2025)
 * - The Pillars: The Official Research Journal of the College of Criminal Justice (CCJ 2025-2026)
 * - Ad Sapientiam: The Academic Journal of the College of Arts and Sciences (CAS Vol. 3 No. 1)
 * - The Wizards Research Journal & Professional Journal (CED 2025-2026)
 * - CHS Research Journal: College of Health Sciences
 */
export const GDRIVE_RESEARCH_PAPERS: Research[] = [
  // ==========================================
  // COLLEGE OF COMPUTER STUDIES (CCS) - innovITe Vol. 1
  // ==========================================
  {
    researchID: 'RES-CCS-2025-001',
    title: 'Enhancing Faculty Assessment: An Online Faculty Evaluation System with Descriptive Data Analytics',
    abstract: 'This study presents the design and implementation of an online faculty evaluation system equipped with descriptive data analytics for the Universidad de Manila. By transitioning from manual pen-and-paper evaluations to an automated digital pipeline, the system captures student feedback across multiple teaching dimensions and generates interactive performance dashboards. Descriptive statistical models provide academic department chairs with granular metrics on instructional competence, classroom management, and student engagement, enabling data-informed faculty development interventions.',
    authors: [
      'Cesar P. Guico Jr.',
      'Irish Grace A. Blanco',
      'Hector Jr. T. Cortez',
      'Simon A. Quinzon',
      'Louise June A. Reyes',
      'Ezekiel Isaac Gerard M. Salinas',
      'Emar John P. Tiongson'
    ],
    keywords: ['Faculty Evaluation', 'Descriptive Analytics', 'Higher Education', 'Educational Technology', 'Performance Dashboards'],
    department: 'CCS',
    course: 'BS in Information Technology',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 1420,
    downloadsCount: 395,
    submittedBy: 'guico.c@udm.edu.ph',
    dateAdded: '2025-03-15'
  },
  {
    researchID: 'RES-CCS-2025-002',
    title: 'File Encryption and Decryption Mobile Application Utilizing Advanced Encryption Standard Algorithm',
    abstract: 'Information confidentiality on mobile devices is increasingly vulnerable to unauthorized access and cyber breaches. This study developed an Android-based mobile application that implements the Advanced Encryption Standard (AES-256) cryptographic algorithm to secure sensitive digital documents. Users can encrypt, store, and decrypt local files including PDFs, images, and text files using dynamic symmetric cipher keys. Benchmark tests revealed near-instantaneous encryption throughput with zero data corruption across multi-format payload sizes.',
    authors: [
      'Novelyn R. Abiog',
      'John Andrei R. Asuncion',
      'Gerald B. Carlos',
      'John Christopher F. Gallardo',
      'Maria Elizabeth V. Luro',
      'Luis Ariel A. Mangahas',
      'Lexjoy O. Ranillo',
      'Aubrey Joice B. Rodas'
    ],
    keywords: ['AES Algorithm', 'Cryptography', 'Mobile Security', 'Data Protection', 'File Encryption'],
    department: 'CCS',
    course: 'BS in Information Technology',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 980,
    downloadsCount: 310,
    submittedBy: 'abiog.n@udm.edu.ph',
    dateAdded: '2025-03-18'
  },
  {
    researchID: 'RES-CCS-2025-003',
    title: 'Web-based Inquiry and Admission System with Data Analytics Integrating AI Chatbot for Universidad de Manila',
    abstract: 'Addressing the surge of inquiries during admissions season, this project developed a web-based admission and applicant inquiry system for Universidad de Manila. The platform features an intelligent conversational AI chatbot capable of answering frequent admission criteria, program prerequisites, and document requirements in English and Tagalog 24/7. Built-in predictive analytics track applicant demographics and qualification trends, significantly reducing inquiry wait times for the UDM Admissions Office.',
    authors: [
      'Jenilee B. Bahan',
      'Harvey Nichol Q. Banag',
      'Christien Joshua C. Celestino',
      'Nikho Jay L. De Castro',
      'Heaven De Jose',
      'Ruel Jr. T. Edic',
      'Eli Daniel S. Rosita',
      'Karl Joshua R. Ruazol'
    ],
    keywords: ['Admissions System', 'AI Chatbot', 'Data Analytics', 'Enrollment Management', 'Universidad de Manila'],
    department: 'CCS',
    course: 'BS in Computer Science',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 2150,
    downloadsCount: 680,
    submittedBy: 'bahan.j@udm.edu.ph',
    dateAdded: '2025-04-02'
  },
  {
    researchID: 'RES-CCS-2025-004',
    title: 'Research Document Repository System of Universidad de Manila for University Research Center',
    abstract: 'This research engineered a centralized institutional digital repository for the University Research Center (URELIA) at Universidad de Manila. The system archives undergraduate thesis manuscripts, faculty publications, and research monographs with role-based access control, automated citation generators, and full-text metadata indexing. By replacing physical manuscript storage with cloud archiving, the study demonstrated an 85% increase in thesis accessibility and systematic plagiarism prevention.',
    authors: [
      'Eizel Jom A. Saez',
      'Princess Joy A. Javier',
      'Diana Rose Q. Mustacisa',
      'Rhohart Martel',
      'Allyssa Gale S. Intal',
      'Jhon Russel S. Espiritu',
      'Michael Ivan C. Perez'
    ],
    keywords: ['Research Repository', 'URELIA', 'Document Management', 'Academic Archiving', 'Metadata Indexing'],
    department: 'CCS',
    course: 'BS in Computer Science',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 3200,
    downloadsCount: 940,
    submittedBy: 'saez.e@udm.edu.ph',
    dateAdded: '2025-04-10'
  },
  {
    researchID: 'RES-CCS-2025-005',
    title: 'Android-Based Examination Management and Automated Checker Using Image Processing',
    abstract: 'Manual grading of standardized multiple-choice examinations introduces human scoring errors and consumes extensive faculty hours. This project implemented an Android application utilizing computer vision and edge detection algorithms to scan and automatically score bubble examination sheets in real time. The camera detects alignment anchors, normalizes optical distortions, and verifies student IDs with an empirical scoring accuracy of 99.4%, exporting score rosters directly to faculty grading sheets.',
    authors: [
      'Raven Matthew L. Capulong',
      'Maureen Kate B. Aliga',
      'Sofia B. Broniola',
      'Jude Michael A. Cabrera',
      'Nathaniel D. Esguerra',
      'Alaine N. Gonzales',
      'Lee Yuri L. Luna'
    ],
    keywords: ['Image Processing', 'Automated Optical Checking', 'Exam Management', 'Android Application', 'Computer Vision'],
    department: 'CCS',
    course: 'BS in Computer Science',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 1640,
    downloadsCount: 520,
    submittedBy: 'capulong.r@udm.edu.ph',
    dateAdded: '2025-04-14'
  },
  {
    researchID: 'RES-CCS-2025-006',
    title: 'Library Usage Monitoring System for Universidad de Manila',
    abstract: 'This study investigated space utilization and resource circulation inside the UDM University Library by implementing a digitized library usage monitoring system. Using barcode/RFID badge scanning at entry checkpoints, the application records student foot-traffic patterns, peak study hours, and resource borrow frequencies across all colleges. The real-time capacity dashboard empowers librarians to enforce study room limits and optimize academic collection procurements.',
    authors: [
      'Cristian Rico D. Gabutin',
      'Princess Jhasmine B. Lominog',
      'Innah Rose T. Mabunga',
      'Pauline B. Morabe',
      'John Joseph Quito',
      'Imie Florelyn R. Teologo'
    ],
    keywords: ['Library Management', 'Attendance Tracking', 'RFID', 'Resource Utilization', 'UDM Library'],
    department: 'CCS',
    course: 'BS in Information Technology',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view',
    viewsCount: 1110,
    downloadsCount: 290,
    submittedBy: 'gabutin.c@udm.edu.ph',
    dateAdded: '2025-04-20'
  },

  // ==========================================
  // COLLEGE OF CRIMINAL JUSTICE (CCJ) - The Pillars 2025-2026
  // ==========================================
  {
    researchID: 'RES-CCJ-2026-001',
    title: 'Level of Awareness of Tertiary Students on Online Identity Theft',
    abstract: 'As tertiary education integrates ubiquitous digital platforms and social media, cybercriminals increasingly exploit vulnerable student demographics. This study surveyed 250 undergraduate students at Universidad de Manila to measure awareness regarding phishing, credential stuffing, and social engineering vectors. Results showed moderate general awareness of passwords but low vigilance regarding public Wi-Fi risks and third-party app permissions. A comprehensive cybersecurity awareness framework was proposed for university-wide orientation modules.',
    authors: [
      'Jade Trixie Rafol',
      'Rosemarie G. Inojales',
      'Brooke Chelle A. Abellar',
      'Allona Jewel A. Bernardo',
      'Cristine A. Angeles',
      'Sandy L. Macabeo',
      'Francis John C. Dapito',
      'Kurt Russel Ramos',
      'Voltaire Perales'
    ],
    keywords: ['Identity Theft', 'Cybercrime Awareness', 'Tertiary Students', 'Digital Security', 'Social Engineering'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view',
    viewsCount: 1870,
    downloadsCount: 512,
    submittedBy: 'rafol.j@udm.edu.ph',
    dateAdded: '2026-01-20'
  },
  {
    researchID: 'RES-CCJ-2026-002',
    title: 'Implementation of Katatagan, Kalusugan at Damayan ng Komunidad (KKDK) Program in Manila City Jail – Male Dormitory: Status, Challenges, and Prospects',
    abstract: 'This qualitative and evaluative study investigated the implementation of the KKDK community-based psychological intervention program inside the Manila City Jail Male Dormitory. By interviewing Persons Deprived of Liberty (PDLs), jail wardens, and BJMP psychologists, the research assessed module delivery, emotional resilience, and peer bonding. Findings highlighted significant reduction in inmate stress levels and recidivism risk, while identifying severe facility congestion and resource deficits as critical operational challenges.',
    authors: [
      'Symoun Yurik San Diego',
      'Thessalonica Carmona',
      'Cristine Cabardo',
      'Reinalyn Rivera',
      'Junair Faisal',
      'Angela Marie Toledo',
      'Shaznay Anne Nicole Rafael',
      'Winnie Cane Batican',
      'Aliyah Diaz',
      'Lanie Dimalungan',
      'Prof. Joaquin De Castro II'
    ],
    keywords: ['KKDK Program', 'Manila City Jail', 'Community Reintegration', 'Correctional Rehabilitation', 'Inmate Welfare'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view',
    viewsCount: 2340,
    downloadsCount: 790,
    submittedBy: 'sandiego.s@udm.edu.ph',
    dateAdded: '2026-02-11'
  },
  {
    researchID: 'RES-CCJ-2026-003',
    title: 'Dark Figures: A Study of Self-Disclosed Academic Misconduct of Undergraduate Students at Universidad De Manila',
    abstract: 'Academic dishonesty represents a hidden criminological phenomenon analogous to the dark figures of crime in sociological studies. Utilizing an anonymous self-disclosure methodology with randomized response techniques, this research measured unreported unauthorized collaboration, digital exam cheat sheets, and AI misuse among undergraduate students. The study identified academic pressure, GPA anxieties, and lenient proctoring environments as primary catalysts, formulating institutional recommendations for honor code reforms.',
    authors: [
      'Marius Oliver C. Bartolome',
      'Juan Paolo G. Bravo',
      'Julie Anne Rae M. Canlas',
      'John Paul I. Cañada',
      'Oliver Wendell N. Castillo',
      'George Kian C. Federis',
      'Marvin D. Flores',
      'John Lyod V. Galon',
      'All Jefferson P. Primavera',
      'Renelhen J. Serrano',
      'Voltaire L. Perales'
    ],
    keywords: ['Academic Integrity', 'Dark Figures of Crime', 'Self-Reported Misconduct', 'Cheating Behavior', 'Higher Education Ethics'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view',
    viewsCount: 1980,
    downloadsCount: 640,
    submittedBy: 'bartolome.m@udm.edu.ph',
    dateAdded: '2026-02-18'
  },
  {
    researchID: 'RES-CCJ-2026-004',
    title: 'Evaluating the Implementation of Simultaneous Anti-Criminality Law Enforcement Operations in Manila Police District - Police Station 6',
    abstract: 'Simultaneous Anti-Criminality Law Enforcement Operations (SACLEO) serve as a frontline policing strategy by the Philippine National Police (PNP) to suppress street crimes and arrest wanted individuals. This study assessed the operational fidelity, coordination protocols, and community human rights perceptions of SACLEO conducted by Manila Police District (MPD) Station 6 (Sta. Ana, Manila). Findings revealed notable drops in robbery incidents alongside community recommendations for enhanced transparency and body-worn camera mandates during sweeps.',
    authors: [
      'Benedictine Abbey P. Columbres',
      'Eiderf Daniel Q. Cruz',
      'John Bently D. Flores',
      'Jhon Kenneth S. Leonardo',
      'Edwin Jr. F. Oratil',
      'Jhon Lyold L. Pascua',
      'Don Jack S. Pesebre',
      'Erwin Jr. A. Rubio',
      'John Loyd E. Simon',
      'Lester John L. Soriano',
      'Prof. Vincent Visitacion'
    ],
    keywords: ['SACLEO', 'Manila Police District', 'Crime Prevention', 'Law Enforcement Operations', 'Community Policing'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view',
    viewsCount: 1530,
    downloadsCount: 470,
    submittedBy: 'columbres.b@udm.edu.ph',
    dateAdded: '2026-03-01'
  },
  {
    researchID: 'RES-CCJ-2025-005',
    title: 'Evaluating the Competency of Barangay Violence Against Women (VAW) Desk in Handling Cases in Zone 31, Sta. Cruz, Manila',
    abstract: 'Pursuant to Republic Act 9710 (Magna Carta of Women), barangay local government units are mandated to establish functional Violence Against Women (VAW) desks. This study evaluated the procedural competencies, case referral workflows, and privacy protections implemented by VAW desk officers in Zone 31, Sta. Cruz, Manila. The research revealed that while officers demonstrated high dedication and empathy, significant gaps persisted in psychological first-aid training, formal documentation registries, and private intake spaces.',
    authors: [
      'Ronaida B. Torres',
      'Charles Mclaurence C. Boado',
      'Brigette Rona A. Guro',
      'Nathalie Jane M. Magno',
      'Anjelica Louise B. Mañozca',
      'Ariane P. Marcellana',
      'Ma. Ronilyn Joyce L. Maynigo',
      'Anna Mae R. Tuda',
      'Mark Anthony Rigor'
    ],
    keywords: ['VAW Desk', 'Magna Carta of Women', 'Barangay Justice', 'Gender-Based Violence', 'Sta. Cruz Manila'],
    department: 'CCJ',
    course: 'BS in Criminology',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1jVsYUlbNBUflrZsg7P7653xLWZHpPtjX/view',
    viewsCount: 2450,
    downloadsCount: 820,
    submittedBy: 'torres.r@udm.edu.ph',
    dateAdded: '2025-05-12'
  },

  // ==========================================
  // COLLEGE OF ARTS AND SCIENCES (CAS) - Ad Sapientiam Vol. 3
  // ==========================================
  {
    researchID: 'RES-CAS-2025-001',
    title: 'The Effects of PESO in Enhancing Employment Opportunities for Beneficiaries in District 1, Manila',
    abstract: 'This study examined the effects of the Public Employment Service Office (PESO) in enhancing employment opportunities for beneficiaries in District 1 (Tondo), Manila. Across a sample of 340 respondents, the research investigated four core operational areas: labor market information, referral and placement services, training seminars, and job fair management. Over 68.5% of respondents rated job search support as excellent, with placement matching efficiency acknowledged by 64% of participants. The study recommends expanding digital job registries to sustain local micro-livelihoods.',
    authors: [
      'Vince Joshua Victorino',
      'Anne Philomena Quijado',
      'Jenny Rose Sarzaba',
      'Julius Tapispisan'
    ],
    keywords: ['PESO Manila', 'Public Employment', 'District 1 Tondo', 'Job Placement', 'Labor Market Policy'],
    department: 'CAS',
    course: 'Bachelor in Public Administration',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view',
    viewsCount: 2210,
    downloadsCount: 710,
    submittedBy: 'victorino.v@udm.edu.ph',
    dateAdded: '2025-03-24'
  },
  {
    researchID: 'RES-CAS-2025-002',
    title: 'A Theoretical Analysis of ChatGPT\'s Hybrid Heuristic Based Graph Coloring Algorithm',
    abstract: 'Vertex graph coloring is an NP-hard problem fundamental to timetable scheduling, map partitioning, and register allocation in computer mathematics. This paper investigated the heuristic mathematical logic exhibited by Large Language Models when generating hybrid graph coloring algorithms for planar and chromatic graphs. By evaluating output solutions against Welsh-Powell and DSATUR benchmark algorithms, the study proved that LLM-generated heuristics achieve near-optimal chromatic numbers when constrained with explicit greedy bounds.',
    authors: [
      'R. M. Santos',
      'J. K. Del Rosario',
      'Dr. L. Fernandez'
    ],
    keywords: ['Graph Coloring', 'Heuristic Algorithms', 'ChatGPT AI Reasoning', 'NP-Hard Problems', 'Discrete Mathematics'],
    department: 'CAS',
    course: 'BS in Mathematics',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view',
    viewsCount: 1780,
    downloadsCount: 560,
    submittedBy: 'santos.rm@udm.edu.ph',
    dateAdded: '2025-04-05'
  },
  {
    researchID: 'RES-CAS-2025-003',
    title: 'The Gaslighting Experience and Emotional Intelligence of Psychology Students: A Proposed Intervention Program',
    abstract: 'Gaslighting in interpersonal, familial, and romantic relationships causes cognitive dissonance and self-doubt. This correlational study explored the relationship between exposure to gaslighting behaviors and trait emotional intelligence among 180 undergraduate psychology majors. Quantitative regression showed significant inverse correlations between subtle gaslighting and emotional self-regulation. Based on empirical findings, the researchers proposed "SALAMIN," a therapeutic cognitive restructuring intervention program tailored for collegiate student support centers.',
    authors: [
      'Alyssa Marie Tan',
      'Christian Paul Gomez',
      'Kyla Denise Cruz'
    ],
    keywords: ['Gaslighting', 'Emotional Intelligence', 'Psychological Abuse', 'Intervention Program', 'Interpersonal Relationships'],
    department: 'CAS',
    course: 'BS in Psychology',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view',
    viewsCount: 3120,
    downloadsCount: 1040,
    submittedBy: 'tan.am@udm.edu.ph',
    dateAdded: '2025-04-12'
  },
  {
    researchID: 'RES-CAS-2025-004',
    title: 'Empowering Tomorrow’s Leader: Analyzing The Impact of Sangguniang Kabataan Elections on Youth Civic Participation in Barangay 598',
    abstract: 'Youth civic engagement is vital for community self-determination and local governance in Manila. This study examined the motivational and socio-political impacts of the Sangguniang Kabataan (SK) elections on youth participation in Barangay 598, Zone 59. Employing mixed-methods surveys and focus group discussions, the study revealed that while youth voter turnout was high (78%), active involvement in sports and disaster relief programs was hindered by perceived political patronage and transparency concerns.',
    authors: [
      'Irish M. Del Rosario',
      'Christine L. Rosales',
      'Maria Kristina Sotio',
      'Augusta N. Altobar'
    ],
    keywords: ['Sangguniang Kabataan', 'Youth Governance', 'Civic Participation', 'Barangay 598', 'Community Development'],
    department: 'CAS',
    course: 'BS in Social Work',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view',
    viewsCount: 1620,
    downloadsCount: 480,
    submittedBy: 'delrosario.i@udm.edu.ph',
    dateAdded: '2025-04-18'
  },
  {
    researchID: 'RES-CAS-2025-005',
    title: 'TAWAG: Lived Experiences of Call Center Agents Among 4th Year Students of Bachelor of Arts in Communication of Universidad De Manila',
    abstract: 'The Philippine Business Process Outsourcing (BPO) industry provides vital economic livelihood for university students financing their degrees. This phenomenological inquiry documented the lived experiences, coping mechanisms, and circadian sleep disruptions of graduating communication students working graveyard customer service shifts. Despite substantial financial independence, students experienced acute cognitive exhaustion and academic scheduling conflicts, highlighting the urgent need for university flexible hybrid attendance policies.',
    authors: [
      'Elmer Ma Cambia Jr.',
      'Francine Lopez Meñano',
      'Ezra Mae Vingco Mangabang',
      'Khryztel Allysza Aldana Nuque',
      'Thomas Ian Rodrigo Tubiera',
      'Dr. Jaime Ang'
    ],
    keywords: ['BPO Industry', 'Working Students', 'Communication Arts', 'Dual-Role Strain', 'Call Center Agents'],
    department: 'CAS',
    course: 'BA in Communication',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view',
    viewsCount: 2680,
    downloadsCount: 890,
    submittedBy: 'cambia.e@udm.edu.ph',
    dateAdded: '2025-05-02'
  },

  // ==========================================
  // COLLEGE OF HEALTH SCIENCES (CHS) - CHS Research Journal
  // ==========================================
  {
    researchID: 'RES-CHS-2025-001',
    title: 'Workplace Bullying among Nurses in Selected Hospitals in Manila: A Phenomenological Study',
    abstract: 'Workplace bullying in clinical healthcare settings poses a severe threat to nurse retention, mental health, and patient safety. Utilizing Colaizzi’s phenomenological method, this research investigated the lived experiences of registered nurses working in public and private tertiary hospitals across Manila. In-depth interviews extracted seven emergent themes: hierarchical belittlement, shift dumping, psychological burnout, defensive silence, and career attrition. The study outlines actionable hospital policy reforms for zero-tolerance grievance reporting protocols.',
    authors: [
      'Jefferson Dacut',
      'Paula Pena',
      'Gracelyn Pundavela',
      'Recyleen Rejano',
      'Marry Sandig',
      'Rename Sta. Ana',
      'Jana Donita Suarez',
      'Alexander James Tomimbang',
      'Charlene Versoza',
      'Roselyn Villaruel',
      'Dr. Rhodora C. Bernal'
    ],
    keywords: ['Nurse Bullying', 'Workplace Dynamics', 'Hospital Administration', 'Healthcare Quality', 'Phenomenology'],
    department: 'CHS',
    course: 'BS in Nursing',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/14_2TeNnohovoBi8-tCEBwWnsGjqYoSgX/view',
    viewsCount: 3450,
    downloadsCount: 1120,
    submittedBy: 'dacut.j@udm.edu.ph',
    dateAdded: '2025-05-18'
  },
  {
    researchID: 'RES-CHS-2025-002',
    title: 'Incidence and Level of Disability of Back Pain among College of Health Sciences Students in an Online Learning in Universidad De Manila: Basis for Back Exercise Program',
    abstract: 'Prolonged static posture during hybrid and online classes has increased musculoskeletal discomfort among allied health students. This study measured the incidence and severity of low back pain using the Oswestry Low Back Pain Disability Index among physical therapy and nursing undergraduates. Over 72% of respondents reported mild-to-moderate spinal disability correlated with improper desk ergonomics. The authors developed an ergonomic stretching guide and core-stabilization home exercise routine.',
    authors: [
      'Christian Jay Arevalo',
      'Marielle Santos',
      'Dr. Rhodora C. Bernal'
    ],
    keywords: ['Low Back Pain', 'Ergonomics', 'Physical Therapy', 'Online Learning Strain', 'Posture Exercises'],
    department: 'CHS',
    course: 'BS in Physical Therapy',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/14_2TeNnohovoBi8-tCEBwWnsGjqYoSgX/view',
    viewsCount: 1940,
    downloadsCount: 620,
    submittedBy: 'arevalo.c@udm.edu.ph',
    dateAdded: '2025-05-22'
  },

  // ==========================================
  // COLLEGE OF EDUCATION (CED) - The Wizards Journal
  // ==========================================
  {
    researchID: 'RES-CED-2026-001',
    title: 'A Community-Based Physical Education Intervention Program to Promote Physical Activity Participation Among Geriatrics',
    abstract: 'Regular physical activity is vital for preserving cardiovascular vitality and mobility among elderly populations, yet urban senior citizens frequently face inaccessible recreational infrastructure. Spearheaded in partnership with the URELIA Extension Unit, this community-based action research designed and evaluated an 8-week low-impact mobility and calisthenics intervention for geriatric residents in Manila. Participant post-evaluations demonstrated significant improvements in balance, joint flexibility, and subjective quality of life.',
    authors: [
      'Amalfi B. Tabin, Jr.',
      'Marvin B. Gomez',
      'Ariel Christopher C. Marcelino',
      'Eric A. Albener',
      'Hernando P. Diaz',
      'Mellanie Gomez'
    ],
    keywords: ['Geriatric Fitness', 'Physical Activity', 'Community Health', 'Senior Citizens Manila', 'URELIA Extension'],
    department: 'CED',
    course: 'Bachelor of Physical Education',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view',
    viewsCount: 1680,
    downloadsCount: 540,
    submittedBy: 'tabin.a@udm.edu.ph',
    dateAdded: '2026-02-05'
  },
  {
    researchID: 'RES-CED-2025-002',
    title: 'Dimensions of Personality Traits of Student-Athletes during the Covid-19 Pandemic towards an Enhanced Personality Development Program',
    abstract: 'Collegiate student-athletes bear the dual burden of rigorous academic performance and competitive athletic conditioning. Utilizing the Big Five OCEAN personality model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), this study evaluated the psychological trait profiles of 50 UDM varsity student-athletes competing in the UAAP, ALCUAA, and NCAA tournaments. High conscientiousness and grit were correlated with academic endurance during disruptions, serving as the empirical baseline for an institutional athletic mentorship curriculum.',
    authors: [
      'B-jay V. Agudo',
      'Mark Anthony M. Baleña',
      'Jullius M. Arevalo',
      'Jireh Lyka M. Besmonte',
      'Paul Kristan C. Avillano',
      'John Recca B. Blas',
      'Ken Michael Balza',
      'Dr. Amalfi B. Tabin, Jr.'
    ],
    keywords: ['Student-Athletes', 'Big Five Personality', 'Sports Psychology', 'Endurance & Resilience', 'UDM Athletics'],
    department: 'CED',
    course: 'Bachelor of Physical Education',
    year: 2025,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1noapA8cmgh4MmjZwDuV9XNDZGGdx80Vp/view',
    viewsCount: 2040,
    downloadsCount: 670,
    submittedBy: 'agudo.b@udm.edu.ph',
    dateAdded: '2025-04-28'
  },
  {
    researchID: 'RES-CED-2026-003',
    title: 'Strengthening Early Childhood Education in Urban Communities: A Competency Assessment of Child Development Workers in Manila',
    abstract: 'Early childhood development workers serve as the pedagogical bedrock of community-based daycare centers in urban districts. This research assessed the instructional, developmental screening, and parent engagement competencies of child development workers across Manila barangays. While workers demonstrated exemplary dedication and nurturing skills, significant training gaps were identified in handling neurodivergent learners, leading to a proposed UDM faculty-led continuing education certificate.',
    authors: [
      'Ronnie F. Sta. Maria',
      'Amalfi B. Tabin, Jr.',
      'Nelson M. De Leon'
    ],
    keywords: ['Early Childhood', 'Daycare Workers', 'Teacher Competencies', 'Urban Education', 'Early Learning Manila'],
    department: 'CED',
    course: 'Bachelor of Elementary Education',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view',
    viewsCount: 1450,
    downloadsCount: 430,
    submittedBy: 'stamaria.r@udm.edu.ph',
    dateAdded: '2026-02-14'
  },
  {
    researchID: 'RES-CED-2026-004',
    title: 'Mixed Vertical Urban Gardening Using Ornamental and Fruit-Bearing Plants: Enhancing Environmental Quality and Community Engagement in Barangay 790, City of Manila',
    abstract: 'Rapid urbanization and limited green spaces in Manila exacerbate the urban heat island effect and restrict household fresh produce access. This study designed and tested space-efficient mixed vertical gardening racks using recycled polyvinyl chloride (PVC) conduits and drip-irrigation systems in Barangay 790, City of Manila. Community post-surveys demonstrated a 40% increase in resident green practices and improved localized micro-climate indices.',
    authors: [
      'Vanessa Vargas-Martinez',
      'Evangeline L. Martinez',
      'Ricardo Reyes Jr.',
      'Nixon Nikko Maquirang',
      'Alistair B. Selorio'
    ],
    keywords: ['Urban Gardening', 'Environmental Science', 'Community Extension', 'Barangay 790', 'Sustainable Manila'],
    department: 'CED',
    course: 'Bachelor of Secondary Education',
    year: 2026,
    status: 'approved',
    fullPdfUrl: 'https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view',
    viewsCount: 1590,
    downloadsCount: 490,
    submittedBy: 'martinez.v@udm.edu.ph',
    dateAdded: '2026-02-22'
  }
];
