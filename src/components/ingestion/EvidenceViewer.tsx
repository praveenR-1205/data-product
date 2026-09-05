import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Camera,
  ExternalLink,
  Tag,
  Clock,
  HardDrive,
  User,
} from 'lucide-react';
import { EvidenceItem } from '../../types/evidence';
import { StatusBadge } from '../common/StatusBadge';
import { formatTimestamp } from '../../utils/formatters';

interface EvidenceViewerProps {
  items: EvidenceItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [copied, setCopied] = React.useState(false);

  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !currentItem) return null;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(currentItem.s3Uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentItem.imageUrl;
    link.download = `${currentItem.id}-${currentItem.stageId}-snapshot.svg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-navy-950 rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 text-white">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#101828] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF6600]/20 border border-[#FF6600]/40 text-[#FF6600]">
              <Camera size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FF6600] px-2 py-0.5 rounded bg-[#FF6600]/10 border border-[#FF6600]/20">
                  {currentItem.id}
                </span>
                <h2 className="text-sm font-bold text-white tracking-tight">{currentItem.title}</h2>
                <StatusBadge status={currentItem.status} size="sm" />
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>Stage: <strong className="text-slate-200">{currentItem.stageName}</strong></span>
                <span>•</span>
                <span>Run ID: <strong className="font-mono text-slate-200">{currentItem.testRunId}</strong></span>
                <span>•</span>
                <span>{formatTimestamp(currentItem.timestamp)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download Snapshot"
            >
              <Download size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area: Image Viewer + Metadata Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Image Canvas with Navigation Arrows */}
          <div className="flex-1 bg-[#070B14] relative flex items-center justify-center p-6 overflow-hidden">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="max-h-[60vh] lg:max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl border border-slate-800 object-contain"
            />

            {/* Previous Button */}
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(currentIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-[#FF6600] text-white border border-slate-700 transition-all shadow-lg"
                title="Previous Screenshot (Left Arrow)"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next Button */}
            {currentIndex < items.length - 1 && (
              <button
                type="button"
                onClick={() => onNavigate(currentIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-[#FF6600] text-white border border-slate-700 transition-all shadow-lg"
                title="Next Screenshot (Right Arrow)"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Bottom thumbnail indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-300 font-mono">
              Screenshot {currentIndex + 1} of {items.length}
            </div>
          </div>

          {/* Right: Evidence Metadata Panel */}
          <div className="w-full lg:w-80 bg-[#101828] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-5 text-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Audit Description
              </h3>
              <p className="text-slate-300 leading-relaxed">{currentItem.description}</p>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Target System:</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{currentItem.metadata.targetSystem}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Endpoint / Table:</span>
                <span className="font-mono text-slate-200 mt-0.5 block break-all text-[11px]">
                  {currentItem.metadata.endpointOrTable}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Captured By Agent:</span>
                <span className="text-slate-200 mt-0.5 block">{currentItem.capturedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Artifact Size:</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{currentItem.metadata.sizeKb} KB</span>
              </div>
            </div>

            {/* S3 URI with copy */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-[11px]">Immutable S3 URI:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded p-1.5">
                <span className="font-mono text-[10px] text-slate-300 truncate flex-1 select-all">
                  {currentItem.s3Uri}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="p-1 rounded text-[#FF6600] hover:text-white hover:bg-slate-800"
                  title="Copy S3 URI"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Cryptographic SHA256 */}
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Cryptographic SHA-256 Digest:</span>
              <p className="font-mono text-[10px] text-slate-400 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                {currentItem.sha256Hash}
              </p>
            </div>

            {/* Tags */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1.5">Audit Tags:</span>
              <div className="flex flex-wrap gap-1">
                {currentItem.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="p-3 bg-[#0B0F19] border-t border-slate-800 overflow-x-auto flex items-center gap-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onNavigate(idx)}
              className={`shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all relative ${
                idx === currentIndex
                  ? 'border-[#FF6600] ring-2 ring-[#FF6600]/40'
                  : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
              }`}
            >
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                <span className="text-[9px] font-mono text-white truncate font-bold">{item.stageName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
