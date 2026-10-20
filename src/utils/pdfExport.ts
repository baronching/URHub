import jsPDF from 'jspdf';
import { Research, UDM_COLLEGES } from '../types';

/**
 * Generates and downloads a single combined PDF document containing
 * all selected research paper abstracts.
 * Filename: UDM-ResearchHub-Selected-Abstracts.pdf
 */
export function generateCombinedAbstractsPdf(selectedPapers: Research[]): void {
  if (!selectedPapers || selectedPapers.length === 0) return;

  // Deduplicate papers by researchID to prevent duplicates
  const uniquePapersMap = new Map<string, Research>();
  selectedPapers.forEach(p => {
    if (p && p.researchID && !uniquePapersMap.has(p.researchID)) {
      uniquePapersMap.set(p.researchID, p);
    }
  });
  const papers = Array.from(uniquePapersMap.values());

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);

  papers.forEach((paper, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const collegeInfo = UDM_COLLEGES.find(c => c.id === paper.department);

    // UDM Heraldic Header Banner (Dark Forest Green)
    doc.setFillColor(26, 71, 49); // #1a4731
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent Gold Line
    doc.setFillColor(201, 168, 76); // #c9a84c
    doc.rect(0, 28, pageWidth, 1.5, 'F');

    // University Title
    doc.setTextColor(201, 168, 76); // Gold #c9a84c
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD DE MANILA', margin, 11);

    // Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('URELIA Office • Official Research Archives & Repository', margin, 17);

    // Metadata Bar
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Abstract ${index + 1} of ${papers.length} | ID: ${paper.researchID} | Exported: ${new Date().toLocaleDateString()}`,
      margin,
      23
    );

    // Document Body
    let y = 38;

    // Research Title
    doc.setTextColor(26, 71, 49);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(paper.title, contentWidth);
    doc.text(splitTitle, margin, y);
    y += splitTitle.length * 5.5 + 3;

    // College & Academic Unit
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 71, 49);
    const collegeName = collegeInfo ? collegeInfo.name : paper.department;
    doc.text(`College / Unit: ${paper.department} - ${collegeName}`, margin, y);
    y += 5.5;

    // Course Program & Year
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Course / Program: ${paper.course} | Publication Year: ${paper.year}`, margin, y);
    y += 5.5;

    // Authors
    const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors;
    const splitAuthors = doc.splitTextToSize(`Authors: ${authorsStr}`, contentWidth);
    doc.text(splitAuthors, margin, y);
    y += splitAuthors.length * 4.8 + 2;

    // Keywords
    if (paper.keywords && paper.keywords.length > 0) {
      const kwStr = `Keywords: ${Array.isArray(paper.keywords) ? paper.keywords.join(', ') : paper.keywords}`;
      const splitKw = doc.splitTextToSize(kwStr, contentWidth);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.text(splitKw, margin, y);
      y += splitKw.length * 4.2 + 3;
    }

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Abstract Section Header
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 71, 49);
    doc.text('RESEARCH ABSTRACT', margin, y);
    y += 6.5;

    // Abstract Body Content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const splitAbstract = doc.splitTextToSize(paper.abstract, contentWidth);

    for (let i = 0; i < splitAbstract.length; i++) {
      if (y > pageHeight - 22) {
        addCompendiumPageFooter(doc, index + 1, papers.length);
        doc.addPage();
        y = 20;
      }
      doc.text(splitAbstract[i], margin, y);
      y += 4.8;
    }

    // Add page footer to current page
    addCompendiumPageFooter(doc, index + 1, papers.length);
  });

  // Download with exact requested filename
  doc.save('UDM-ResearchHub-Selected-Abstracts.pdf');
}

function addCompendiumPageFooter(doc: jsPDF, paperNum: number, totalPapers: number) {
  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 16;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Universidad de Manila • URELIA Office Research Repository', margin, pageHeight - 7);
  doc.text(
    `Paper ${paperNum} of ${totalPapers} • Page ${doc.getNumberOfPages()}`,
    pageWidth - margin,
    pageHeight - 7,
    { align: 'right' }
  );
}
