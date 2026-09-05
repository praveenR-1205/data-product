import React from 'react';
import { X, BookOpen, GitPullRequest, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { useApp } from '../../app/providers';

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen } = useApp();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#FF6600]" />
            <h2 className="text-base font-semibold text-text-primary">EJ Ingestion Platform Architecture Guide</h2>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-text-secondary max-h-[75vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ingestion Patterns</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-text-primary flex items-center gap-2">
                  <Layers size={14} className="text-[#FF6600]" />
                  S3 → Lambda → Databricks
                </div>
                <p className="text-xs text-text-secondary mt-1">Direct stream ingestion for micro-batch Parquet and Avro landing feeds.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-text-primary flex items-center gap-2">
                  <GitPullRequest size={14} className="text-[#FF6600]" />
                  S3 → SQS → Lambda → DBX
                </div>
                <p className="text-xs text-text-secondary mt-1">Buffered event-driven ingestion with backpressure protection and DLQ fallback.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Evidence & Compliance Gates</h3>
            <p className="text-xs leading-relaxed">
              Every end-to-end execution captures automated cryptographic evidence across 8 stages: Source Input, Pre-processing, SQS Acquisition, Jenkins Orchestration, Databricks Delta Commits, Great Expectations Validation, and Final Signoff Certificates.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Validation Rules</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-text-secondary">
              <li><strong className="text-text-primary">Schema:</strong> Delta catalog contract match.</li>
              <li><strong className="text-text-primary">Record Count:</strong> Strict zero-variance row matching against manifests.</li>
              <li><strong className="text-text-primary">Data Quality:</strong> Domain value validation, ISO timestamps, airport ICAO codes.</li>
              <li><strong className="text-text-primary">Rescue Data:</strong> Automated DLQ audit to ensure zero dropped records.</li>
            </ul>
          </div>

          <div className="p-3 bg-[#FFF2EB] border border-[#FFD2B8] rounded-lg text-xs text-[#B54708] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#FF6600] shrink-0" />
            <span>Need pipeline credentials or new source tenant onboarding? Reach out to #data-platform-core on Slack.</span>
          </div>
        </div>

        <div className="p-3 border-t border-border-subtle bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-mono">
            <Terminal size={12} />
            <span>CLI tool: agy-ingest-cli v2.4.0</span>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-3 py-1.5 bg-[#FF6600] text-white font-medium rounded-md hover:bg-[#E55B00] transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
