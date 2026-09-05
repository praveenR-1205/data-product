import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Database,
  FileCheck,
  AlertTriangle,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { ValidationRuleResult, ValidationSummary } from '../../types/validation';
import { StatusBadge } from '../common/StatusBadge';
import { formatNumber } from '../../utils/formatters';

interface ValidationResultsProps {
  summary: ValidationSummary | null;
  isLoading?: boolean;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ summary, isLoading }) => {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>('VAL-005'); // Default expand the warning

  if (isLoading || !summary) {
    return (
      <div className="bg-white rounded-xl border border-border-subtle p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-40 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  const toggleRow = (ruleId: string) => {
    setExpandedRuleId(expandedRuleId === ruleId ? null : ruleId);
  };

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">Validation Results</h2>
            <StatusBadge status={summary.overallStatus} isValidation size="sm" />
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Great Expectations automated assertion matrix against target Delta Lake table
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
            <CheckCircle2 size={13} />
            <span>{summary.passedCount} Passed</span>
          </span>
          {summary.warningCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
              <AlertTriangle size={13} />
              <span>{summary.warningCount} Warning</span>
            </span>
          )}
        </div>
      </div>

      {/* Validation Table as requested in Section 13 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-[#F8F9FA] text-slate-600 font-semibold uppercase tracking-wider text-[11px] select-none">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Validation</th>
              <th className="py-3 px-4">Result</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Records Evaluated</th>
              <th className="py-3 px-4 text-right">Drilldown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {summary.rules.map((rule: ValidationRuleResult) => {
              const isExpanded = expandedRuleId === rule.id;
              return (
                <React.Fragment key={rule.id}>
                  <tr
                    onClick={() => toggleRow(rule.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded
                        ? 'bg-slate-50'
                        : 'hover:bg-[#FFF9F5]'
                    }`}
                  >
                    {/* Expand Chevron */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>

                    {/* Validation Name & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-900">{rule.category}</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{rule.name}</div>
                    </td>

                    {/* Result Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rule.status} isValidation size="sm" />
                    </td>

                    {/* Details column (e.g. Matched, 10,000, 100%, 0, 12 rows, 0) */}
                    <td className="py-3.5 px-4 font-mono font-medium text-navy-900">
                      <span className={rule.status === 'WARNING' ? 'text-amber-700 font-bold' : ''}>
                        {rule.summary}
                      </span>
                    </td>

                    {/* Records Evaluated */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatNumber(rule.recordsEvaluated)}
                    </td>

                    {/* Drilldown indicator */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(rule.id);
                        }}
                        className="text-xs font-semibold text-[#FF6600] hover:text-[#E55B00]"
                      >
                        {isExpanded ? 'Hide Details' : 'View Assertion'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={6} className="p-4 pl-12 border-b border-border-subtle">
                        <div className="space-y-4 max-w-4xl">
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {rule.description}
                          </p>

                          {/* Expected vs Actual */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Expected Specification
                              </span>
                              <div className="font-mono font-medium text-navy-900 mt-1">
                                {rule.expectedValue}
                              </div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Actual Result
                              </span>
                              <div
                                className={`font-mono font-medium mt-1 ${
                                  rule.status === 'WARNING' ? 'text-amber-700 font-bold' : 'text-emerald-700'
                                }`}
                              >
                                {rule.actualValue}
                              </div>
                            </div>
                          </div>

                          {/* Assertion SQL Query */}
                          {rule.assertionSql && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                <Code2 size={13} className="text-[#FF6600]" />
                                <span>Verification SQL Assertion</span>
                              </div>
                              <pre className="p-3 bg-[#0C111D] text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                                {rule.assertionSql}
                              </pre>
                            </div>
                          )}

                          {/* Discrepancies Sample Table if present */}
                          {rule.discrepancies && rule.discrepancies.length > 0 && (
                            <div className="space-y-2 mt-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                                <AlertTriangle size={13} className="text-amber-600" />
                                <span>Sample Rejected / Flagged Rows ({rule.failingRecordsCount} Total)</span>
                              </div>
                              <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-amber-50/70 border-b border-amber-200 text-amber-900 font-semibold text-[11px]">
                                      <th className="py-2 px-3">Primary Key</th>
                                      <th className="py-2 px-3">Column</th>
                                      <th className="py-2 px-3">Expected</th>
                                      <th className="py-2 px-3">Actual Value</th>
                                      <th className="py-2 px-3">Rule Violation</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {rule.discrepancies.map((d, i) => (
                                      <tr key={i} className="hover:bg-amber-50/30">
                                        <td className="py-2 px-3 font-bold text-navy-900">{d.primaryKey}</td>
                                        <td className="py-2 px-3 text-slate-600">{d.column}</td>
                                        <td className="py-2 px-3 text-emerald-700">{d.expected}</td>
                                        <td className="py-2 px-3 text-red-600 font-bold bg-red-50/50">{d.actual}</td>
                                        <td className="py-2 px-3 text-slate-500 font-sans">{d.ruleDescription}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
