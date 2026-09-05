import React, { useState } from 'react';
import {
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  GitBranch,
  Sparkles,
  CheckCheck,
  Camera,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PipelineStage, PipelineStageId } from '../../types/pipeline';
import { StatusBadge } from '../common/StatusBadge';
import { StageDetailDrawer } from './StageDetailDrawer';
import { formatDuration } from '../../utils/formatters';

interface PipelineJourneyProps {
  stages: PipelineStage[];
  onOpenEvidence?: (evidenceId: string) => void;
}

const STAGE_ICONS: Record<PipelineStageId, React.ReactNode> = {
  test_input: <Layers size={18} />,
  source: <Database size={18} />,
  preprocessing: <ShieldCheck size={18} />,
  acquisition: <Cpu size={18} />,
  jenkins: <GitBranch size={18} />,
  databricks: <Sparkles size={18} />,
  validation: <CheckCheck size={18} />,
  evidence: <Camera size={18} />,
  final_result: <Award size={18} />,
};

export const PipelineJourney: React.FC<PipelineJourneyProps> = ({
  stages,
  onOpenEvidence,
}) => {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [viewMode, setViewMode] = useState<'dag' | 'linear'>('dag');

  // Helper for node border & background based on stage status
  const getNodeStyles = (status: PipelineStage['status']) => {
    switch (status) {
      case 'Passed':
        return {
          border: 'border-[#ABEFC6] hover:border-[#12B76A]',
          bg: 'bg-white',
          headerBg: 'bg-[#ECFDF3]',
          iconColor: 'text-[#12B76A]',
          dotBg: 'bg-[#12B76A]',
          glow: '',
        };
      case 'Warning':
        return {
          border: 'border-[#FEDF89] hover:border-[#F79009]',
          bg: 'bg-white',
          headerBg: 'bg-[#FFFAEB]',
          iconColor: 'text-[#F79009]',
          dotBg: 'bg-[#F79009]',
          glow: '',
        };
      case 'Failed':
        return {
          border: 'border-[#FECDCA] hover:border-[#F04438]',
          bg: 'bg-white',
          headerBg: 'bg-[#FEF3F2]',
          iconColor: 'text-[#F04438]',
          dotBg: 'bg-[#F04438]',
          glow: '',
        };
      case 'Running':
        return {
          border: 'border-[#FFD2B8] hover:border-[#FF6600]',
          bg: 'bg-white',
          headerBg: 'bg-[#FFF2EB]',
          iconColor: 'text-[#FF6600]',
          dotBg: 'bg-[#FF6600] animate-ping',
          glow: 'ring-2 ring-[#FF6600]/30 shadow-md',
        };
      case 'Pending':
      default:
        return {
          border: 'border-slate-200 hover:border-slate-300',
          bg: 'bg-slate-50/60',
          headerBg: 'bg-slate-100',
          iconColor: 'text-slate-400',
          dotBg: 'bg-slate-300',
          glow: '',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">
              E2E Pipeline Orchestration Flow
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 font-mono">
              9 STAGES
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Step Functions & Databricks Jobs execution graph.
          </p>
        </div>
      </div>

      {/* DAG / FLOW GRAPH VIEW (Step Functions & Databricks Jobs Style) */}
      <div className="p-4 bg-[#F8F9FB] rounded-xl border border-slate-200/80 overflow-x-auto min-h-[220px]">
        <div className="flex items-center min-w-max space-x-3 py-2 px-1">
          {stages.map((stage, idx) => {
            const styles = getNodeStyles(stage.status);
            const isLast = idx === stages.length - 1;

            return (
              <React.Fragment key={stage.id}>
                {/* Step Functions / Databricks Task Card */}
                <div
                  onClick={() => setSelectedStage(stage)}
                  className={`w-48 shrink-0 rounded-xl border ${styles.border} ${styles.bg} ${styles.glow} shadow-2xs hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col overflow-hidden group select-none`}
                >
                  {/* Card Header with Category & Step Number */}
                  <div className={`px-3 py-2 flex items-center justify-between border-b border-inherit ${styles.headerBg}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {stage.order}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {stage.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${styles.dotBg}`} />
                      <span className="text-[10px] font-semibold text-slate-600">
                        {stage.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 shrink-0 ${styles.iconColor}`}>
                          {STAGE_ICONS[stage.id]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-navy-900 group-hover:text-[#FF6600] transition-colors leading-tight">
                            {stage.name}
                          </div>
                          <div className="text-[10px] text-text-secondary line-clamp-1 mt-0.5">
                            {stage.computeTarget || stage.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer metrics inside card */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-600 font-medium">
                        {stage.durationMs > 0 ? formatDuration(stage.durationMs) : 'Pending'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStage(stage);
                        }}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF6600] hover:text-[#E55B00]"
                      >
                        <span>Inspect</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step Connector Line with animated flow pulse */}
                {!isLast && (
                  <div className="flex items-center justify-center shrink-0 w-8">
                    <div className="relative flex items-center justify-center w-full">
                      <div className="h-0.5 w-full bg-slate-300" />
                      <ChevronRight
                        size={16}
                        className="absolute text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend & Hint */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" /> Passed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6600]" /> Running / Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F79009]" /> Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F04438]" /> Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Pending
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <Info size={13} />
          <span>Click on any stage box to inspect I/O payloads & terminal logs</span>
        </div>
      </div>

      {/* Stage Detail Drawer */}
      <StageDetailDrawer
        stage={selectedStage}
        onClose={() => setSelectedStage(null)}
        onOpenEvidence={onOpenEvidence}
      />
    </div>
  );
};
