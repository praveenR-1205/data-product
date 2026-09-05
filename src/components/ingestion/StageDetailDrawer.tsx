import React, { useState } from 'react';
import {
  X,
  Clock,
  Terminal,
  Server,
  Layers,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Search,
} from 'lucide-react';
import { PipelineStage } from '../../types/pipeline';
import { StatusBadge } from '../common/StatusBadge';
import { formatDuration, formatNumber, formatTimestamp } from '../../utils/formatters';

interface StageDetailDrawerProps {
  stage: PipelineStage | null;
  onClose: () => void;
  onOpenEvidence?: (evidenceId: string) => void;
}

type TabType = 'overview' | 'payload' | 'logs';

export const StageDetailDrawer: React.FC<StageDetailDrawerProps> = ({
  stage,
  onClose,
  onOpenEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [logSearch, setLogSearch] = useState('');

  if (!stage) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const filteredLogs = stage.logs.filter((l) =>
    l.message.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-border-subtle">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {stage.order}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy-900">{stage.name}</h2>
                <StatusBadge status={stage.status} size="sm" />
              </div>
              <p className="text-xs text-text-secondary mt-0.5">{stage.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-border-subtle bg-white px-5 space-x-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Execution Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'payload'
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode size={14} />
            <span>I/O Payloads</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'logs'
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal size={14} />
            <span>Stage Logs ({stage.logs.length})</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Timing & Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</div>
                  <div className="text-base font-mono font-bold text-navy-900 mt-1">
                    {formatDuration(stage.durationMs)}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Records In</div>
                  <div className="text-base font-mono font-bold text-navy-900 mt-1">
                    {stage.recordsIn !== undefined ? formatNumber(stage.recordsIn) : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Records Out</div>
                  <div className="text-base font-mono font-bold text-navy-900 mt-1">
                    {stage.recordsOut !== undefined ? formatNumber(stage.recordsOut) : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume</div>
                  <div className="text-base font-mono font-bold text-navy-900 mt-1">
                    {stage.bytesProcessed || '—'}
                  </div>
                </div>
              </div>

              {/* Execution Target & Host */}
              <div className="p-4 bg-white border border-border-subtle rounded-xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Server size={14} className="text-[#FF6600]" />
                  <span>Compute & Execution Runtime</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-secondary">Target Host / Service:</span>
                    <div className="font-mono text-slate-800 mt-0.5 font-medium">{stage.computeTarget || 'AWS Lambda Runner'}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Category:</span>
                    <div className="font-medium text-slate-800 mt-0.5">{stage.category} Stage</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Started At:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{formatTimestamp(stage.startedAt)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Completed At:</span>
                    <div className="font-mono text-slate-800 mt-0.5">
                      {stage.completedAt ? formatTimestamp(stage.completedAt) : 'In Progress...'}
                    </div>
                  </div>
                </div>

                {/* Databricks Cluster Info if present */}
                {stage.clusterDetails && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg space-y-1.5 text-xs">
                    <div className="font-bold text-navy-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Databricks Cluster: {stage.clusterDetails.clusterName}</span>
                    </div>
                    <div className="text-text-secondary grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>Runtime: <span className="font-mono text-slate-800">{stage.clusterDetails.runtime}</span></div>
                      <div>Workers: <span className="font-mono text-slate-800">{stage.clusterDetails.workers} nodes</span></div>
                      <div className="col-span-2">Node Type: <span className="font-mono text-slate-800">{stage.clusterDetails.nodeType}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Link banner */}
              {stage.evidenceIdRef && (
                <div className="p-4 rounded-xl bg-[#FFF2EB] border border-[#FFD2B8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-[#FFD2B8] text-[#FF6600]">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900">Audit Evidence Captured</div>
                      <div className="text-[11px] text-[#B54708]">
                        Verified snapshot stored as reference {stage.evidenceIdRef}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEvidence?.(stage.evidenceIdRef!);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF6600] hover:bg-[#E55B00] text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    <span>View Evidence</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: I/O PAYLOADS */}
          {activeTab === 'payload' && (
            <div className="space-y-5">
              {/* Input Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Input Parameters
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(JSON.stringify(stage.inputPayload || {}, null, 2), 'input')
                    }
                    className="inline-flex items-center gap-1 text-xs text-[#FF6600] hover:text-[#E55B00]"
                  >
                    {copiedSection === 'input' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'input' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0C111D] text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-56 border border-slate-800">
                  {JSON.stringify(stage.inputPayload || { message: 'No input parameters' }, null, 2)}
                </pre>
              </div>

              {/* Output Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Output & Checksum Manifest
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(JSON.stringify(stage.outputPayload || {}, null, 2), 'output')
                    }
                    className="inline-flex items-center gap-1 text-xs text-[#FF6600] hover:text-[#E55B00]"
                  >
                    {copiedSection === 'output' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSection === 'output' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0C111D] text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto max-h-56 border border-slate-800">
                  {JSON.stringify(stage.outputPayload || { message: 'Pending execution completion' }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: STAGE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {/* Search within logs */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border-subtle rounded-md focus:outline-hidden focus:border-[#FF6600]"
                />
              </div>

              {/* Terminal Log Box */}
              <div className="bg-[#0C111D] rounded-lg border border-slate-800 p-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-4">No matching logs</div>
                ) : (
                  filteredLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span
                        className={`px-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                          log.level === 'INFO'
                            ? 'bg-blue-950 text-blue-400'
                            : log.level === 'WARN'
                            ? 'bg-amber-950 text-amber-400'
                            : log.level === 'ERROR'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-subtle bg-slate-50 flex items-center justify-between text-xs text-text-secondary">
          <span>Target Partition: 2026/09/04</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
