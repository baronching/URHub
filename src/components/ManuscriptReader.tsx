import React, { useState, useEffect, useMemo } from 'react';
import { Research, UDM_COLLEGES } from '../types';
import { getOriginalPdfUrl, saveOriginalPdf } from '../utils/pdfStorage';
import {
  Download,
  ExternalLink,
  FileText,
  Upload,
  RefreshCw
} from 'lucide-react';

interface ManuscriptReaderProps {
  research: Research;
  onDownloadAbstract: () => void;
}

export const ManuscriptReader: React.FC<ManuscriptReaderProps> = ({
  research,
  onDownloadAbstract
}) => {
  const [originalBlobUrl, setOriginalBlobUrl] = useState<string>('');
  const [serverPdfAvailable, setServerPdfAvailable] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(true);

  // Look for the original uploaded manuscript file in IndexedDB
  useEffect(() => {
    let active = true;
    setIsLoadingFile(true);

    const candidateKeys = [
      research.researchID,
      research.documentNumber,
      research.fullPdfUrl?.replace('/uploads/', ''),
      research.title
    ];

    getOriginalPdfUrl(candidateKeys).then(url => {
      if (active) {
        if (url) setOriginalBlobUrl(url);
        setIsLoadingFile(false);
      }
    }).catch(() => {
      if (active) setIsLoadingFile(false);
    });

    return () => {
      active = false;
      if (originalBlobUrl && originalBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalBlobUrl);
      }
    };
  }, [research.researchID, research.documentNumber, research.fullPdfUrl]);

  // Check if a relative /uploads/ server URL actually exists and is a PDF
  useEffect(() => {
    let active = true;
    if (research.fullPdfUrl && research.fullPdfUrl.startsWith('/uploads/')) {
      fetch(research.fullPdfUrl, { method: 'HEAD' })
        .then(res => {
          if (active) {
            const isPdf = res.ok && (res.headers.get('content-type')?.includes('pdf') || false);
            setServerPdfAvailable(isPdf);
          }
        })
        .catch(() => {
          if (active) setServerPdfAvailable(false);
        });
    } else {
      setServerPdfAvailable(false);
    }
    return () => { active = false; };
  }, [research.fullPdfUrl]);

  // Determine the verified original submitted PDF URL
  const originalPdfUrl = useMemo(() => {
    // 1. Exact original PDF file uploaded by the user
    if (originalBlobUrl) {
      return originalBlobUrl;
    }

    if (!research.fullPdfUrl) return '';
    const rawUrl = research.fullPdfUrl.trim();

    // 2. Google Drive preview URL (for official published journals)
    if (rawUrl.includes('drive.google.com/file/d/')) {
      const match = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return rawUrl.replace(/\/view(\?.*)?$/, '/preview');
    }

    // 3. Absolute http / https / blob URL
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:')) {
      return rawUrl;
    }

    // 4. Server-hosted /uploads/ file ONLY if verified to exist as PDF
    if (rawUrl.startsWith('/uploads/') && serverPdfAvailable) {
      return rawUrl;
    }

    return '';
  }, [originalBlobUrl, research.fullPdfUrl, serverPdfAvailable]);

  const isGoogleDriveEmbed = originalPdfUrl.includes('drive.google.com');

  // Handle attaching the original PDF manually if viewing from a clean browser
  const handleAttachOriginalPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF manuscript file (.pdf).');
        return;
      }
      await saveOriginalPdf(research.researchID, file);
      if (research.documentNumber) await saveOriginalPdf(research.documentNumber, file);
      const url = URL.createObjectURL(file);
      setOriginalBlobUrl(url);

      // Also upload to server
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          await fetch('/api/upload-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              researchId: research.researchID,
              fileBase64: base64
            })
          });
        };
        reader.readAsDataURL(file);
      } catch {}
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Embedded PDF Toolbar */}
      <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-[#1a4731] text-white">
            <FileText className="w-4 h-4 text-[#c9a84c]" />
          </span>
          <div>
            <h4 className="font-bold text-[#1a4731] text-xs sm:text-sm flex items-center space-x-1.5">
              <span>Full Manuscript PDF Reader</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                {originalBlobUrl ? 'Original Submitted PDF' : (isGoogleDriveEmbed ? 'Published Journal PDF' : 'Original Manuscript')}
              </span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              {research.documentNumber || research.researchID} • {research.title.slice(0, 75)}{research.title.length > 75 ? '...' : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Attach / Replace Original File button */}
          <label className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#1a4731]" />
            <span>{originalPdfUrl ? 'Replace PDF' : 'Attach Original PDF'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleAttachOriginalPdf}
            />
          </label>

          {originalPdfUrl && (
            <a
              href={originalPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs flex items-center space-x-1 transition-all cursor-pointer"
              title="Open full PDF document in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#1a4731]" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>
          )}

          <button
            onClick={onDownloadAbstract}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download Abstract as PDF document"
          >
            <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Download Abstract</span>
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer Frame */}
      {isLoadingFile ? (
        <div className="w-full h-[72vh] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center space-y-3 p-8 text-center">
          <RefreshCw className="w-8 h-8 text-[#1a4731] animate-spin" />
          <p className="text-sm font-bold text-[#1a4731]">
            Loading original manuscript PDF...
          </p>
        </div>
      ) : originalPdfUrl ? (
        <div className="w-full h-[74vh] sm:h-[76vh] rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900/10">
          <iframe
            src={isGoogleDriveEmbed ? originalPdfUrl : `${originalPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0 rounded-xl"
            title={`${research.title} - Full Original PDF Manuscript`}
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      ) : (
        <div className="w-full h-[72vh] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-300 shadow-xs">
            <FileText className="w-8 h-8 text-[#1a4731]" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-slate-800">
              Original Manuscript PDF File Not Cached
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The original PDF for <span className="font-bold text-[#1a4731]">"{research.title}"</span> was submitted on another browser or device.
            </p>
            <p className="text-xs text-slate-500">
              Select your original PDF file from your device to load and view it immediately in full resolution.
            </p>
          </div>
          <label className="px-5 py-2.5 rounded-xl bg-[#1a4731] hover:bg-[#123323] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 border border-[#c9a84c]/40">
            <Upload className="w-4 h-4 text-[#c9a84c]" />
            <span>Select Original PDF File to View</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleAttachOriginalPdf}
            />
          </label>
        </div>
      )}
    </div>
  );
};
