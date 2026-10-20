import jsPDF from 'jspdf';
import { Research, UDM_COLLEGES } from '../types';

/**
 * Generates and downloads a single, official compiled PDF containing all selected research abstracts.
 * In accordance with Universidad de Manila URELIA policies, abstracts are downloadable,
 * and each entry includes official metadata, keywords, and institutional citations.
 */
export const generateBatchAbstractsPdf = (papers: Research[]): boolean => {
  if (!papers || papers.length === 0) return false;

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const totalPapers = papers.length;
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const batchId = `UDM-ABS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Helper: Add running header to a page
    const renderHeader = (isCover = false) => {
      // Dark green banner
      doc.setFillColor(26, 71, 49); // #1a4731
      doc.rect(0, 0, 210, isCover ? 30 : 22, 'F');

      // Gold accent bar
      doc.setFillColor(201, 168, 76); // #c9a84c
      doc.rect(0, isCover ? 30 : 22, 210, 1.5, 'F');

      // Header text
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(isCover ? 14 : 12);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA', 15, isCover ? 12 : 10);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(isCover ? 9.5 : 8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        isCover
          ? 'URELIA Office - University Research, Extension, and Linkages Office'
          : 'URELIA Office - Official Research Abstract Compendium',
        15,
        isCover ? 18 : 16
      );

      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `Batch Ref: ${batchId} | Export Date: ${dateStr}`,
        isCover ? 15 : 195,
        isCover ? 24 : 16,
        { align: isCover ? 'left' : 'right' }
      );
    };

    // Helper: Add running footer
    const renderFooter = (pageNumber: number, totalPagesPlaceholder: string) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 285, 195, 285);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Universidad de Manila (UDM) - ResearchHub Academic Repository', 15, 290);
      doc.text(
        `Page ${pageNumber} of ${totalPagesPlaceholder}`,
        195,
        290,
        { align: 'right' }
      );
    };

    // If more than 1 paper, create an official Cover / Compendium Summary Page
    if (totalPapers > 1) {
      renderHeader(true);

      let y = 42;

      // Compendium Title
      doc.setTextColor(26, 71, 49);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SELECTED RESEARCH ABSTRACTS COMPILATION', 15, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Official compilation containing ${totalPapers} authorized academic abstracts`, 15, y);
      y += 10;

      // Summary Metadata Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(15, y, 180, 26, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('COMPILATION DETAILS', 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`Total Selected Papers: ${totalPapers}`, 20, y + 12);
      doc.text(`Date of Compilation: ${dateStr}`, 20, y + 17);
      doc.text(`Repository Authority: URELIA Office, Universidad de Manila`, 20, y + 22);

      // Unique colleges included
      const uniqueColleges = Array.from(new Set(papers.map(p => p.department)));
      doc.text(`Units Represented: ${uniqueColleges.join(', ')}`, 110, y + 12);
      doc.text(`Classification: Authorized Abstract Export`, 110, y + 17);
      doc.text(`Security: Protected View Mode Enforced`, 110, y + 22);

      y += 34;

      // Table of Contents Header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('TABLE OF INCLUDED RESEARCH PAPERS', 15, y);
      y += 7;

      // List of Papers
      papers.forEach((paper, index) => {
        if (y > 265) {
          doc.addPage();
          renderHeader(false);
          y = 32;
        }

        const collegeInfo = UDM_COLLEGES.find(c => c.id === paper.department);
        const collegeLabel = collegeInfo?.name.replace('College of ', '') || paper.department;

        // Number and Title
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 71, 49);
        const itemNumber = `${index + 1}. `;
        const splitTitle = doc.splitTextToSize(`${itemNumber}${paper.title}`, 180);
        doc.text(splitTitle, 15, y);
        y += splitTitle.length * 4.5;

        // Authors & metadata line
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const authorsText = `Authors: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''} | Unit: ${paper.department} (${collegeLabel}) | Year: ${paper.year}`;
        doc.text(authorsText, 18, y);
        y += 6;
      });

      // System Constraint Notice at bottom of cover/index
      if (y > 240) {
        doc.addPage();
        renderHeader(false);
        y = 32;
      } else {
        y = Math.max(y + 4, 245);
      }

      doc.setFillColor(254, 243, 199); // amber-100
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(15, y, 180, 22, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('URELIA OFFICIAL REPOSITORY NOTICE', 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 53, 15);
      doc.text(
        'In strict adherence to Universidad de Manila URELIA Office policies, research abstracts are permitted',
        20,
        y + 11
      );
      doc.text(
        'for multi-document export. Full manuscripts are view-protected within the UDM-ResearchHub portal.',
        20,
        y + 16
      );
    }

    // Now render each selected research paper's full abstract
    papers.forEach((paper, paperIndex) => {
      // Add page for this paper
      if (totalPapers > 1 || paperIndex > 0) {
        doc.addPage();
      }

      renderHeader(false);

      let y = 30;
      const collegeInfo = UDM_COLLEGES.find(c => c.id === paper.department);

      // Item counter badge for multi-paper compilations
      if (totalPapers > 1) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(15, y, 55, 6, 1, 1, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 71, 49);
        doc.text(`ABSTRACT ${paperIndex + 1} OF ${totalPapers}`, 18, y + 4.2);
        y += 9;
      }

      // Paper Title
      doc.setTextColor(26, 71, 49);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const splitTitle = doc.splitTextToSize(paper.title, 180);
      doc.text(splitTitle, 15, y);
      y += splitTitle.length * 5.8 + 3;

      // Metadata section (College, Course, Year, Authors)
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      const isFaculty = paper.department === 'FAC-ADM' || paper.authorCategory === 'Faculty_Admin';
      const collegeLabel = isFaculty
        ? 'Faculty & Administration (FAC-ADM)'
        : `${paper.department} - ${collegeInfo?.name || 'Academic Unit'}`;
      doc.text(`College / Unit: ${collegeLabel}`, 15, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Degree Program: ${paper.course} | Publication Year: ${paper.year}`, 15, y);
      y += 5;

      doc.text(`Authors: ${paper.authors.join(', ')}`, 15, y);
      y += 5;

      if (paper.adviser) {
        doc.text(`Research Adviser: ${paper.adviser}`, 15, y);
        y += 5;
      }

      // Horizontal Divider
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 7;

      // ABSTRACT Section Heading
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('RESEARCH ABSTRACT', 15, y);
      y += 6;

      // Abstract body text
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      const splitAbstract = doc.splitTextToSize(paper.abstract, 180);

      // Handle long abstracts that might span pages
      for (let i = 0; i < splitAbstract.length; i++) {
        if (y > 245) {
          doc.addPage();
          renderHeader(false);
          y = 32;

          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 116, 139);
          doc.text(`[Continued: ${paper.title.slice(0, 70)}...]`, 15, y);
          y += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
        }
        doc.text(splitAbstract[i], 15, y);
        y += 4.8;
      }

      y += 6;

      // Keywords section
      if (y > 250) {
        doc.addPage();
        renderHeader(false);
        y = 32;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 71, 49);
      doc.text('Keywords:', 15, y);

      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      const keywordsStr = paper.keywords && paper.keywords.length > 0 ? paper.keywords.join(', ') : 'N/A';
      const splitKeywords = doc.splitTextToSize(keywordsStr, 155);
      doc.text(splitKeywords, 34, y);
      y += Math.max(splitKeywords.length * 4.5, 6) + 4;

      // System constraint notice box
      if (y > 252) {
        doc.addPage();
        renderHeader(false);
        y = 32;
      }

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, 180, 16, 1.5, 1.5, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('SYSTEM CONSTRAINT NOTICE:', 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('As per UDM URELIA Office policy, only research abstracts are downloadable as PDF files.', 18, y + 9.5);
      doc.text('Full research manuscripts are view-only within the UDM-ResearchHub portal.', 18, y + 13.5);
    });

    // Compute total pages and stamp running footers on all pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      renderFooter(p, totalPages.toString());
    }

    // Save PDF
    const filename =
      totalPapers === 1
        ? `${papers[0].researchID}_Abstract_UDM.pdf`
        : `UDM_Research_Abstracts_Compilation_${totalPapers}_Papers.pdf`;

    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to generate batch abstracts PDF:', err);
    return false;
  }
};
