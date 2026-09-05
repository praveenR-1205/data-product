import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Layers } from 'lucide-react';
import { SummaryMetrics } from '../../types/testRun';

interface TestSummaryCardsProps {
  metrics: SummaryMetrics | null;
  isLoading?: boolean;
}

export const TestSummaryCards: React.FC<TestSummaryCardsProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-border-subtle p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 select-none">
      {/* 1. Total Tests */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tests</span>
          <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
            <Layers size={15} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">{metrics.totalTests}</span>
        </div>
        <div className="mt-2 text-[11px] text-text-secondary">All execution runs logged</div>
      </div>

      {/* 2. Passed */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Passed</span>
          <div className="p-1.5 rounded-md bg-[#ECFDF3] text-[#12B76A]">
            <CheckCircle2 size={15} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">{metrics.passedCount}</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span>Target compliance met</span>
        </div>
      </div>

      {/* 3. Failed */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Failed</span>
          <div className="p-1.5 rounded-md bg-[#FEF3F2] text-[#F04438]">
            <XCircle size={15} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">{metrics.failedCount}</span>
        </div>
        <div className="mt-2 text-[11px] text-red-600 font-medium">Schema / DLQ breaches</div>
      </div>

      {/* 4. Warnings */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Warnings</span>
          <div className="p-1.5 rounded-md bg-[#FFFAEB] text-[#F79009]">
            <AlertTriangle size={15} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">{metrics.warningCount}</span>
        </div>
        <div className="mt-2 text-[11px] text-amber-600 font-medium">Data quality anomalies</div>
      </div>

      {/* 5. Average Duration */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between text-text-secondary">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Duration</span>
          <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
            <Clock size={15} />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-navy-900 tracking-tight">{metrics.avgDurationFormatted}</span>
        </div>
        <div className="mt-2 text-[11px] text-text-secondary">Across all stages & workers</div>
      </div>
    </div>
  );
};
