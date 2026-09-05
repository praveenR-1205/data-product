import React, { useState } from 'react';
import { Camera, Eye, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { EvidenceItem } from '../../types/evidence';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceViewer } from './EvidenceViewer';
import { formatTimestamp } from '../../utils/formatters';

interface EvidenceGalleryProps {
  evidence: EvidenceItem[];
  isLoading?: boolean;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({ evidence, isLoading }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-border-subtle p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">Evidence Center</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF2EB] text-[#FF6600] font-bold text-xs border border-[#FFD2B8] font-mono">
              Evidence Captured: {evidence.length}
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Grid: 8 Items */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {evidence.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedIdx(index)}
            className="group rounded-xl border border-border-subtle bg-white hover:border-[#FF6600] hover:shadow-md transition-all duration-150 overflow-hidden cursor-pointer flex flex-col"
          >
            {/* Thumbnail Box */}
            <div className="relative h-36 bg-[#0C111D] overflow-hidden border-b border-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

              {/* Top overlay badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-white border border-white/20">
                  {item.id}
                </span>
              </div>

              {/* Status pill overlay */}
              <div className="absolute top-2 right-2">
                <StatusBadge status={item.status} size="sm" />
              </div>

              {/* Quick View hover button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="px-3 py-1.5 rounded-lg bg-white/95 text-navy-900 font-bold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <Eye size={13} className="text-[#FF6600]" />
                  <span>Inspect Screenshot</span>
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                  <span className="truncate">{item.stageName}</span>
                  <span className="font-mono">{formatTimestamp(item.timestamp).split(',')[1]}</span>
                </div>
                <h3 className="text-xs font-bold text-navy-900 group-hover:text-[#FF6600] transition-colors line-clamp-1 mt-0.5">
                  {item.title}
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.metadata.sizeKb} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(index);
                  }}
                  className="text-xs font-semibold text-[#FF6600] hover:text-[#E55B00] inline-flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <EvidenceViewer
        items={evidence}
        currentIndex={selectedIdx ?? 0}
        isOpen={selectedIdx !== null}
        onClose={() => setSelectedIdx(null)}
        onNavigate={(idx) => setSelectedIdx(idx)}
      />
    </div>
  );
};
