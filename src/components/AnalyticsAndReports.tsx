import React from 'react';
import { UDM_COLLEGES, UDMCollege } from '../types';
import jsPDF from 'jspdf';
import {
  BarChart3,
  Building2,
  GraduationCap,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsAndReportsProps {
  analyticsData: {
    totalResearches: number;
    collegeBreakdown: Record<UDMCollege, number>;
    courseBreakdown: Record<string, number>;
    yearlyDistribution: Record<number, number>;
    totalSubmissions: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  } | null;
}

export const AnalyticsAndReports: React.FC<AnalyticsAndReportsProps> = ({ analyticsData }) => {
  if (!analyticsData) return null;

  const maxCollegeVal = Math.max(...(Object.values(analyticsData.collegeBreakdown) as number[]), 1);

  // Generate Official URELIA Office Summary Report PDF
  const handleExportPdfReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header (Forest Green #1a4731 = RGB 26, 71, 49)
      doc.setFillColor(26, 71, 49);
      doc.rect(0, 0, 210, 30, 'F');

      // Gold (#c9a84c = RGB 201, 168, 76)
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA', 15, 12);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('URELIA Office - Official Institutional Research Analytics Report', 15, 18);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Generated: ${new Date().toLocaleString()} | System ID: UDM-RESEARCHHUB-RPT`, 15, 24);

      let y = 42;

      // Overview Stats
      doc.setTextColor(26, 71, 49);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. EXECUTIVE SUMMARY & STATISTICAL METRICS', 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Approved Research Archives: ${analyticsData.totalResearches}`, 18, y); y += 6;
      doc.text(`Total Submissions Evaluated: ${analyticsData.totalSubmissions}`, 18, y); y += 6;
      doc.text(`Approval Rate: ${Math.round((analyticsData.approvedCount / Math.max(analyticsData.totalSubmissions, 1)) * 100)}%`, 18, y); y += 12;

      // College Breakdown
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. RESEARCH DISTRIBUTION BY UDM COLLEGE (7 UNITS)', 15, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      UDM_COLLEGES.forEach(col => {
        const count = analyticsData.collegeBreakdown[col.id] || 0;
        doc.text(`${col.id} - ${col.name}: ${count} Paper(s)`, 18, y);
        y += 5.5;
      });

      y += 10;

      // Course Trends
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. TOP ACADEMIC COURSE RESEARCH OUTPUTS', 15, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      Object.entries(analyticsData.courseBreakdown).slice(0, 8).forEach(([course, count]) => {
        doc.text(`• ${course}: ${count} Publication(s)`, 18, y);
        y += 5.5;
      });

      // Footer
      doc.setDrawColor(203, 213, 225);
      doc.line(15, 270, 195, 270);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL - UNIVERSIDAD DE MANILA RESEARCH & EXTENSION OFFICE (URELIA)', 15, 276);

      doc.save(`UDM_Research_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1a4731]">
              URELIA Research Analytics & Reports Engine
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time research output trends across all seven Universidad de Manila academic colleges and courses.
          </p>
        </div>

        <button
          onClick={handleExportPdfReport}
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4 text-[#c9a84c]" />
          <span>Export Analytics Report (PDF)</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Researches
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#1a4731] font-sans">
              {analyticsData.totalResearches}
            </span>
            <span className="text-xs text-slate-500 font-medium">Papers in Archive</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Submissions
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#c9a84c] font-sans">
              {analyticsData.totalSubmissions}
            </span>
            <span className="text-xs text-slate-500 font-medium">Evaluated Papers</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending Queue
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600 font-sans">
              {analyticsData.pendingCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Awaiting Review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approval Rate
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#1a4731] font-sans">
              {Math.round((analyticsData.approvedCount / Math.max(analyticsData.totalSubmissions, 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">URELIA Acceptance</span>
          </div>
        </div>
      </div>

      {/* College Breakdown Visual Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#1a4731] flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#1a4731]" />
            <span>Research Output by UDM College (7 Academic Colleges)</span>
          </h3>
          <span className="text-xs text-[#1a4731] font-bold">Real-time DB Counts</span>
        </div>

        <div className="space-y-3">
          {UDM_COLLEGES.map(col => {
            const count = analyticsData.collegeBreakdown[col.id] || 0;
            const barWidth = Math.max(5, Math.round((count / maxCollegeVal) * 100));

            return (
              <div key={col.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    <strong className="text-[#1a4731] font-mono mr-2">{col.id}</strong>
                    {col.name}
                  </span>
                  <span className="font-bold text-[#1a4731]">{count} Papers</span>
                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className="h-full bg-[#1a4731] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course-level Breakdown Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1a4731] flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-[#1a4731]" />
          <span>Research Trends by Academic Course / Degree Program</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(analyticsData.courseBreakdown).map(([course, count]) => (
            <div key={course} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-800 font-semibold truncate pr-2">{course}</span>
              <span className="px-2 py-0.5 rounded bg-[#1a4731]/10 text-[#1a4731] font-bold shrink-0">
                {count} papers
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
