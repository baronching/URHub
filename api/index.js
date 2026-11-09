// server.ts
import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

// src/data/gdriveJournalsData.ts
var GDRIVE_RESEARCH_PAPERS = [
  // ==========================================
  // COLLEGE OF COMPUTER STUDIES (CCS) - innovITe Vol. 1
  // ==========================================
  {
    researchID: "RES-CCS-2025-001",
    title: "Enhancing Faculty Assessment: An Online Faculty Evaluation System with Descriptive Data Analytics",
    abstract: "This study presents the design and implementation of an online faculty evaluation system equipped with descriptive data analytics for the Universidad de Manila. By transitioning from manual pen-and-paper evaluations to an automated digital pipeline, the system captures student feedback across multiple teaching dimensions and generates interactive performance dashboards. Descriptive statistical models provide academic department chairs with granular metrics on instructional competence, classroom management, and student engagement, enabling data-informed faculty development interventions.",
    authors: [
      "Cesar P. Guico Jr.",
      "Irish Grace A. Blanco",
      "Hector Jr. T. Cortez",
      "Simon A. Quinzon",
      "Louise June A. Reyes",
      "Ezekiel Isaac Gerard M. Salinas",
      "Emar John P. Tiongson"
    ],
    keywords: ["Faculty Evaluation", "Descriptive Analytics", "Higher Education", "Educational Technology", "Performance Dashboards"],
    department: "CCS",
    course: "BS in Information Technology",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 1420,
    downloadsCount: 395,
    submittedBy: "guico.c@udm.edu.ph",
    dateAdded: "2025-03-15"
  },
  {
    researchID: "RES-CCS-2025-002",
    title: "File Encryption and Decryption Mobile Application Utilizing Advanced Encryption Standard Algorithm",
    abstract: "Information confidentiality on mobile devices is increasingly vulnerable to unauthorized access and cyber breaches. This study developed an Android-based mobile application that implements the Advanced Encryption Standard (AES-256) cryptographic algorithm to secure sensitive digital documents. Users can encrypt, store, and decrypt local files including PDFs, images, and text files using dynamic symmetric cipher keys. Benchmark tests revealed near-instantaneous encryption throughput with zero data corruption across multi-format payload sizes.",
    authors: [
      "Novelyn R. Abiog",
      "John Andrei R. Asuncion",
      "Gerald B. Carlos",
      "John Christopher F. Gallardo",
      "Maria Elizabeth V. Luro",
      "Luis Ariel A. Mangahas",
      "Lexjoy O. Ranillo",
      "Aubrey Joice B. Rodas"
    ],
    keywords: ["AES Algorithm", "Cryptography", "Mobile Security", "Data Protection", "File Encryption"],
    department: "CCS",
    course: "BS in Information Technology",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 980,
    downloadsCount: 310,
    submittedBy: "abiog.n@udm.edu.ph",
    dateAdded: "2025-03-18"
  },
  {
    researchID: "RES-CCS-2025-003",
    title: "Web-based Inquiry and Admission System with Data Analytics Integrating AI Chatbot for Universidad de Manila",
    abstract: "Addressing the surge of inquiries during admissions season, this project developed a web-based admission and applicant inquiry system for Universidad de Manila. The platform features an intelligent conversational AI chatbot capable of answering frequent admission criteria, program prerequisites, and document requirements in English and Tagalog 24/7. Built-in predictive analytics track applicant demographics and qualification trends, significantly reducing inquiry wait times for the UDM Admissions Office.",
    authors: [
      "Jenilee B. Bahan",
      "Harvey Nichol Q. Banag",
      "Christien Joshua C. Celestino",
      "Nikho Jay L. De Castro",
      "Heaven De Jose",
      "Ruel Jr. T. Edic",
      "Eli Daniel S. Rosita",
      "Karl Joshua R. Ruazol"
    ],
    keywords: ["Admissions System", "AI Chatbot", "Data Analytics", "Enrollment Management", "Universidad de Manila"],
    department: "CCS",
    course: "BS in Computer Science",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 2150,
    downloadsCount: 680,
    submittedBy: "bahan.j@udm.edu.ph",
    dateAdded: "2025-04-02"
  },
  {
    researchID: "RES-CCS-2025-004",
    title: "Research Document Repository System of Universidad de Manila for University Research Center",
    abstract: "This research engineered a centralized institutional digital repository for the University Research Center (URELIA) at Universidad de Manila. The system archives undergraduate thesis manuscripts, faculty publications, and research monographs with role-based access control, automated citation generators, and full-text metadata indexing. By replacing physical manuscript storage with cloud archiving, the study demonstrated an 85% increase in thesis accessibility and systematic plagiarism prevention.",
    authors: [
      "Eizel Jom A. Saez",
      "Princess Joy A. Javier",
      "Diana Rose Q. Mustacisa",
      "Rhohart Martel",
      "Allyssa Gale S. Intal",
      "Jhon Russel S. Espiritu",
      "Michael Ivan C. Perez"
    ],
    keywords: ["Research Repository", "URELIA", "Document Management", "Academic Archiving", "Metadata Indexing"],
    department: "CCS",
    course: "BS in Computer Science",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 3200,
    downloadsCount: 940,
    submittedBy: "saez.e@udm.edu.ph",
    dateAdded: "2025-04-10"
  },
  {
    researchID: "RES-CCS-2025-005",
    title: "Android-Based Examination Management and Automated Checker Using Image Processing",
    abstract: "Manual grading of standardized multiple-choice examinations introduces human scoring errors and consumes extensive faculty hours. This project implemented an Android application utilizing computer vision and edge detection algorithms to scan and automatically score bubble examination sheets in real time. The camera detects alignment anchors, normalizes optical distortions, and verifies student IDs with an empirical scoring accuracy of 99.4%, exporting score rosters directly to faculty grading sheets.",
    authors: [
      "Raven Matthew L. Capulong",
      "Maureen Kate B. Aliga",
      "Sofia B. Broniola",
      "Jude Michael A. Cabrera",
      "Nathaniel D. Esguerra",
      "Alaine N. Gonzales",
      "Lee Yuri L. Luna"
    ],
    keywords: ["Image Processing", "Automated Optical Checking", "Exam Management", "Android Application", "Computer Vision"],
    department: "CCS",
    course: "BS in Computer Science",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 1640,
    downloadsCount: 520,
    submittedBy: "capulong.r@udm.edu.ph",
    dateAdded: "2025-04-14"
  },
  {
    researchID: "RES-CCS-2025-006",
    title: "Library Usage Monitoring System for Universidad de Manila",
    abstract: "This study investigated space utilization and resource circulation inside the UDM University Library by implementing a digitized library usage monitoring system. Using barcode/RFID badge scanning at entry checkpoints, the application records student foot-traffic patterns, peak study hours, and resource borrow frequencies across all colleges. The real-time capacity dashboard empowers librarians to enforce study room limits and optimize academic collection procurements.",
    authors: [
      "Cristian Rico D. Gabutin",
      "Princess Jhasmine B. Lominog",
      "Innah Rose T. Mabunga",
      "Pauline B. Morabe",
      "John Joseph Quito",
      "Imie Florelyn R. Teologo"
    ],
    keywords: ["Library Management", "Attendance Tracking", "RFID", "Resource Utilization", "UDM Library"],
    department: "CCS",
    course: "BS in Information Technology",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/11JV73pxXgyTDinDAZhrUVPYa7MWsCW6B/view",
    viewsCount: 1110,
    downloadsCount: 290,
    submittedBy: "gabutin.c@udm.edu.ph",
    dateAdded: "2025-04-20"
  },
  // ==========================================
  // COLLEGE OF CRIMINAL JUSTICE (CCJ) - The Pillars 2025-2026
  // ==========================================
  {
    researchID: "RES-CCJ-2026-001",
    title: "Level of Awareness of Tertiary Students on Online Identity Theft",
    abstract: "As tertiary education integrates ubiquitous digital platforms and social media, cybercriminals increasingly exploit vulnerable student demographics. This study surveyed 250 undergraduate students at Universidad de Manila to measure awareness regarding phishing, credential stuffing, and social engineering vectors. Results showed moderate general awareness of passwords but low vigilance regarding public Wi-Fi risks and third-party app permissions. A comprehensive cybersecurity awareness framework was proposed for university-wide orientation modules.",
    authors: [
      "Jade Trixie Rafol",
      "Rosemarie G. Inojales",
      "Brooke Chelle A. Abellar",
      "Allona Jewel A. Bernardo",
      "Cristine A. Angeles",
      "Sandy L. Macabeo",
      "Francis John C. Dapito",
      "Kurt Russel Ramos",
      "Voltaire Perales"
    ],
    keywords: ["Identity Theft", "Cybercrime Awareness", "Tertiary Students", "Digital Security", "Social Engineering"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view",
    viewsCount: 1870,
    downloadsCount: 512,
    submittedBy: "rafol.j@udm.edu.ph",
    dateAdded: "2026-01-20"
  },
  {
    researchID: "RES-CCJ-2026-002",
    title: "Implementation of Katatagan, Kalusugan at Damayan ng Komunidad (KKDK) Program in Manila City Jail \u2013 Male Dormitory: Status, Challenges, and Prospects",
    abstract: "This qualitative and evaluative study investigated the implementation of the KKDK community-based psychological intervention program inside the Manila City Jail Male Dormitory. By interviewing Persons Deprived of Liberty (PDLs), jail wardens, and BJMP psychologists, the research assessed module delivery, emotional resilience, and peer bonding. Findings highlighted significant reduction in inmate stress levels and recidivism risk, while identifying severe facility congestion and resource deficits as critical operational challenges.",
    authors: [
      "Symoun Yurik San Diego",
      "Thessalonica Carmona",
      "Cristine Cabardo",
      "Reinalyn Rivera",
      "Junair Faisal",
      "Angela Marie Toledo",
      "Shaznay Anne Nicole Rafael",
      "Winnie Cane Batican",
      "Aliyah Diaz",
      "Lanie Dimalungan",
      "Prof. Joaquin De Castro II"
    ],
    keywords: ["KKDK Program", "Manila City Jail", "Community Reintegration", "Correctional Rehabilitation", "Inmate Welfare"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view",
    viewsCount: 2340,
    downloadsCount: 790,
    submittedBy: "sandiego.s@udm.edu.ph",
    dateAdded: "2026-02-11"
  },
  {
    researchID: "RES-CCJ-2026-003",
    title: "Dark Figures: A Study of Self-Disclosed Academic Misconduct of Undergraduate Students at Universidad De Manila",
    abstract: "Academic dishonesty represents a hidden criminological phenomenon analogous to the dark figures of crime in sociological studies. Utilizing an anonymous self-disclosure methodology with randomized response techniques, this research measured unreported unauthorized collaboration, digital exam cheat sheets, and AI misuse among undergraduate students. The study identified academic pressure, GPA anxieties, and lenient proctoring environments as primary catalysts, formulating institutional recommendations for honor code reforms.",
    authors: [
      "Marius Oliver C. Bartolome",
      "Juan Paolo G. Bravo",
      "Julie Anne Rae M. Canlas",
      "John Paul I. Ca\xF1ada",
      "Oliver Wendell N. Castillo",
      "George Kian C. Federis",
      "Marvin D. Flores",
      "John Lyod V. Galon",
      "All Jefferson P. Primavera",
      "Renelhen J. Serrano",
      "Voltaire L. Perales"
    ],
    keywords: ["Academic Integrity", "Dark Figures of Crime", "Self-Reported Misconduct", "Cheating Behavior", "Higher Education Ethics"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view",
    viewsCount: 1980,
    downloadsCount: 640,
    submittedBy: "bartolome.m@udm.edu.ph",
    dateAdded: "2026-02-18"
  },
  {
    researchID: "RES-CCJ-2026-004",
    title: "Evaluating the Implementation of Simultaneous Anti-Criminality Law Enforcement Operations in Manila Police District - Police Station 6",
    abstract: "Simultaneous Anti-Criminality Law Enforcement Operations (SACLEO) serve as a frontline policing strategy by the Philippine National Police (PNP) to suppress street crimes and arrest wanted individuals. This study assessed the operational fidelity, coordination protocols, and community human rights perceptions of SACLEO conducted by Manila Police District (MPD) Station 6 (Sta. Ana, Manila). Findings revealed notable drops in robbery incidents alongside community recommendations for enhanced transparency and body-worn camera mandates during sweeps.",
    authors: [
      "Benedictine Abbey P. Columbres",
      "Eiderf Daniel Q. Cruz",
      "John Bently D. Flores",
      "Jhon Kenneth S. Leonardo",
      "Edwin Jr. F. Oratil",
      "Jhon Lyold L. Pascua",
      "Don Jack S. Pesebre",
      "Erwin Jr. A. Rubio",
      "John Loyd E. Simon",
      "Lester John L. Soriano",
      "Prof. Vincent Visitacion"
    ],
    keywords: ["SACLEO", "Manila Police District", "Crime Prevention", "Law Enforcement Operations", "Community Policing"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1qi8xoiWbMF30_XKnBGIM3UyuLxm8ZU1_/view",
    viewsCount: 1530,
    downloadsCount: 470,
    submittedBy: "columbres.b@udm.edu.ph",
    dateAdded: "2026-03-01"
  },
  {
    researchID: "RES-CCJ-2025-005",
    title: "Evaluating the Competency of Barangay Violence Against Women (VAW) Desk in Handling Cases in Zone 31, Sta. Cruz, Manila",
    abstract: "Pursuant to Republic Act 9710 (Magna Carta of Women), barangay local government units are mandated to establish functional Violence Against Women (VAW) desks. This study evaluated the procedural competencies, case referral workflows, and privacy protections implemented by VAW desk officers in Zone 31, Sta. Cruz, Manila. The research revealed that while officers demonstrated high dedication and empathy, significant gaps persisted in psychological first-aid training, formal documentation registries, and private intake spaces.",
    authors: [
      "Ronaida B. Torres",
      "Charles Mclaurence C. Boado",
      "Brigette Rona A. Guro",
      "Nathalie Jane M. Magno",
      "Anjelica Louise B. Ma\xF1ozca",
      "Ariane P. Marcellana",
      "Ma. Ronilyn Joyce L. Maynigo",
      "Anna Mae R. Tuda",
      "Mark Anthony Rigor"
    ],
    keywords: ["VAW Desk", "Magna Carta of Women", "Barangay Justice", "Gender-Based Violence", "Sta. Cruz Manila"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1jVsYUlbNBUflrZsg7P7653xLWZHpPtjX/view",
    viewsCount: 2450,
    downloadsCount: 820,
    submittedBy: "torres.r@udm.edu.ph",
    dateAdded: "2025-05-12"
  },
  // ==========================================
  // COLLEGE OF ARTS AND SCIENCES (CAS) - Ad Sapientiam Vol. 3
  // ==========================================
  {
    researchID: "RES-CAS-2025-001",
    title: "The Effects of PESO in Enhancing Employment Opportunities for Beneficiaries in District 1, Manila",
    abstract: "This study examined the effects of the Public Employment Service Office (PESO) in enhancing employment opportunities for beneficiaries in District 1 (Tondo), Manila. Across a sample of 340 respondents, the research investigated four core operational areas: labor market information, referral and placement services, training seminars, and job fair management. Over 68.5% of respondents rated job search support as excellent, with placement matching efficiency acknowledged by 64% of participants. The study recommends expanding digital job registries to sustain local micro-livelihoods.",
    authors: [
      "Vince Joshua Victorino",
      "Anne Philomena Quijado",
      "Jenny Rose Sarzaba",
      "Julius Tapispisan"
    ],
    keywords: ["PESO Manila", "Public Employment", "District 1 Tondo", "Job Placement", "Labor Market Policy"],
    department: "CAS",
    course: "Bachelor in Public Administration",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view",
    viewsCount: 2210,
    downloadsCount: 710,
    submittedBy: "victorino.v@udm.edu.ph",
    dateAdded: "2025-03-24"
  },
  {
    researchID: "RES-CAS-2025-002",
    title: "A Theoretical Analysis of ChatGPT's Hybrid Heuristic Based Graph Coloring Algorithm",
    abstract: "Vertex graph coloring is an NP-hard problem fundamental to timetable scheduling, map partitioning, and register allocation in computer mathematics. This paper investigated the heuristic mathematical logic exhibited by Large Language Models when generating hybrid graph coloring algorithms for planar and chromatic graphs. By evaluating output solutions against Welsh-Powell and DSATUR benchmark algorithms, the study proved that LLM-generated heuristics achieve near-optimal chromatic numbers when constrained with explicit greedy bounds.",
    authors: [
      "R. M. Santos",
      "J. K. Del Rosario",
      "Dr. L. Fernandez"
    ],
    keywords: ["Graph Coloring", "Heuristic Algorithms", "ChatGPT AI Reasoning", "NP-Hard Problems", "Discrete Mathematics"],
    department: "CAS",
    course: "BS in Mathematics",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view",
    viewsCount: 1780,
    downloadsCount: 560,
    submittedBy: "santos.rm@udm.edu.ph",
    dateAdded: "2025-04-05"
  },
  {
    researchID: "RES-CAS-2025-003",
    title: "The Gaslighting Experience and Emotional Intelligence of Psychology Students: A Proposed Intervention Program",
    abstract: 'Gaslighting in interpersonal, familial, and romantic relationships causes cognitive dissonance and self-doubt. This correlational study explored the relationship between exposure to gaslighting behaviors and trait emotional intelligence among 180 undergraduate psychology majors. Quantitative regression showed significant inverse correlations between subtle gaslighting and emotional self-regulation. Based on empirical findings, the researchers proposed "SALAMIN," a therapeutic cognitive restructuring intervention program tailored for collegiate student support centers.',
    authors: [
      "Alyssa Marie Tan",
      "Christian Paul Gomez",
      "Kyla Denise Cruz"
    ],
    keywords: ["Gaslighting", "Emotional Intelligence", "Psychological Abuse", "Intervention Program", "Interpersonal Relationships"],
    department: "CAS",
    course: "BS in Psychology",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view",
    viewsCount: 3120,
    downloadsCount: 1040,
    submittedBy: "tan.am@udm.edu.ph",
    dateAdded: "2025-04-12"
  },
  {
    researchID: "RES-CAS-2025-004",
    title: "Empowering Tomorrow\u2019s Leader: Analyzing The Impact of Sangguniang Kabataan Elections on Youth Civic Participation in Barangay 598",
    abstract: "Youth civic engagement is vital for community self-determination and local governance in Manila. This study examined the motivational and socio-political impacts of the Sangguniang Kabataan (SK) elections on youth participation in Barangay 598, Zone 59. Employing mixed-methods surveys and focus group discussions, the study revealed that while youth voter turnout was high (78%), active involvement in sports and disaster relief programs was hindered by perceived political patronage and transparency concerns.",
    authors: [
      "Irish M. Del Rosario",
      "Christine L. Rosales",
      "Maria Kristina Sotio",
      "Augusta N. Altobar"
    ],
    keywords: ["Sangguniang Kabataan", "Youth Governance", "Civic Participation", "Barangay 598", "Community Development"],
    department: "CAS",
    course: "BS in Social Work",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view",
    viewsCount: 1620,
    downloadsCount: 480,
    submittedBy: "delrosario.i@udm.edu.ph",
    dateAdded: "2025-04-18"
  },
  {
    researchID: "RES-CAS-2025-005",
    title: "TAWAG: Lived Experiences of Call Center Agents Among 4th Year Students of Bachelor of Arts in Communication of Universidad De Manila",
    abstract: "The Philippine Business Process Outsourcing (BPO) industry provides vital economic livelihood for university students financing their degrees. This phenomenological inquiry documented the lived experiences, coping mechanisms, and circadian sleep disruptions of graduating communication students working graveyard customer service shifts. Despite substantial financial independence, students experienced acute cognitive exhaustion and academic scheduling conflicts, highlighting the urgent need for university flexible hybrid attendance policies.",
    authors: [
      "Elmer Ma Cambia Jr.",
      "Francine Lopez Me\xF1ano",
      "Ezra Mae Vingco Mangabang",
      "Khryztel Allysza Aldana Nuque",
      "Thomas Ian Rodrigo Tubiera",
      "Dr. Jaime Ang"
    ],
    keywords: ["BPO Industry", "Working Students", "Communication Arts", "Dual-Role Strain", "Call Center Agents"],
    department: "CAS",
    course: "BA in Communication",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1zkgB9RIKyPQ1f2TQFwjmoS9qbjCukcvm/view",
    viewsCount: 2680,
    downloadsCount: 890,
    submittedBy: "cambia.e@udm.edu.ph",
    dateAdded: "2025-05-02"
  },
  // ==========================================
  // COLLEGE OF HEALTH SCIENCES (CHS) - CHS Research Journal
  // ==========================================
  {
    researchID: "RES-CHS-2025-001",
    title: "Workplace Bullying among Nurses in Selected Hospitals in Manila: A Phenomenological Study",
    abstract: "Workplace bullying in clinical healthcare settings poses a severe threat to nurse retention, mental health, and patient safety. Utilizing Colaizzi\u2019s phenomenological method, this research investigated the lived experiences of registered nurses working in public and private tertiary hospitals across Manila. In-depth interviews extracted seven emergent themes: hierarchical belittlement, shift dumping, psychological burnout, defensive silence, and career attrition. The study outlines actionable hospital policy reforms for zero-tolerance grievance reporting protocols.",
    authors: [
      "Jefferson Dacut",
      "Paula Pena",
      "Gracelyn Pundavela",
      "Recyleen Rejano",
      "Marry Sandig",
      "Rename Sta. Ana",
      "Jana Donita Suarez",
      "Alexander James Tomimbang",
      "Charlene Versoza",
      "Roselyn Villaruel",
      "Dr. Rhodora C. Bernal"
    ],
    keywords: ["Nurse Bullying", "Workplace Dynamics", "Hospital Administration", "Healthcare Quality", "Phenomenology"],
    department: "CHS",
    course: "BS in Nursing",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/14_2TeNnohovoBi8-tCEBwWnsGjqYoSgX/view",
    viewsCount: 3450,
    downloadsCount: 1120,
    submittedBy: "dacut.j@udm.edu.ph",
    dateAdded: "2025-05-18"
  },
  {
    researchID: "RES-CHS-2025-002",
    title: "Incidence and Level of Disability of Back Pain among College of Health Sciences Students in an Online Learning in Universidad De Manila: Basis for Back Exercise Program",
    abstract: "Prolonged static posture during hybrid and online classes has increased musculoskeletal discomfort among allied health students. This study measured the incidence and severity of low back pain using the Oswestry Low Back Pain Disability Index among physical therapy and nursing undergraduates. Over 72% of respondents reported mild-to-moderate spinal disability correlated with improper desk ergonomics. The authors developed an ergonomic stretching guide and core-stabilization home exercise routine.",
    authors: [
      "Christian Jay Arevalo",
      "Marielle Santos",
      "Dr. Rhodora C. Bernal"
    ],
    keywords: ["Low Back Pain", "Ergonomics", "Physical Therapy", "Online Learning Strain", "Posture Exercises"],
    department: "CHS",
    course: "BS in Physical Therapy",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/14_2TeNnohovoBi8-tCEBwWnsGjqYoSgX/view",
    viewsCount: 1940,
    downloadsCount: 620,
    submittedBy: "arevalo.c@udm.edu.ph",
    dateAdded: "2025-05-22"
  },
  // ==========================================
  // COLLEGE OF EDUCATION (CED) - The Wizards Journal
  // ==========================================
  {
    researchID: "RES-CED-2026-001",
    title: "A Community-Based Physical Education Intervention Program to Promote Physical Activity Participation Among Geriatrics",
    abstract: "Regular physical activity is vital for preserving cardiovascular vitality and mobility among elderly populations, yet urban senior citizens frequently face inaccessible recreational infrastructure. Spearheaded in partnership with the URELIA Extension Unit, this community-based action research designed and evaluated an 8-week low-impact mobility and calisthenics intervention for geriatric residents in Manila. Participant post-evaluations demonstrated significant improvements in balance, joint flexibility, and subjective quality of life.",
    authors: [
      "Amalfi B. Tabin, Jr.",
      "Marvin B. Gomez",
      "Ariel Christopher C. Marcelino",
      "Eric A. Albener",
      "Hernando P. Diaz",
      "Mellanie Gomez"
    ],
    keywords: ["Geriatric Fitness", "Physical Activity", "Community Health", "Senior Citizens Manila", "URELIA Extension"],
    department: "CED",
    course: "Bachelor of Physical Education",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view",
    viewsCount: 1680,
    downloadsCount: 540,
    submittedBy: "tabin.a@udm.edu.ph",
    dateAdded: "2026-02-05"
  },
  {
    researchID: "RES-CED-2025-002",
    title: "Dimensions of Personality Traits of Student-Athletes during the Covid-19 Pandemic towards an Enhanced Personality Development Program",
    abstract: "Collegiate student-athletes bear the dual burden of rigorous academic performance and competitive athletic conditioning. Utilizing the Big Five OCEAN personality model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), this study evaluated the psychological trait profiles of 50 UDM varsity student-athletes competing in the UAAP, ALCUAA, and NCAA tournaments. High conscientiousness and grit were correlated with academic endurance during disruptions, serving as the empirical baseline for an institutional athletic mentorship curriculum.",
    authors: [
      "B-jay V. Agudo",
      "Mark Anthony M. Bale\xF1a",
      "Jullius M. Arevalo",
      "Jireh Lyka M. Besmonte",
      "Paul Kristan C. Avillano",
      "John Recca B. Blas",
      "Ken Michael Balza",
      "Dr. Amalfi B. Tabin, Jr."
    ],
    keywords: ["Student-Athletes", "Big Five Personality", "Sports Psychology", "Endurance & Resilience", "UDM Athletics"],
    department: "CED",
    course: "Bachelor of Physical Education",
    year: 2025,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1noapA8cmgh4MmjZwDuV9XNDZGGdx80Vp/view",
    viewsCount: 2040,
    downloadsCount: 670,
    submittedBy: "agudo.b@udm.edu.ph",
    dateAdded: "2025-04-28"
  },
  {
    researchID: "RES-CED-2026-003",
    title: "Strengthening Early Childhood Education in Urban Communities: A Competency Assessment of Child Development Workers in Manila",
    abstract: "Early childhood development workers serve as the pedagogical bedrock of community-based daycare centers in urban districts. This research assessed the instructional, developmental screening, and parent engagement competencies of child development workers across Manila barangays. While workers demonstrated exemplary dedication and nurturing skills, significant training gaps were identified in handling neurodivergent learners, leading to a proposed UDM faculty-led continuing education certificate.",
    authors: [
      "Ronnie F. Sta. Maria",
      "Amalfi B. Tabin, Jr.",
      "Nelson M. De Leon"
    ],
    keywords: ["Early Childhood", "Daycare Workers", "Teacher Competencies", "Urban Education", "Early Learning Manila"],
    department: "CED",
    course: "Bachelor of Elementary Education",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view",
    viewsCount: 1450,
    downloadsCount: 430,
    submittedBy: "stamaria.r@udm.edu.ph",
    dateAdded: "2026-02-14"
  },
  {
    researchID: "RES-CED-2026-004",
    title: "Mixed Vertical Urban Gardening Using Ornamental and Fruit-Bearing Plants: Enhancing Environmental Quality and Community Engagement in Barangay 790, City of Manila",
    abstract: "Rapid urbanization and limited green spaces in Manila exacerbate the urban heat island effect and restrict household fresh produce access. This study designed and tested space-efficient mixed vertical gardening racks using recycled polyvinyl chloride (PVC) conduits and drip-irrigation systems in Barangay 790, City of Manila. Community post-surveys demonstrated a 40% increase in resident green practices and improved localized micro-climate indices.",
    authors: [
      "Vanessa Vargas-Martinez",
      "Evangeline L. Martinez",
      "Ricardo Reyes Jr.",
      "Nixon Nikko Maquirang",
      "Alistair B. Selorio"
    ],
    keywords: ["Urban Gardening", "Environmental Science", "Community Extension", "Barangay 790", "Sustainable Manila"],
    department: "CED",
    course: "Bachelor of Secondary Education",
    year: 2026,
    status: "approved",
    fullPdfUrl: "https://drive.google.com/file/d/1uodYGwmGjSbXhcxIPzLg5GfnxrlNZdHc/view",
    viewsCount: 1590,
    downloadsCount: 490,
    submittedBy: "martinez.v@udm.edu.ph",
    dateAdded: "2026-02-22"
  }
];

// src/data/mockDatabase.ts
var INITIAL_USERS = [
  {
    userID: "USR-UDM-001",
    name: "Juan Dela Cruz",
    email: "jdelacruz@udm.edu.ph",
    password: "Password123!",
    role: "student",
    userType: "Student",
    college: "CCS",
    course: "BS in Computer Science",
    readingHistory: ["RES-CCS-2024-001", "RES-CCS-2024-002", "RES-CBM-2024-001"]
  },
  {
    userID: "USR-UDM-002",
    name: "Prof. Maria Santos",
    email: "msantos@udm.edu.ph",
    password: "Password123!",
    role: "program_chair",
    userType: "Faculty",
    college: "CED",
    course: "Bachelor of Secondary Education",
    readingHistory: ["RES-CED-2024-001", "RES-CAS-2024-001"]
  },
  {
    userID: "USR-UDM-005",
    name: "Dr. Carmelo Perez",
    email: "cperez.dean@udm.edu.ph",
    password: "Password123!",
    role: "dean",
    userType: "Faculty",
    college: "CCS",
    course: "College of Computer Studies Dean",
    readingHistory: ["RES-CCS-2024-001", "RES-CCS-2024-002"]
  },
  {
    userID: "USR-UDM-006",
    name: "Mark Anthony Tan",
    email: "mtan.research@udm.edu.ph",
    password: "Password123!",
    role: "urelia_personnel",
    userType: "Faculty_Admin",
    college: "FAC-ADM",
    course: "URELIA Research Staff",
    readingHistory: ["RES-FAC-2025-003", "RES-ADM-2025-001"]
  },
  {
    userID: "USR-UDM-003",
    name: "Dr. Alejandro Reyes",
    email: "areyes.urelia@udm.edu.ph",
    password: "AdminPassword123!",
    role: "urelia_director",
    userType: "Faculty_Admin",
    college: "CPPG",
    course: "Director of URELIA",
    readingHistory: ["RES-CPPG-2024-001", "RES-CCJ-2024-001"]
  },
  {
    userID: "USR-UDM-004",
    name: "Engr. System Admin",
    email: "sysadmin@udm.edu.ph",
    password: "SuperAdmin123!",
    role: "urelia_admin",
    userType: "Faculty_Admin",
    college: "CCS",
    course: "BS in Information Technology",
    readingHistory: []
  }
];
var INITIAL_RESEARCH = [
  ...GDRIVE_RESEARCH_PAPERS,
  {
    researchID: "RES-CCS-2024-001",
    title: "An AI-Based Student Performance Prediction System for Universidad de Manila Using Machine Learning Algorithms",
    abstract: "This research paper investigates the application of machine learning classification models, specifically Random Forest and Support Vector Machines, to predict academic risk among undergraduate students at Universidad de Manila. By processing historical demographic data, attendance records, and mid-term grades across the seven colleges, the system achieved a 92.4% prediction accuracy. The findings provide the UDM Academic Affairs Office with actionable predictive analytics to deliver timely interventions for at-risk students.",
    authors: ["Juan Dela Cruz", "Mark Anthony Tan", "Dr. Elena Reyes"],
    keywords: ["Machine Learning", "Predictive Analytics", "Student Performance", "UDM Education", "Classifiers"],
    department: "CCS",
    course: "BS in Computer Science",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 342,
    downloadsCount: 128,
    submittedBy: "USR-UDM-001",
    dateAdded: "2024-03-15"
  },
  {
    researchID: "RES-CCS-2024-002",
    title: "Web-Based Automated Library Information Management System for UDM Main Library",
    abstract: "The main library of Universidad de Manila manages thousands of thesis archives and reference books manually. This study designed and developed a web-based automated library management system integrated with QR code verification and search indexing. Evaluated using the ISO/IEC 25010 software quality standards, the platform demonstrated exceptional usability, efficiency, and database response speeds under high concurrency.",
    authors: ["Kenneth Alcantara", "Rhea Mae Gomez"],
    keywords: ["Library Automation", "Web Architecture", "QR Verification", "ISO 25010", "Database Management"],
    department: "CCS",
    course: "BS in Information Technology",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 289,
    downloadsCount: 94,
    submittedBy: "USR-UDM-001",
    dateAdded: "2024-02-10"
  },
  {
    researchID: "RES-CBM-2024-001",
    title: "Digital Financial Literacy and Micro-Enterprise Resilience Among Manila Vendors Post-Pandemic",
    abstract: "Micro-entrepreneurs in the vicinity of Universidad de Manila and Santa Cruz facing economic recovery relied heavily on digital payment platforms such as GCash and PayMaya. This empirical study assesses the correlation between financial literacy levels and business resilience among 150 surveyed MSME owners in Manila. Statistical regression revealed that adoption of digital accounting tools significantly increased monthly revenue stability.",
    authors: ["Patricia Mae Ramos", "Prof. Roberto Garcia"],
    keywords: ["Financial Literacy", "MSME Resilience", "Digital Payments", "Manila Economy", "CBM Research"],
    department: "CBM",
    course: "BS in Business Administration",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 215,
    downloadsCount: 81,
    submittedBy: "USR-UDM-002",
    dateAdded: "2024-01-20"
  },
  {
    researchID: "RES-CAS-2024-001",
    title: "Psychological Well-Being and Academic Stress Coping Mechanisms Among UDM Working Students",
    abstract: "Working students balance rigorous academic requirements and employment obligations. Utilizing a mixed-method research design, this study examines stress factors, emotional burnout, and coping strategies among 200 working undergraduate students across Universidad de Manila. Results highlight the vital role of institutional peer support groups and flexible academic scheduling in fostering psychological resilience.",
    authors: ["Sophia Loren Miranda", "Dr. Beatrice Villanueva"],
    keywords: ["Psychological Well-Being", "Working Students", "Academic Stress", "Coping Mechanisms", "UDM CAS"],
    department: "CAS",
    course: "BS in Psychology",
    year: 2023,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 198,
    downloadsCount: 62,
    submittedBy: "USR-UDM-002",
    dateAdded: "2023-11-05"
  },
  {
    researchID: "RES-CPPG-2024-001",
    title: "Policy Evaluation of Local Government Urban Infrastructure Projects in the City of Manila",
    abstract: "Effective governance requires rigorous post-implementation policy evaluation. This research analyzes public satisfaction and socioeconomic impact of recent Manila LGU infrastructure initiatives, including park revitalizations and barangay digital hubs. Using governance metrics and stakeholder interviews, the paper recommends policy frameworks for sustainable urban development in historical Manila districts.",
    authors: ["Gabriel Mendoza", "Atty. Fernando Castro"],
    keywords: ["Public Policy", "Urban Infrastructure", "Manila LGU", "Governance Framework", "CPPG Research"],
    department: "CPPG",
    course: "BS in Public Administration",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 175,
    downloadsCount: 45,
    submittedBy: "USR-UDM-003",
    dateAdded: "2024-04-12"
  },
  {
    researchID: "RES-CHS-2024-001",
    title: "Community Hygiene Awareness and Nursing Intervention Effectiveness in Manila Barangay Health Centers",
    abstract: "Community nursing interventions play a critical role in preventive public health. This field research conducted by UDM College of Health Sciences evaluates community hygiene awareness campaigns across selected Manila barangays. Statistical analysis showed a 38% decrease in water-borne infection cases following structured student-led health education workshops.",
    authors: ["Angelica Diaz", "Nurse Supervisor Clarissa Ocampo"],
    keywords: ["Community Nursing", "Public Health", "Hygiene Awareness", "Manila Health", "CHS Intervention"],
    department: "CHS",
    course: "BS in Nursing",
    year: 2023,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 160,
    downloadsCount: 53,
    submittedBy: "USR-UDM-002",
    dateAdded: "2023-09-18"
  },
  {
    researchID: "RES-CED-2024-001",
    title: "Efficacy of Hybrid Learning Modules in Public High Schools: Pedagogical Perspectives from UDM Student Teachers",
    abstract: "Transitioning into post-pandemic education necessitated flexible hybrid teaching methodologies. This research evaluates the pedagogical effectiveness of blended learning modules deployed by UDM practice teachers in Manila public secondary schools. Results indicate that interactive digital workbooks significantly improved student engagement and quiz scores compared to traditional static worksheets.",
    authors: ["Prof. Maria Santos", "Joshua Fernandez"],
    keywords: ["Hybrid Learning", "Pedagogy", "Student Teaching", "Secondary Education", "CED Modules"],
    department: "CED",
    course: "Bachelor of Secondary Education",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 230,
    downloadsCount: 88,
    submittedBy: "USR-UDM-002",
    dateAdded: "2024-02-28"
  },
  {
    researchID: "RES-CCJ-2024-001",
    title: "Cybercrime Awareness and Incident Reporting Preparedness Among Barangay Officials in Manila",
    abstract: "With the proliferation of online scams and identity theft, local barangay leadership serves as the initial line of community assistance. This study assesses cybercrime awareness, digital forensics understanding, and incident response readiness among 80 barangay officials in Manila. The research presents a standardized preliminary cybercrime reporting protocol for local officers.",
    authors: ["Criminologist Ronald Navarro", "Capt. Vicente Morales"],
    keywords: ["Cybercrime", "Digital Forensics", "Barangay Preparedness", "Crime Prevention", "CCJ Research"],
    department: "CCJ",
    course: "BS in Criminology",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 310,
    downloadsCount: 112,
    submittedBy: "USR-UDM-003",
    dateAdded: "2024-03-01",
    authorCategory: "Student"
  },
  // ==========================================
  // FACULTY & ADMINISTRATIVE RESEARCH (FAC-ADM)
  // ==========================================
  {
    researchID: "RES-FAC-2025-001",
    title: "Empirical Assessment of Thesis Mentorship Paradigms and Research Self-Efficacy Among Undergraduate Scholars in Universidad de Manila",
    abstract: "Undergraduate capstone research represents a pivotal milestone in academic degree completion. This faculty-authored empirical investigation evaluates the direct impact of structured thesis mentorship frameworks, milestone-based literature reviews, and institutional ethics review workshops on student research self-efficacy across 450 UDM students. Quantitative regression analysis reveals that faculty scaffolding during Chapter 1 and Chapter 3 conceptualization reduces research anxiety by 41.8% and accelerates proposal defense readiness. The paper provides undergraduate researchers with verified literature review strategies and defense preparation templates.",
    authors: ["Dr. Maria Victoria Santos", "Prof. Ramon Hernandez", "Dr. Carmelita Reyes"],
    keywords: ["Thesis Mentorship", "Research Methodology", "Undergraduate Research", "Academic Self-Efficacy", "Higher Education Pedagogy"],
    department: "FAC-ADM",
    course: "Faculty Pedagogical & Instructional Studies",
    year: 2025,
    status: "approved",
    publicationType: "published",
    viewsCount: 520,
    downloadsCount: 215,
    submittedBy: "USR-UDM-002",
    dateAdded: "2025-02-14",
    authorCategory: "Faculty_Admin"
  },
  {
    researchID: "RES-FAC-2026-002",
    title: "Aligning Higher Education Capstone Projects with the United Nations Sustainable Development Goals (SDGs): A Faculty Resource Guide and Evaluation Matrix",
    abstract: "Academic institutions bear a fundamental responsibility to align student scholarship with pressing societal, economic, and environmental imperatives. This faculty publication presents a standardized curriculum matrix designed for UDM undergraduate and graduate researchers to map thesis outputs directly to UN SDGs\u2014predominantly SDG 4 (Quality Education), SDG 9 (Industry, Innovation & Infrastructure), and SDG 11 (Sustainable Cities). Includes benchmark rubrics, qualitative assessment criteria, and empirical case studies from recent UDM technological and policy innovations.",
    authors: ["Prof. Vincent Visitacion", "Dr. Alejandro Reyes", "Prof. Danilo Cruz"],
    keywords: ["UN SDGs", "Capstone Guidelines", "Sustainable Cities", "Evaluation Rubrics", "Curriculum Innovation"],
    department: "FAC-ADM",
    course: "Higher Education Curriculum Innovations",
    year: 2026,
    status: "approved",
    publicationType: "published",
    viewsCount: 680,
    downloadsCount: 310,
    submittedBy: "USR-UDM-002",
    dateAdded: "2026-01-20",
    authorCategory: "Faculty_Admin"
  },
  {
    researchID: "RES-FAC-2025-003",
    title: "Academic Integrity and Responsible Generative AI Integration in University Research: A Practical Protocol for Students and Mentors",
    abstract: "The rapid emergence of Generative Artificial Intelligence (GenAI) and Large Language Models necessitates clear institutional frameworks distinguishing ethical research augmentation from academic malpractice. This multidisciplinary faculty study examines ethical AI utilization protocols, prompt transparency standards, citation methodologies for AI-generated artifacts, and empirical plagiarism detection thresholds. Provides students with clear operational boundaries for using AI in coding, exploratory literature review, and statistical synthesis.",
    authors: ["Dr. Elena Reyes", "Prof. Roberto Alcantara", "Dr. Teresa Morales"],
    keywords: ["Generative AI", "Academic Integrity", "Research Ethics", "Citation Standards", "AI Guidelines"],
    department: "FAC-ADM",
    course: "Multidisciplinary Faculty Publications",
    year: 2025,
    status: "approved",
    publicationType: "published",
    viewsCount: 890,
    downloadsCount: 440,
    submittedBy: "USR-UDM-002",
    dateAdded: "2025-04-10",
    authorCategory: "Faculty_Admin"
  },
  {
    researchID: "RES-ADM-2025-001",
    title: "Universidad de Manila Institutional Tracer Study: Five-Year Longitudinal Analysis of Graduate Employability, Licensure Performance, and Industry Skill Alignment",
    abstract: "Conducted by the UDM Administration in coordination with the Office of the Vice President for Academic Affairs (OVPAA) and URELIA, this comprehensive institutional tracer study surveys 3,840 alumni from graduation batches 2020 through 2024 across all degree programs. Highlights include an 88.6% employment rate within six months of graduation, national licensure passing rates exceeding Philippine national averages, and key employer feedback identifying in-demand technical competencies. Offers student researchers invaluable baseline demographic datasets and industry trends for Manila-based studies.",
    authors: ["Office of the Vice President for Academic Affairs (OVPAA)", "URELIA Research & Extension Directorate"],
    keywords: ["Graduate Tracer Study", "Employability Metrics", "Institutional Quality Assurance", "Alumni Outcomes", "Manila Workforce"],
    department: "FAC-ADM",
    course: "Institutional Quality Assurance (IQA)",
    year: 2025,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 740,
    downloadsCount: 290,
    submittedBy: "USR-UDM-003",
    dateAdded: "2025-03-01",
    authorCategory: "Faculty_Admin"
  },
  {
    researchID: "RES-ADM-2026-002",
    title: "Smart City Manila Urban Governance and Collaborative University-LGU Research Agenda (2024\u20132028)",
    abstract: "Commissioned by the Universidad de Manila University Administration in official partnership with the City of Manila Mayor's Office and the Manila City Planning and Development Office (CPDO), this institutional policy paper delineates the city-university research roadmap. Details municipal priorities in flood mitigation telemetry, smart traffic signaling, digital barangay frontline services, and community health monitoring across Manila's six legislative districts. Serves as a vital guide for student researchers seeking research topics with direct City Hall grant funding and practical local deployment avenues.",
    authors: ["UDM University Administration", "Manila City Planning & Development Office (CPDO)"],
    keywords: ["Smart City Manila", "LGU Research Agenda", "Urban Governance", "University-City Partnership", "Public Administration"],
    department: "FAC-ADM",
    course: "Manila City LGU Policy Collaborations",
    year: 2026,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 920,
    downloadsCount: 380,
    submittedBy: "USR-UDM-003",
    dateAdded: "2026-02-18",
    authorCategory: "Faculty_Admin"
  },
  {
    researchID: "RES-ADM-2024-003",
    title: "URELIA Institutional Research and Ethics Review Manual: Standardized Protocols for Student Theses and Faculty Publications",
    abstract: "The official university administrative protocol manual published by the URELIA Office. Sets forth comprehensive institutional guidelines governing ethics review board (IRB) clearance, informed consent requirements for human subjects in Manila barangays, intellectual property and copyright registration at the Intellectual Property Office of the Philippines (IPOPHL), and digital archiving procedures on the UDM-ResearchHub portal. Essential reading for every student preparing their manuscript submission.",
    authors: ["URELIA Evaluation Committee", "University Academic Council"],
    keywords: ["URELIA Manual", "Ethics Protocols", "Intellectual Property", "IRB Clearance", "University Research Standards"],
    department: "FAC-ADM",
    course: "URELIA Research & Extension Studies",
    year: 2024,
    status: "approved",
    publicationType: "unpublished",
    viewsCount: 1150,
    downloadsCount: 520,
    submittedBy: "USR-UDM-003",
    dateAdded: "2024-01-15",
    authorCategory: "Faculty_Admin"
  }
];
var INITIAL_SUBMISSIONS = [
  {
    submissionID: "SUB-2026-001",
    submittedBy: "USR-UDM-001",
    submitterName: "Juan Dela Cruz",
    submitterEmail: "jdelacruz@udm.edu.ph",
    researchID: "RES-PENDING-001",
    title: "IoT-Based Water Level Monitoring System for Flood Prevention along Pasig River Manila",
    abstract: "Manila experiences seasonal urban flooding caused by overflowing waterways. This paper introduces a low-cost Internet of Things (IoT) ultrasonic water level sensor array connected via LoRaWAN technology. Real-time telemetry data is broadcast to an emergency alerting dashboard for barangay disaster risk management councils.",
    authors: ["Juan Dela Cruz", "Rhea Mae Gomez"],
    keywords: ["IoT Sensors", "Pasig River Flood", "LoRaWAN", "Disaster Response", "Manila LGU"],
    department: "CCS",
    course: "BS in Computer Science",
    year: 2026,
    dateSubmitted: "2026-07-28",
    status: "pending",
    pdfFileName: "pasig_river_iot_flood_monitoring.pdf"
  },
  {
    submissionID: "SUB-2026-002",
    submittedBy: "USR-UDM-002",
    submitterName: "Prof. Maria Santos",
    submitterEmail: "msantos@udm.edu.ph",
    researchID: "RES-PENDING-002",
    title: "Assessment of In-Service Teacher Training Programs in Special Needs Education in Manila City",
    abstract: "Inclusive education requires continuous professional development for public school teachers. This study examines current special needs education (SNED) training modules provided across Manila district schools and identifies critical gaps in assistive technology training.",
    authors: ["Prof. Maria Santos", "Dr. Beatrice Villanueva"],
    keywords: ["Special Education", "SNED Training", "Inclusive Education", "Pedagogy", "CED Research"],
    department: "CED",
    course: "Bachelor of Elementary Education",
    year: 2026,
    dateSubmitted: "2026-07-30",
    status: "pending",
    pdfFileName: "sned_teacher_training_assessment.pdf"
  }
];
var INITIAL_SYSTEM_SETTINGS = {
  allowedDomains: ["udm.edu.ph", "pau.udm.edu.ph", "gmail.com"],
  maxPdfUploadMb: 100,
  requireAdminApproval: true,
  enableMlRecommendations: true,
  tfIdfTopKeywordsCount: 10,
  collaborativeWeight: 0.4,
  contentBasedWeight: 0.6
};

// src/types.ts
var UDM_COLLEGES = [
  {
    id: "CBM",
    name: "College of Business Management",
    courses: ["BS in Business Administration", "BS in Accountancy", "BS in Real Estate Management", "BS in Hospitality Management"],
    unitType: "College"
  },
  {
    id: "CAS",
    name: "College of Arts and Sciences",
    courses: ["BS in Psychology", "BS in Mathematics", "BA in Communication", "BS in Social Work"],
    unitType: "College"
  },
  {
    id: "CPPG",
    name: "College of Public Policy and Governance",
    courses: ["BS in Public Administration", "BA in Political Science"],
    unitType: "College"
  },
  {
    id: "CCS",
    name: "College of Computer Studies",
    courses: ["BS in Computer Science", "BS in Information Technology"],
    unitType: "College"
  },
  {
    id: "CHS",
    name: "College of Health Sciences",
    courses: ["BS in Nursing", "BS in Physical Therapy"],
    unitType: "College"
  },
  {
    id: "CED",
    name: "College of Education",
    courses: ["Bachelor of Secondary Education", "Bachelor of Elementary Education", "Bachelor of Physical Education"],
    unitType: "College"
  },
  {
    id: "CCJ",
    name: "College of Criminology and Justice",
    courses: ["BS in Criminology"],
    unitType: "College"
  },
  {
    id: "FAC-ADM",
    name: "Faculty & Administrative Institutional Research",
    courses: [
      "Faculty Pedagogical & Instructional Studies",
      "Institutional Quality Assurance (IQA) & Tracer Studies",
      "Multidisciplinary Faculty Publications & Professorial Research",
      "University Strategic Governance & Manila LGU Collaborations",
      "URELIA Research & Extension Studies"
    ],
    unitType: "Faculty & Administration",
    description: "Peer-reviewed studies, institutional frameworks, and policy research authored by UDM faculty professors & university administration"
  }
];

// src/utils/mlEngine.ts
var STOPWORDS = /* @__PURE__ */ new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves"
]);
function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}
function getResearchTokens(research) {
  const titleTokens = tokenize(research.title);
  const abstractTokens = tokenize(research.abstract);
  const keywordTokens = (research.keywords || []).flatMap((k) => tokenize(k));
  const authorTokens = (research.authors || []).flatMap((a) => tokenize(a));
  const deptTokens = tokenize(research.department || "");
  const courseTokens = tokenize(research.course || "");
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
function calculateIDF(corpusTokens) {
  const docCount = corpusTokens.length;
  if (docCount === 0) return {};
  const docFreq = {};
  for (const doc of corpusTokens) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      docFreq[term] = (docFreq[term] || 0) + 1;
    }
  }
  const idf = {};
  for (const [term, freq] of Object.entries(docFreq)) {
    idf[term] = Math.log((docCount + 1) / (freq + 1)) + 1;
  }
  return idf;
}
function calculateTF(tokens) {
  const tf = {};
  if (tokens.length === 0) return tf;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token of Object.keys(tf)) {
    tf[token] = tf[token] / tokens.length;
  }
  return tf;
}
function scoreSearchRelevance(query, research, idf) {
  const rawQuery = (query || "").trim();
  if (!rawQuery) return 1;
  const queryLower = rawQuery.toLowerCase();
  const queryTokens = tokenize(rawQuery);
  const effectiveTokens = queryTokens.length > 0 ? queryTokens : [queryLower];
  const docTokens = getResearchTokens(research);
  const tf = calculateTF(docTokens);
  let rawScore = 0;
  let matches = 0;
  const titleLower = (research.title || "").toLowerCase();
  const abstractLower = (research.abstract || "").toLowerCase();
  const keywordsArray = (research.keywords || []).map((k) => k.toLowerCase());
  const keywordsLower = keywordsArray.join(" ");
  const authorsArray = (research.authors || []).map((a) => a.toLowerCase());
  const authorsLower = authorsArray.join(" ");
  const courseLower = (research.course || "").toLowerCase();
  const deptLower = (research.department || "").toLowerCase();
  const collegeObj = UDM_COLLEGES.find((c) => c.id === research.department);
  const collegeNameLower = (collegeObj?.name || "").toLowerCase();
  if (titleLower.includes(queryLower)) {
    rawScore += 12;
    matches++;
  }
  if (authorsArray.some((a) => a.includes(queryLower)) || authorsLower.includes(queryLower)) {
    rawScore += 12;
    matches++;
  }
  if (keywordsArray.some((k) => k.includes(queryLower)) || keywordsLower.includes(queryLower)) {
    rawScore += 10;
    matches++;
  }
  if (courseLower.includes(queryLower) || collegeNameLower.includes(queryLower)) {
    rawScore += 8;
    matches++;
  }
  if (deptLower === queryLower || queryLower.includes(deptLower)) {
    rawScore += 6;
    matches++;
  }
  if (abstractLower.includes(queryLower)) {
    rawScore += 4;
    matches++;
  }
  for (const qToken of effectiveTokens) {
    const tokenTf = tf[qToken] || 0;
    const tokenIdf = idf[qToken] || 1.5;
    let tokenMatched = false;
    if (tokenTf > 0) {
      tokenMatched = true;
      rawScore += tokenTf * tokenIdf * 2;
    }
    if (titleLower.includes(qToken)) {
      rawScore += 3.5;
      tokenMatched = true;
    }
    if (authorsLower.includes(qToken)) {
      rawScore += 4;
      tokenMatched = true;
    }
    if (keywordsLower.includes(qToken)) {
      rawScore += 3;
      tokenMatched = true;
    }
    if (courseLower.includes(qToken) || collegeNameLower.includes(qToken)) {
      rawScore += 2.5;
      tokenMatched = true;
    }
    if (abstractLower.includes(qToken)) {
      rawScore += 1;
      tokenMatched = true;
    }
    if (deptLower === qToken || deptLower.includes(qToken)) {
      rawScore += 3;
      tokenMatched = true;
    }
    if (tokenMatched) {
      matches++;
    }
  }
  if (effectiveTokens.length > 1) {
    const matchedCount = effectiveTokens.filter(
      (t) => titleLower.includes(t) || authorsLower.includes(t) || keywordsLower.includes(t) || courseLower.includes(t) || collegeNameLower.includes(t) || abstractLower.includes(t) || deptLower.includes(t)
    ).length;
    if (matchedCount === 0 && !titleLower.includes(queryLower) && !authorsLower.includes(queryLower) && !keywordsLower.includes(queryLower)) {
      return 0;
    }
    rawScore = rawScore * (matchedCount / effectiveTokens.length);
  }
  if (matches === 0 && rawScore === 0) {
    return 0;
  }
  const normalized = Math.min(100, Math.round(rawScore / (effectiveTokens.length * 3) * 100));
  return Math.max(1, normalized);
}
function generateHybridRecommendations(user, allUsers, allResearch, contentWeight = 0.6, collabWeight = 0.4) {
  const approvedPapers = allResearch.filter((r) => r.status === "approved" || !r.status);
  if (approvedPapers.length === 0) return [];
  const userReadHistory = new Set(user.readingHistory || []);
  const scores = [];
  const userCollege = user.college || "CCS";
  const userCourse = user.course || "";
  const historyPapers = approvedPapers.filter((r) => userReadHistory.has(r.researchID));
  const preferredKeywords = /* @__PURE__ */ new Set();
  for (const p of historyPapers) {
    for (const kw of p.keywords || []) {
      preferredKeywords.add(kw.toLowerCase());
    }
  }
  const peers = allUsers.filter((u) => u.userID !== user.userID && (u.college === userCollege || u.course === userCourse));
  const peerReadCounts = {};
  for (const peer of peers) {
    for (const paperId of peer.readingHistory || []) {
      peerReadCounts[paperId] = (peerReadCounts[paperId] || 0) + 1;
    }
  }
  for (const paper of approvedPapers) {
    const isUnread = !userReadHistory.has(paper.researchID);
    const matchReasons = [];
    let contentScore = 0;
    if (paper.department === userCollege) {
      contentScore += 45;
      matchReasons.push(`Official ${userCollege} Curriculum`);
    }
    if (userCourse && paper.course && (paper.course.includes(userCourse) || userCourse.includes(paper.course))) {
      contentScore += 25;
      matchReasons.push(`Direct match for ${userCourse}`);
    }
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
    const popularityBonus = Math.min(10, (paper.viewsCount || 0) * 0.1 + (paper.downloadsCount || 0) * 0.5);
    contentScore += popularityBonus;
    contentScore = Math.min(100, contentScore);
    let collabScore = 0;
    const peerReads = peerReadCounts[paper.researchID] || 0;
    if (peerReads > 0) {
      collabScore = Math.min(100, peerReads * 30 + 20);
      matchReasons.push(`Trending among ${userCollege} peers and faculty`);
    } else {
      collabScore = Math.min(50, (paper.viewsCount || 0) * 2);
    }
    let hybridScore = Math.round(contentScore * contentWeight + collabScore * collabWeight);
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
      matchedKeywords: paper.keywords && paper.keywords.length > 0 ? paper.keywords : [paper.department, "Academic Research"],
      matchReasons: Array.from(new Set(matchReasons)),
      contentScore
    });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

// src/utils/researchAiAssistant.ts
var generateContextualAcademicAnswer = (param1, param2) => {
  const paper = typeof param1 === "object" && param1 !== null ? param1 : param2;
  const query = typeof param1 === "string" ? param1 : typeof param2 === "string" ? param2 : "";
  const q = query.toLowerCase();
  const isTagalog = q.includes("ano") || q.includes("paano") || q.includes("bakit") || q.includes("suliranin") || q.includes("solusyon") || q.includes("maynila") || q.includes("pananaliksik") || q.includes("tagalog");
  const title = paper.title;
  const dept = paper.department;
  const course = paper.course;
  const year = paper.year;
  const authorsList = paper.authors.join(", ");
  const keywordsList = paper.keywords.join(", ");
  const sentences = paper.abstract.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (q.includes("maynila") || q.includes("manila") || q.includes("udm") || q.includes("aplikasyon") || q.includes("application") || q.includes("impact") || q.includes("lungsod") || q.includes("barangay")) {
    if (isTagalog) {
      return `Magandang araw! Narito ang komprehensibong pagsusuri kung paano maiaaplay ang pananaliksik na **"${title}"** sa Lungsod ng Maynila at sa Universidad de Manila (UDM):

### Aplikasyon sa Lungsod ng Maynila (City of Manila)
\u2022 **Direktang Pagpapatupad sa Sektor:** Ang pag-aaral na ito sa ilalim ng ${dept} (${course}) ay nagbibigay ng agarang solusyon sa mga totoong hamon sa Maynila. ` + (sentences[1] ? `Partikular, ${sentences[1]} ` : "") + `Maaari itong ipatupad sa mga lokal na barangay, tanggapan ng pamahalaang lungsod, at mga kaugnay na ahensya upang gawing mas mabilis, makabago, at organisado ang pampublikong serbisyo.
\u2022 **Polisiya at Pamamahala (Policy Formulations):** Nagsisilbi itong siyentipikong basehan para sa Manila City Council sa pagbalangkas ng mga ordinansa at programang may kinalaman sa ${keywordsList}.
\u2022 **Kapakanan ng Mamamayan:** Direktang nakatutulong ang output nito sa pagpapababa ng mga panganib, pagpapataas ng kaligtasan, at pagbibigay ng pantay na oportunidad sa mga Manile\xF1o.

### Aplikasyon sa Universidad de Manila (UDM Ecosystem)
\u2022 **Akademikong Pamantayan:** Pinatutunayan nito ang mataas na kalidad ng institutional research sa ${dept}, na nagbibigay-karangalan sa pamantasan bilang sentro ng localized academic excellence.
\u2022 **Gabay sa Susunod na Mag-aaral:** Nagsisilbing matibay na reference para sa mga estudyanteng gagawa ng kanilang sariling capstone o thesis sa kurikulum ng ${course}.
\u2022 **Interdisiplinaryong Kolaborasyon:** Maaaring pag-ugnayin ang resulta nito sa iba pang mga kolehiyo sa UDM upang makabuo ng mas malawak na solusyon para sa unibersidad.`;
    } else {
      return `Practical application and strategic impact of **"${title}"** for the City of Manila and Universidad de Manila:

### Civic & Municipal Impact for the City of Manila
\u2022 **Public Policy & Operational Integration:** Authored under ${dept} (${course}), this research provides actionable, evidence-based recommendations tailored for Manila's municipal landscape. ` + (sentences[1] ? `Specifically, ${sentences[1]} ` : "") + `City departments and local barangays can adopt this framework to modernize operational procedures, elevate public service standards, and enhance civic safety.
\u2022 **Evidence-Based Governance:** Supplies local authorities with empirical baseline data regarding ${keywordsList}, supporting informed resource allocation and municipal ordinance planning.
\u2022 **Socio-Economic Value:** Directly addresses urban inefficiencies, providing tangible improvements in transparency, responsiveness, and community welfare across Manila districts.

### Institutional Value for Universidad de Manila (UDM)
\u2022 **Curricular Benchmark:** Elevates the academic footprint of ${dept} by demonstrating rigorous empirical scholarship addressing capital city challenges.
\u2022 **Capstone Reference Framework:** Provides incoming ${course} undergraduate and graduate researchers with a verified foundational reference model.
\u2022 **Institutional Extension:** Fulfills URELIA's mission of transforming university research into practical, community-oriented social solutions.`;
    }
  }
  if (q.includes("methodolog") || q.includes("algorithm") || q.includes("metodolohiya") || q.includes("core") || q.includes("approach") || q.includes("paraan") || q.includes("pamamaraan") || q.includes("disenyo") || q.includes("framework") || q.includes("testing")) {
    if (isTagalog) {
      return `Narito ang detalyadong pagtalakay sa **Metodolohiya, Disenyo, at Algoritmo** ng pananaliksik na **"${title}"**:

### Disenyo ng Pananaliksik (Research Design)
\u2022 **Akademikong Balangkas:** Ang pag-aaral ay isinagawa alinsunod sa pamantayan ng ${dept} gamit ang sistematikong empirical at descriptive-analytical research approach.
\u2022 **Pangunahing Metodo:** ` + (sentences[1] || `Kinalap at sinuri ang mga datos batay sa mga prinsipyo ng ${keywordsList}.`) + `

### Mga Algoritmo at Teknikal na Sangkap (Algorithms & Tools)
\u2022 **Arkitektura at Teknolohiya:** Nakatuon ang pamamaraan sa pagpapatupad ng mga solusyon kaugnay ng: ${keywordsList}.
\u2022 **Pagsusuri ng Datos:** Sumailalim ang mga nakalap na resulta sa mahigpit na statistical validation at operational feasibility metrics upang masigurong reproducible at balido ang mga konklusyon.

### Instrumentasyon at Ebalwasyon
\u2022 ` + (sentences[2] || `Ipinakita sa ebalwasyon ang mataas na antas ng katumpakan at bisa ng modelo alinsunod sa mga itinakdang pamantayan ng URELIA evaluation committee.`) + `

*Para sa kompletong code snippets, schematics, o statistical survey questionnaires, maaari kang magsumite ng Full Paper Access Request sa URELIA Office.*`;
    } else {
      return `Core methodologies, analytical frameworks, and algorithmic architecture of **"${title}"**:

### Research Methodology & Study Design
\u2022 **Empirical Investigation Model:** Conducted under the ${dept} (${course}) academic framework, utilizing rigorous methodological controls and domain-specific analytical standards.
\u2022 **Methodological Execution:** ` + (sentences[1] || `The authors systematically gathered and evaluated operational metrics covering ${keywordsList}.`) + `

### Computational, Algorithmic & Analytical Components
\u2022 **Core Domain Concepts:** Integrates specialized protocols centered on: **${keywordsList}**.
\u2022 **Data Processing & Protocols:** Applied structured data pipelines, comparative benchmarking, and quantitative evaluation to ensure statistical validity and operational repeatability.

### Validation & Operational Outcomes
\u2022 **Empirical Verification:** ` + (sentences[2] || `Results validate the proposed framework with measurable statistical accuracy and documented performance gains.`) + `

*Researchers requiring complete mathematical formulations, system schematics, or full raw datasets may request full access through the URELIA Reader.*`;
    }
  }
  if (q.includes("gap") || q.includes("future") || q.includes("direksyon") || q.includes("kasunod") || q.includes("direction") || q.includes("rekomendasyon") || q.includes("thesis") || q.includes("opportunity")) {
    if (isTagalog) {
      return `Narito ang mga natukoy na **Research Gaps at mga Direksyon sa Hinaharap** batay sa **"${title}"**:

### Mga Limitasyon at Research Gaps ng Kasalukuyang Pag-aaral
1. **Heograpikal at Saklaw na Limitasyon:** Nakatuon ang kasalukuyang sakop ng pag-aaral sa partikular na pilot testing area sa Maynila. May puwang upang palawakin ang pagsusuri sa lahat ng distrito ng lungsod.
2. **Lalim ng Longitudinal Data:** Kinakailangan pa ang mas matagalang pagsubaybay sa epekto ng sistema sa loob ng 1 hanggang 3 taon upang masukat ang pangmatagalang bisa nito.
3. **Pagsasama ng Makabagong AI / Automation:** May pagkakataon pang isama ang real-time predictive modeling o edge-AI algorithms sa mga susunod na bersyon.

### Tatlong (3) Panukalang Capstone / Thesis Para sa mga Mag-aaral ng UDM
\u2022 **Idea 1 (Scalability):** Palawakin ang framework ng ${title} upang sumakop sa broader urban districts ng Maynila gamit ang cloud-native architecture.
\u2022 **Idea 2 (Machine Learning Integration):** Magdagdag ng predictive machine learning models para sa automated risk detection na may kaugnayan sa ${keywordsList}.
\u2022 **Idea 3 (Citizen-Centric Mobile Interface):** Gumawa ng real-time mobile app para sa publiko at barangay officials na may multilingual Tagalog/English support.`;
    } else {
      return `Research gaps, academic limitations, and future thesis opportunities derived from **"${title}"**:

### Identified Research Gaps & Constraints
1. **Sample Scope & Geographic Constraints:** The study evaluates designated local clusters within Manila. Significant opportunity exists to scale the empirical assessment across diverse demographic districts.
2. **Longitudinal Impact Validation:** Current findings capture immediate and medium-term indicators; multi-year longitudinal monitoring would further substantiate policy durability.
3. **Automated Interoperability:** Future iterations could incorporate real-time automated APIs, mobile telematics, and cross-agency data synchronization.

### Recommended Thesis & Capstone Extensions for UDM Scholars
\u2022 **Extension Track 1 (Multi-Site Empirical Deployment):** Expand the evaluation parameters to include multi-institutional comparative analysis across NCR municipal ecosystems.
\u2022 **Extension Track 2 (Machine Learning & Predictive Modeling):** Enhance the underlying algorithms with adaptive AI inference models targeting ${keywordsList}.
\u2022 **Extension Track 3 (Policy & Cloud Architecture Integration):** Develop an open-standard, secure cloud telemetry dashboard tailored for City of Manila administrators and UDM researchers.`;
    }
  }
  if (q.includes("suliranin") || q.includes("solusyon") || q.includes("problem") || q.includes("solution") || q.includes("layunin") || q.includes("objective") || q.includes("hamon")) {
    if (isTagalog) {
      return `Narito ang malinaw na paghimay sa **Suliranin at Solusyon** ng pananaliksik na **"${title}"** nina ${authorsList} (${year}):

### 1. Pangunahing Suliranin (Core Problem)
\u2022 **Ang Hamon:** ` + (sentences[0] || `Tinutugunan ng pag-aaral ang mga kakulangan at operational delays sa larangan ng ${course || dept}.`) + `
\u2022 **Bakit Kailangang Lutasin:** Ang kawalan ng isang sistematiko at maaasahang pamamaraan ay nagdudulot ng patuloy na pag-aaksaya ng oras, pondo, at lakas-tao sa sektor na ito sa Lungsod ng Maynila.

### 2. Ipinapanukalang Solusyon (Proposed Innovation)
\u2022 **Ang Solusyon:** ` + (sentences[1] || `Iminungkahi ng mga mananaliksik ang pagpapatupad ng komprehensibong mekanismo gamit ang ${keywordsList}.`) + `
\u2022 **Teknikal na Katangian:** Isinama sa solusyon ang standardisadong proseso upang gawing mas mabilis, tumpak, at accessible ang serbisyo para sa mga kaukulang ahensya at mamamayan.

### 3. Inaasahang Epekto at Bunga (Impact & Results)
\u2022 ` + (sentences[2] || `Nagbunga ang pag-aaral ng makabuluhang pagbuti sa operational efficiency at nagbigay ng matatag na modelo para sa Universidad de Manila.`) + `
\u2022 Nagbibigay ito ng malinaw na gabay sa mga stakeholder upang masigurong napapakinabangan ang resulta ng pagsasaliksik sa pang-araw-araw na operasyon.`;
    } else {
      return `Comprehensive problem-solution breakdown for **"${title}"** authored by ${authorsList} (${dept}, ${year}):

### 1. Primary Problem Statement
\u2022 **Core Challenge:** ` + (sentences[0] || `Addresses fundamental systemic and technical inefficiencies within ${course || dept}.`) + `
\u2022 **Institutional Impact:** Conventional, manual, or disjointed legacy mechanisms resulted in recurring delays, higher operational expenditures, and vulnerability to human error.

### 2. Proposed Technical & Academic Solution
\u2022 **Methodological Innovation:** ` + (sentences[1] || `The authors engineered a structured, evidence-based solution leveraging ${keywordsList}.`) + `
\u2022 **System Attributes:** Enforces rigorous coordination protocols, automated auditing, and transparent tracking to guarantee reliable execution in practical deployments.

### 3. Validated Outcomes & Empirical Significance
\u2022 ` + (sentences[2] || `Demonstrates measurable qualitative and quantitative performance improvements compared to legacy practices.`) + `
\u2022 Supplies actionable intelligence directly usable by institutional and municipal decision-makers in Manila.`;
    }
  }
  if (isTagalog) {
    return `Salamat sa iyong pagsusuri sa pananaliksik na **"${title}"** nina ${authorsList} (${dept}, ${year}):

### Buod ng Pag-aaral (Study Overview)
Ang proyektong ito ay nakasentro sa mga pangunahing konsepto ng **${keywordsList}**.

\u2022 **Panimula at Konteksto:** ` + (sentences[0] || `Isinagawa ang pag-aaral upang tugunan ang mahalagang pangangailangan sa ${course}.`) + `
\u2022 **Metodolohikal na Pagsusuri:** ` + (sentences[1] || `Ginamit ng mga mananaliksik ang angkop na scientific frameworks at standardized testing protocols.`) + `
\u2022 **Mahalagang Natuklasan:** ` + (sentences[2] || `Nagpapakita ang resulta ng positibong ambag sa kaalaman at praktikal na aplikasyon para sa Universidad de Manila.`) + `

Maaari kang mag-iwan ng karagdagang tanong ukol sa **suliranin at solusyon**, **metodolohiya**, **aplikasyon sa Maynila**, o **mga susunod na thesis directions** gamit ang mga button sa itaas!`;
  } else {
    return `Academic assessment for **"${title}"** by ${authorsList} (${dept} \u2022 ${course}, ${year}):

### Executive Overview
This research paper investigates critical challenges in **${keywordsList}**:

\u2022 **Context & Problem Statement:** ` + (sentences[0] || `Establishes a rigorous study of operational dynamics in ${course}.`) + `
\u2022 **Methodology & Architecture:** ` + (sentences[1] || `Applies structured empirical data gathering and validated analytical methods.`) + `
\u2022 **Key Findings & Contributions:** ` + (sentences[2] || `Provides validated findings directly applicable to UDM and Manila municipal stakeholders.`) + `

Feel free to click any of the suggested prompts above to explore specific aspects such as **methodologies**, **Manila/UDM application**, or **future thesis directions**!`;
  }
};

// server.ts
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
var supabaseServerUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
var supabaseServerKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
var isServerSupabaseConfigured = Boolean(
  supabaseServerUrl && supabaseServerKey && supabaseServerUrl.startsWith("http") && !supabaseServerUrl.includes("your-project-ref")
);
var DummyNodeWebSocket = class {
};
var serverSupabase = isServerSupabaseConfigured ? createClient(supabaseServerUrl, supabaseServerKey, {
  auth: { persistSession: false },
  realtime: { transport: DummyNodeWebSocket }
}) : null;
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "UDM-ResearchHub/1.0"
    }
  }
});
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
var isServerlessEnv = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);
var uploadsDir = isServerlessEnv ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("[Uploads Directory] Non-fatal init note:", e?.message || e);
}
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    }
  }
}));
app.use("/uploads", (req, res, next) => {
  if (req.path !== "/") {
    return res.status(404).type("text/plain").send("PDF manuscript file not found.");
  }
  next();
});
app.post("/api/upload-pdf", (req, res) => {
  try {
    const { fileName, fileBase64, researchId } = req.body;
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: "fileName and fileBase64 are required." });
    }
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = researchId ? `${researchId}_${cleanName}` : cleanName;
    const targetPath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(fileBase64, "base64");
    fs.writeFileSync(targetPath, buffer);
    console.log(`[Uploads] Saved PDF manuscript: ${safeName} (${buffer.length} bytes)`);
    return res.status(200).json({ success: true, url: `/uploads/${safeName}`, fileName: safeName });
  } catch (err) {
    console.error("[Uploads] Error saving PDF:", err);
    return res.status(500).json({ error: err.message || "Failed to save PDF" });
  }
});
var usersDB = [...INITIAL_USERS];
var researchDB = [...INITIAL_RESEARCH];
var submissionsDB = [...INITIAL_SUBMISSIONS];
var settingsDB = { ...INITIAL_SYSTEM_SETTINGS };
var getSmtpTransporter = () => {
  const gmailUser = (process.env.GMAIL_USER || process.env.GOOGLE_EMAIL_USER || "").trim();
  const gmailPass = (process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GOOGLE_APP_PASSWORD || "").trim();
  const host = (process.env.SMTP_HOST || (gmailUser ? "smtp.gmail.com" : "smtp.hostinger.com")).trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER || gmailUser || "blching@udmrhub.site").trim();
  const pass = (process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASS || gmailPass || "Default270319.").trim();
  if (!user || !pass) {
    return null;
  }
  const isGmail = host.includes("gmail.com") || user.endsWith("@gmail.com");
  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    // true for 465, false for 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};
var pendingRegistrationOTPs = /* @__PURE__ */ new Map();
async function cleanupExpiredPendingRegistrations() {
  const now = Date.now();
  for (const [email, pending] of pendingRegistrationOTPs.entries()) {
    if (now >= pending.cleanupAt) {
      console.log(`
[Auto-Cleanup] 1 hour elapsed without verification for: ${email}`);
      console.log(`[Auto-Cleanup] Deleting uncompleted account from Supabase...`);
      pendingRegistrationOTPs.delete(email);
      if (serverSupabase) {
        try {
          const { error: delErr } = await serverSupabase.from("users").delete().ilike("email", email);
          if (delErr) {
            console.warn(`[Auto-Cleanup] Note deleting ${email} from public.users:`, delErr.message);
          } else {
            console.log(`[Auto-Cleanup] Successfully wiped unverified ${email} from Supabase public.users table.`);
          }
          if (serverSupabase.auth && serverSupabase.auth.admin && pending.userId) {
            try {
              await serverSupabase.auth.admin.deleteUser(pending.userId);
              console.log(`[Auto-Cleanup] Successfully wiped unverified ${email} from Supabase auth.users.`);
            } catch (authErr) {
              console.warn(`[Auto-Cleanup] Note deleting auth user:`, authErr.message);
            }
          }
        } catch (cleanupErr) {
          console.warn(`[Auto-Cleanup] Cleanup error for ${email}:`, cleanupErr.message);
        }
      }
    }
  }
}
setInterval(() => {
  cleanupExpiredPendingRegistrations().catch((err) => {
    console.warn("[Auto-Cleanup] Interval error:", err.message);
  });
}, 5 * 60 * 1e3);
async function sendNumericOTPEmail(toEmail, fullName, otpCode) {
  const transporter = getSmtpTransporter();
  console.log(`
================================================================`);
  console.log(`[UDM OTP] Registration Verification for: ${toEmail}`);
  console.log(`[UDM OTP] 6-DIGIT NUMERIC CODE (NUMBERS ONLY): >>> [ ${otpCode} ] <<<`);
  console.log(`================================================================
`);
  if (!transporter) {
    console.warn(`[UDM OTP] SMTP credentials not set. Code [ ${otpCode} ] logged to console for test/dev.`);
    return false;
  }
  try {
    const sender = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.HOSTINGER_EMAIL_USER || "blching@udmrhub.site";
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "UDM ResearchHub - URELIA"}" <${sender}>`,
      to: toEmail,
      subject: `[${otpCode}] Your UDM ResearchHub 6-Digit Verification Code`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background-color: #1a4731; padding: 24px; text-align: center; border-bottom: 3px solid #c9a84c;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">UNIVERSIDAD DE MANILA</h1>
            <p style="color: #c9a84c; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">URELIA Office \u2022 Research & Archival Portal</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #1a4731; margin-top: 0; font-size: 18px;">Account Email Verification</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${fullName || "UDM Scholar"}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">Please use the <strong>6-digit verification code (numbers only)</strong> below to confirm your institutional email and activate your UDM ResearchHub account:</p>
            
            <div style="margin: 28px 0; text-align: center;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #1a4731; border-radius: 12px; padding: 18px 36px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1a4731;">${otpCode}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 8px;">(Strictly 6 numeric digits \u2022 Valid for 15 minutes)</p>
            </div>

            <p style="color: #334155; font-size: 13px; line-height: 1.6;">If you did not request this verification, please disregard this message or contact the URELIA Office.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <p style="margin: 0;">\xA9 2026 Universidad de Manila \u2022 URELIA Office \u2022 Republic Act 10173 Compliant</p>
          </div>
        </div>
      `
    });
    console.log(`[UDM OTP] Verification email dispatched successfully to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[UDM OTP] Hostinger SMTP sendMail error:`, err.message);
    return false;
  }
}
app.get("/api/health", (req, res) => {
  const transporter = getSmtpTransporter();
  res.json({
    status: "online",
    system: "UDM-ResearchHub API",
    institution: "Universidad de Manila - URELIA Office",
    smtp: {
      provider: "SMTP (Hostinger / Gmail)",
      configured: Boolean(transporter),
      sender: process.env.SMTP_USER || process.env.GMAIL_USER || process.env.HOSTINGER_EMAIL_USER || "blching@udmrhub.site"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/smtp/test", async (req, res) => {
  const { toEmail } = req.body;
  const transporter = getSmtpTransporter();
  if (!transporter) {
    return res.status(400).json({
      success: false,
      error: "SMTP is not yet configured. Please set SMTP_USER and SMTP_PASS (or GMAIL_USER and GMAIL_PASS)."
    });
  }
  const targetEmail = toEmail || process.env.SMTP_USER || process.env.GMAIL_USER || "blching@udmrhub.site";
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "UDM ResearchHub"}" <${process.env.SMTP_USER || process.env.GMAIL_USER || "blching@udmrhub.site"}>`,
      to: targetEmail,
      subject: "UDM-ResearchHub SMTP Connection Verified",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #1a4731; margin-top: 0;">Universidad de Manila - URELIA ResearchHub</h2>
          <p>This is a confirmation that your SMTP email server is successfully connected to UDM-ResearchHub!</p>
          <div style="padding: 12px; background-color: #e6f4ea; border-left: 4px solid #1a4731; border-radius: 4px; margin: 15px 0;">
            <p style="margin: 0; color: #1a4731; font-weight: bold;">Status: Active & Operational</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #374151;">All student and faculty verification codes will be delivered through this channel.</p>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Universidad de Manila \u2022 Research and Extension Services Office (URELIA)</p>
        </div>
      `
    });
    res.json({
      success: true,
      message: `Test email successfully sent to ${targetEmail} via SMTP!`,
      messageId: info.messageId
    });
  } catch (err) {
    console.error("SMTP Test Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "SMTP authentication or connection failed"
    });
  }
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "UDM Email and password are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  let user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({
      error: "Account not found. Please register and verify your email address before signing in."
    });
  }
  if (user.password && user.password !== password) {
    return res.status(401).json({
      error: 'Invalid password. Please verify your credentials or use "Forgot password?".'
    });
  }
  const { password: _, ...safeUser } = user;
  res.json({
    message: "Login successful.",
    user: safeUser
  });
});
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, college, course } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, UDM Email, and password are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (usersDB.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }
  const newUser = {
    userID: `USR-UDM-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    role: "student_faculty",
    college: college || "CCS",
    course: course || "BS in Computer Science",
    readingHistory: []
  };
  usersDB.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    message: "UDM account successfully registered.",
    user: safeUser
  });
});
app.post("/api/auth/send-verification-otp", async (req, res) => {
  const { fullName, email, password, role, college, idNumber, courseProgram, yearLevel } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Full name, UDM email, and password are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      error: "Please enter a valid email address."
    });
  }
  if (usersDB.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({
      error: "An account with this email is already registered. Please go to the Sign In tab to log in."
    });
  }
  if (serverSupabase) {
    try {
      const { data: existingUser } = await serverSupabase.from("users").select("id").ilike("email", cleanEmail).maybeSingle();
      if (existingUser) {
        return res.status(400).json({
          error: "An account with this email is already registered. Please go to the Sign In tab to log in."
        });
      }
    } catch (checkErr) {
      console.warn("Supabase check existing user error:", checkErr.message);
    }
  }
  cleanupExpiredPendingRegistrations().catch(() => {
  });
  const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
  const assignedUserId = req.body.userId || `usr_${Date.now()}`;
  pendingRegistrationOTPs.set(cleanEmail, {
    code: otpCode,
    userId: assignedUserId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1e3,
    cleanupAt: Date.now() + 60 * 60 * 1e3,
    payload: {
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: role || "student",
      college: college || "CCS",
      idNumber: (idNumber || "").trim(),
      courseProgram: (courseProgram || "").trim(),
      yearLevel: yearLevel || "1st Year"
    }
  });
  await sendNumericOTPEmail(cleanEmail, fullName, otpCode);
  res.status(200).json({
    success: true,
    needsVerification: true,
    email: cleanEmail,
    message: `A 6-digit numeric verification code has been dispatched to ${cleanEmail}.`
  });
});
app.post("/api/auth/verify-registration-otp", async (req, res) => {
  const { email, otpCode } = req.body;
  if (!email || !otpCode) {
    return res.status(400).json({ error: "Email and 6-digit verification code are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = otpCode.toString().trim().replace(/\D/g, "");
  if (!/^\d{6}$/.test(cleanCode)) {
    return res.status(400).json({ error: "Please enter a valid 6-digit numeric verification code (numbers only)." });
  }
  const pending = pendingRegistrationOTPs.get(cleanEmail);
  if (!pending) {
    return res.status(400).json({
      error: "No pending registration found for this email. Please register first."
    });
  }
  if (Date.now() > pending.expiresAt) {
    return res.status(400).json({
      error: "Your 6-digit verification code has expired (15 minutes). Please click Resend Verification Code to receive a fresh code."
    });
  }
  if (pending.code !== cleanCode) {
    return res.status(400).json({
      error: "Incorrect 6-digit verification code. Please check your email and enter the numbers sent."
    });
  }
  const { payload } = pending;
  const newUserId = pending.userId || `usr_${Date.now()}`;
  const newUser = {
    userID: newUserId,
    name: payload.fullName,
    fullName: payload.fullName,
    email: cleanEmail,
    password: payload.password,
    role: payload.role || "student",
    userType: payload.role === "Faculty_Admin" || payload.role === "Faculty" ? "Faculty_Admin" : payload.role === "student" ? "Student" : payload.role,
    college: payload.college || "CCS",
    idNumber: payload.idNumber,
    courseProgram: payload.courseProgram,
    yearLevel: payload.yearLevel,
    dateRegistered: (/* @__PURE__ */ new Date()).toISOString(),
    readingHistory: []
  };
  if (serverSupabase) {
    try {
      if (serverSupabase.auth && serverSupabase.auth.admin && payload.password) {
        try {
          const { data: authData, error: authErr } = await serverSupabase.auth.admin.createUser({
            email: cleanEmail,
            password: payload.password,
            email_confirm: true,
            user_metadata: {
              full_name: payload.fullName,
              role: newUser.role,
              college: newUser.college,
              id_number: newUser.idNumber,
              course_program: newUser.courseProgram
            }
          });
          if (!authErr && authData?.user?.id) {
            newUser.userID = authData.user.id;
          }
        } catch (authErr) {
          console.warn("[Supabase Auth Admin] User creation note:", authErr.message);
        }
      }
      await serverSupabase.from("users").upsert({
        id: newUser.userID,
        name: newUser.name,
        full_name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        user_type: newUser.userType,
        college: newUser.college,
        id_number: newUser.idNumber,
        course_program: newUser.courseProgram,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }, { onConflict: "email" });
      console.log(`[Supabase Sync] Successfully verified and saved ${cleanEmail} to public.users table!`);
    } catch (syncErr) {
      console.warn("[Supabase Sync] Note on saving user to Supabase:", syncErr.message);
    }
  }
  usersDB.push(newUser);
  pendingRegistrationOTPs.delete(cleanEmail);
  const { password: _, ...safeUser } = newUser;
  res.status(200).json({
    success: true,
    message: "Account successfully verified and activated! Welcome to UDM ResearchHub.",
    user: safeUser
  });
});
app.post("/api/auth/resend-verification-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const pending = pendingRegistrationOTPs.get(cleanEmail);
  if (!pending) {
    return res.status(400).json({
      error: "No pending registration found for this email. Please submit your registration details first."
    });
  }
  const freshCode = Math.floor(1e5 + Math.random() * 9e5).toString();
  pending.code = freshCode;
  pending.expiresAt = Date.now() + 15 * 60 * 1e3;
  pendingRegistrationOTPs.set(cleanEmail, pending);
  await sendNumericOTPEmail(cleanEmail, pending.payload.fullName, freshCode);
  res.status(200).json({
    success: true,
    message: `A fresh 6-digit numeric verification code has been dispatched to ${cleanEmail}.`
  });
});
var handleAuthCallback = async (req, res) => {
  const token_hash = req.query.token_hash || "";
  const code = req.query.code || "";
  const type = req.query.type || "signup";
  const errorDescription = req.query.error_description || "";
  const errorCode = req.query.error_code || req.query.error || "";
  if (errorCode || errorDescription) {
    const isExpired = errorCode.includes("expired") || errorDescription.toLowerCase().includes("expired");
    const redirectParam = isExpired ? "error=expired_link" : `error=${encodeURIComponent(errorDescription || errorCode)}`;
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
          const isExpired = error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("invalid");
          return res.redirect(`https://udmrhub.site/?error=${isExpired ? "expired_link" : encodeURIComponent(error.message)}`);
        }
        return res.redirect("https://udmrhub.site/?verified=true");
      } else if (code) {
        const { error } = await serverSupabase.auth.exchangeCodeForSession(code);
        if (error) {
          const isExpired = error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("invalid");
          return res.redirect(`https://udmrhub.site/?error=${isExpired ? "expired_link" : encodeURIComponent(error.message)}`);
        }
        return res.redirect("https://udmrhub.site/?verified=true");
      }
    } catch (err) {
      console.error("Server auth callback error:", err);
      return res.redirect("https://udmrhub.site/?error=expired_link");
    }
  }
  res.redirect("https://udmrhub.site/");
};
app.get("/auth/callback", handleAuthCallback);
app.get("/api/auth/callback", handleAuthCallback);
app.get("/api/research", (req, res) => {
  const query = req.query.query || "";
  const college = req.query.college || "ALL";
  const year = req.query.year ? parseInt(req.query.year, 10) : "ALL";
  const keyword = req.query.keyword || "ALL";
  const sortBy = req.query.sortBy || "relevance";
  let filtered = researchDB.filter((r) => r.status === "approved");
  if (college !== "ALL") {
    filtered = filtered.filter((r) => r.department === college);
  }
  if (year !== "ALL" && !isNaN(year)) {
    filtered = filtered.filter((r) => r.year === year);
  }
  if (keyword !== "ALL") {
    filtered = filtered.filter((r) => r.keywords.some((k) => k.toLowerCase() === keyword.toLowerCase()));
  }
  const corpusTokens = filtered.map(getResearchTokens);
  const idf = calculateIDF(corpusTokens);
  let scored = filtered.map((item) => ({
    ...item,
    relevanceScore: scoreSearchRelevance(query, item, idf)
  }));
  if (query.trim()) {
    scored = scored.filter((item) => (item.relevanceScore || 0) > 0);
  }
  if (sortBy === "relevance" && query.trim()) {
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === "newest") {
    scored.sort((a, b) => b.year - a.year || new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  } else if (sortBy === "views") {
    scored.sort((a, b) => b.viewsCount - a.viewsCount);
  }
  res.json({
    total: scored.length,
    colleges: UDM_COLLEGES.map((c) => c.id),
    items: scored
  });
});
app.get("/api/research/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  const research = researchDB.find((r) => r.researchID === id);
  if (!research) {
    return res.status(404).json({ error: "Research paper not found in archive." });
  }
  research.viewsCount += 1;
  if (userId) {
    const user = usersDB.find((u) => u.userID === userId);
    if (user) {
      if (!user.readingHistory) user.readingHistory = [];
      if (!user.readingHistory.includes(id)) {
        user.readingHistory.push(id);
      }
    }
  }
  res.json(research);
});
app.post("/api/research/:id/download-abstract", (req, res) => {
  const { id } = req.params;
  const research = researchDB.find((r) => r.researchID === id);
  if (research) {
    research.downloadsCount += 1;
  }
  res.json({ success: true, message: "Abstract download counter incremented." });
});
app.post("/api/research/batch", (req, res) => {
  const { papers } = req.body;
  if (!Array.isArray(papers) || papers.length === 0) {
    return res.status(400).json({ error: "Array of research papers is required." });
  }
  let importedCount = 0;
  for (const item of papers) {
    if (!item.title || !item.abstract) continue;
    const researchID = item.researchID || `RES-BULK-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1e3)}`;
    const newPaper = {
      researchID,
      title: item.title.trim(),
      abstract: item.abstract.trim(),
      authors: Array.isArray(item.authors) ? item.authors : item.authors ? String(item.authors).split(/[,;•]/).map((a) => a.trim()).filter(Boolean) : ["UDM Researcher"],
      keywords: Array.isArray(item.keywords) ? item.keywords : item.keywords ? String(item.keywords).split(/[,;•]/).map((k) => k.trim()).filter(Boolean) : ["Research", "UDM"],
      department: item.department || "CCS",
      course: item.course || "Undergraduate Research",
      year: Number(item.year) || (/* @__PURE__ */ new Date()).getFullYear(),
      status: "approved",
      fullPdfUrl: item.fullPdfUrl || "",
      viewsCount: Number(item.viewsCount) || 0,
      downloadsCount: Number(item.downloadsCount) || 0,
      submittedBy: item.submittedBy || "bulk-import@udm.edu.ph",
      dateAdded: item.dateAdded || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
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
app.get("/api/recommendations/:userId", (req, res) => {
  const { userId } = req.params;
  const user = usersDB.find((u) => u.userID === userId);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  const recommendations = generateHybridRecommendations(
    user,
    usersDB,
    researchDB,
    settingsDB.contentBasedWeight,
    settingsDB.collaborativeWeight
  );
  const enriched = recommendations.map((rec) => {
    const paper = researchDB.find((r) => r.researchID === rec.researchID);
    return {
      ...rec,
      paper
    };
  }).filter((rec) => rec.paper !== void 0);
  res.json({
    userID: user.userID,
    userCollege: user.college,
    totalRecommendations: enriched.length,
    recommendations: enriched.slice(0, 6)
  });
});
app.post("/api/submissions", async (req, res) => {
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
    return res.status(400).json({ error: "All required research submission fields must be provided." });
  }
  if (!UDM_COLLEGES.some((c) => c.id === department)) {
    return res.status(400).json({ error: "Invalid UDM College selected." });
  }
  let submitterUser = null;
  const cleanEmail = (submitterEmail || "").trim().toLowerCase();
  const submitterId = (submittedBy || "").trim();
  if (serverSupabase) {
    try {
      const { data } = await serverSupabase.from("users").select("*").or(`id.eq.${submitterId},email.ilike.${cleanEmail}`).maybeSingle();
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
      console.warn("Backend Supabase user lookup warning:", dbErr);
    }
  }
  if (!submitterUser) {
    const found = usersDB.find(
      (u) => u.userID === submitterId || cleanEmail && u.email.toLowerCase() === cleanEmail
    ) || INITIAL_USERS.find(
      (u) => u.userID === submitterId || cleanEmail && u.email.toLowerCase() === cleanEmail
    );
    if (found) submitterUser = found;
  }
  if (!submitterUser) {
    return res.status(403).json({
      error: "Research submission is exclusively authorized for Faculty/Admin and the URELIA Office."
    });
  }
  const isSuperAdmin = submitterUser.role === "super_admin";
  const isFaculty = submitterUser.userType === "Faculty" || submitterUser.userType === "Faculty_Admin" || submitterUser.role === "admin";
  const isStudentUser = !isSuperAdmin && !isFaculty;
  if (isStudentUser) {
    return res.status(403).json({
      error: "Research submission is exclusively authorized for Faculty/Admin and the URELIA Office."
    });
  }
  if (isFaculty && !isSuperAdmin) {
    const userCollege = submitterUser.college;
    if (userCollege && department !== userCollege) {
      return res.status(403).json({
        error: `Submission rejected: Faculty/Admin members are strictly authorized to submit research only for their designated college (${userCollege}). Submitted college '${department}' does not match.`
      });
    }
  }
  const newSubmissionID = `SUB-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-4)}`;
  const newResearchID = `RES-SUB-${Date.now().toString().slice(-5)}`;
  const newSubmission = {
    submissionID: newSubmissionID,
    submittedBy: submitterUser.userID,
    submitterName: submitterUser.name || submitterName || "UDM Researcher",
    submitterEmail: submitterUser.email || submitterEmail || "researcher@udm.edu.ph",
    researchID: newResearchID,
    title: title.trim(),
    abstract: abstract.trim(),
    authors: Array.isArray(authors) ? authors : [authors],
    keywords: Array.isArray(keywords) ? keywords : keywords ? keywords.split(",").map((k) => k.trim()) : [],
    department,
    course: course.trim(),
    year: parseInt(year, 10) || (/* @__PURE__ */ new Date()).getFullYear(),
    dateSubmitted: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status: "pending",
    pdfFileName: pdfFileName || "research_manuscript.pdf"
  };
  submissionsDB.unshift(newSubmission);
  res.status(201).json({
    message: "Research paper successfully submitted for URELIA Office review.",
    submission: newSubmission
  });
});
app.get("/api/submissions", (req, res) => {
  res.json(submissionsDB);
});
app.put("/api/submissions/:id/review", (req, res) => {
  const { id } = req.params;
  const { status, reviewNote } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Review status must be either approved or rejected." });
  }
  const submission = submissionsDB.find((s) => s.submissionID === id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found." });
  }
  submission.status = status;
  submission.reviewNote = reviewNote || "";
  if (status === "approved") {
    const existingIndex = researchDB.findIndex((r) => r.researchID === submission.researchID);
    const approvedPaper = {
      researchID: submission.researchID,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors,
      keywords: submission.keywords,
      department: submission.department,
      course: submission.course,
      year: submission.year,
      status: "approved",
      viewsCount: 0,
      downloadsCount: 0,
      submittedBy: submission.submittedBy,
      dateAdded: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
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
app.get("/api/analytics", (req, res) => {
  const collegeBreakdown = {
    CBM: 0,
    CAS: 0,
    CPPG: 0,
    CCS: 0,
    CHS: 0,
    CED: 0,
    CCJ: 0,
    "FAC-ADM": 0
  };
  const courseBreakdown = {};
  const yearlyDistribution = {};
  researchDB.forEach((r) => {
    if (r.status === "approved") {
      if (r.department in collegeBreakdown) {
        collegeBreakdown[r.department] += 1;
      }
      courseBreakdown[r.course] = (courseBreakdown[r.course] || 0) + 1;
      yearlyDistribution[r.year] = (yearlyDistribution[r.year] || 0) + 1;
    }
  });
  const totalResearches = researchDB.filter((r) => r.status === "approved").length;
  const totalSubmissions = submissionsDB.length;
  const pendingCount = submissionsDB.filter((s) => s.status === "pending").length;
  const approvedCount = submissionsDB.filter((s) => s.status === "approved").length;
  const rejectedCount = submissionsDB.filter((s) => s.status === "rejected").length;
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
app.get("/api/admin/users", async (req, res) => {
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase.from("users").select("*");
      if (!error && data && data.length > 0) {
        const mappedUsers = data.map((u) => ({
          userID: u.id || u.user_id,
          name: u.name || u.full_name || u.email?.split("@")[0],
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
      console.warn("Could not query Supabase users on backend:", err);
    }
  }
  const safeUsers = usersDB.map(({ password: _, ...user }) => user);
  res.json(safeUsers);
});
app.put("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const { role, college, course } = req.body;
  if (serverSupabase) {
    try {
      const updateData = {};
      if (role) updateData.role = role;
      if (college) updateData.college = college;
      if (course) updateData.course_program = course;
      await serverSupabase.from("users").update(updateData).eq("id", id);
    } catch (err) {
      console.warn("Could not update user in Supabase on backend:", err);
    }
  }
  const user = usersDB.find((u) => u.userID === id);
  if (user) {
    if (role) user.role = role;
    if (college) user.college = college;
    if (course) user.course = course;
  }
  res.json({ message: "User role updated successfully." });
});
app.get("/api/admin/settings", (req, res) => {
  res.json(settingsDB);
});
app.put("/api/admin/settings", (req, res) => {
  settingsDB = { ...settingsDB, ...req.body };
  res.json({ message: "System settings updated successfully.", settings: settingsDB });
});
async function callGemini(prompt, jsonMode = false) {
  const models = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
  for (const model of models) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: "application/json" } : void 0
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Request timed out")), 2e4)
      );
      const res = await Promise.race([generatePromise, timeoutPromise]);
      if (res && res.text && res.text.trim()) return res.text;
    } catch (err) {
      console.warn(`Gemini model ${model} attempt failed:`, err.message);
    }
  }
  return null;
}
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { title, abstract, department, course, keywords } = req.body;
    if (!title || !abstract) {
      return res.status(400).json({ error: "Title and abstract are required." });
    }
    const prompt = `You are the AI Academic Research Assistant of Universidad de Manila (UDM) URELIA Office.
Analyze this academic research paper:
Title: "${title}"
College / Department: ${department || "General"}
Course Program: ${course || "Academic"}
Keywords: ${Array.isArray(keywords) ? keywords.join(", ") : keywords || ""}
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
    if (!data || !data.executiveSummary) {
      const sentences = abstract.split(/(?<=[.?!])\s+/).filter(Boolean);
      const kwList = Array.isArray(keywords) ? keywords : (keywords || "").split(",").map((k) => k.trim());
      data = {
        executiveSummary: sentences.slice(0, 2).join(" ") || `This academic research titled "${title}" investigates key interventions and methodologies within the ${course || department} program at Universidad de Manila.`,
        keyFindings: [
          sentences[2] || `Demonstrated measurable improvements within the target environment in the City of Manila.`,
          sentences[3] || `Validated empirical methodologies with rigorous academic verification.`,
          `Provides foundational documentation for future ${department || "UDM"} capstone projects.`
        ],
        methodology: `Mixed-methods empirical study applying domain-specific frameworks, data collection protocols, and algorithmic analysis relevant to ${course}.`,
        practicalImpact: `Advances educational research standards for Universidad de Manila and delivers actionable solutions for Manila stakeholders.`,
        alignedSDGs: [
          { sdgNumber: 4, sdgName: "Quality Education", explanation: "Enhances academic knowledge sharing and higher education research capacity at UDM." },
          { sdgNumber: 9, sdgName: "Industry, Innovation and Infrastructure", explanation: "Develops localized technical and administrative innovations." }
        ],
        futureResearchDirections: [
          `Scale the study to include multi-campus longitudinal datasets across Manila universities.`,
          `Integrate automated real-time analytics to monitor operational metrics post-implementation.`
        ]
      };
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error("AI Summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI summary" });
  }
});
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, research, history } = req.body;
    if (!message || !research) {
      return res.status(400).json({ error: "Message and research details are required." });
    }
    const historyPrompt = Array.isArray(history) && history.length > 0 ? `Prior Conversation:
${history.map((h) => `${h.role === "user" ? "User" : "AI Assistant"}: ${h.text}`).join("\n")}

` : "";
    const systemInstruction = `You are the official AI Research Assistant for Universidad de Manila (UDM) Research Archives (URELIA Office).
You are answering questions about this specific research paper from Universidad de Manila:
Title: "${research.title}"
Department / College: ${research.department} (${research.course || "Academic Research"})
Authors: ${Array.isArray(research.authors) ? research.authors.join(", ") : research.authors}
Year: ${research.year || "2024"}
Keywords: ${Array.isArray(research.keywords) ? research.keywords.join(", ") : research.keywords}

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
    const prompt = `${systemInstruction}

${historyPrompt}User Question: ${message}

AI Assistant:`;
    let reply = await callGemini(prompt, false);
    if (!reply) {
      reply = generateContextualAcademicAnswer(message, research);
    }
    res.json({ success: true, reply });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to query AI assistant" });
  }
});
app.post("/api/ai/assist-submission", async (req, res) => {
  try {
    const { title, abstract, department } = req.body;
    if (!title && !abstract) {
      return res.status(400).json({ error: "Title or abstract is required." });
    }
    const prompt = `You are the AI Academic Advisor at Universidad de Manila (UDM) Research & Extension Office (URELIA).
A student or faculty member is submitting a research paper.
Current Title: "${title || "Untitled"}"
Selected Department: ${department || "General"}
Draft Abstract / Description:
"${abstract || "No abstract provided yet"}"

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
        suggestedKeywords: [department || "Academic", "Machine Learning", "Empirical Analysis", "Universidad de Manila", "URELIA Research", "Capstone Study"],
        suggestedSDGs: ["SDG 4: Quality Education", "SDG 9: Industry, Innovation and Infrastructure"],
        advice: "Tiyaking malinaw ang saklaw (scope) at limitasyon ng pag-aaral, at maglagay ng malinaw na quantitative metrics upang mas maging matibay ang pagsusuri ng URELIA evaluation committee."
      };
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error("AI Submission Assist error:", error);
    res.status(500).json({ error: error.message || "Failed to provide AI assistance" });
  }
});
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`UDM-ResearchHub Express server listening at http://localhost:${PORT}`);
  });
  if (isDev) {
    let viteMiddleware = null;
    app.use((req, res, next) => {
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (viteMiddleware) {
          clearInterval(interval);
          return viteMiddleware(req, res, next);
        }
        if (Date.now() - startTime > 15e3) {
          clearInterval(interval);
          return res.status(503).send("Development server is still starting up, please refresh in a moment.");
        }
      }, 50);
    });
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false
        },
        appType: "spa"
      });
      viteMiddleware = vite.middlewares;
      console.log("Vite development middlewares attached.");
    } catch (err) {
      console.error("Failed to initialize Vite dev server:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}
var isServerless = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);
if (!isServerless) {
  startServer();
}
var server_default = app;

// api/_index.ts
function handler(req, res) {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/auth")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  return server_default(req, res);
}
export {
  handler as default
};
