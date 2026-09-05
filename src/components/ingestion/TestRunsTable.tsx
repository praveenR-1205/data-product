import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  Camera,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Play,
  Share2,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { TestRun } from '../../types/testRun';
import { StatusBadge } from '../common/StatusBadge';
import { formatDuration, formatNumber, formatTimestamp } from '../../utils/formatters';
import { getEnvironmentBadgeStyle } from '../../utils/status';

interface TestRunsTableProps {
  testRuns: TestRun[];
  isLoading?: boolean;
  onReRunTest?: (id: string) => void;
}

type SortField = 'id' | 'startedAt' | 'durationMs' | 'recordCount' | 'status' | 'rescueCount';
type SortOrder = 'asc' | 'desc';

export const TestRunsTable: React.FC<TestRunsTableProps> = ({
  testRuns,
  isLoading,
  onReRunTest,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('startedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    source: true,
    pattern: true,
    environment: true,
    status: true,
    started: true,
    duration: true,
    records: true,
    rescue: true,
    evidence: true,
    actions: true,
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRuns = useMemo(() => {
    return [...testRuns].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'startedAt':
          comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
          break;
        case 'durationMs':
          comparison = a.durationMs - b.durationMs;
          break;
        case 'recordCount':
          comparison = a.recordCount - b.recordCount;
          break;
        case 'rescueCount':
          comparison = a.rescueCount - b.rescueCount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [testRuns, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedRuns.length / pageSize) || 1;
  const paginatedRuns = sortedRuns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Table Action Bar: Column toggle & Result summary */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-slate-50/70 text-xs">
        <div className="flex items-center gap-2 text-text-secondary font-medium">
          <span>Showing <strong className="text-navy-900">{testRuns.length}</strong> execution runs</span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs text-xs font-medium"
            title="Toggle column visibility"
          >
            <SlidersHorizontal size={13} />
            <span>Columns</span>
          </button>

          {isColumnPickerOpen && (
            <div className="absolute right-0 top-9 w-48 bg-white rounded-lg shadow-xl border border-border-subtle p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Visible Columns
              </div>
              <div className="space-y-1 mt-1">
                {Object.entries(visibleColumns).map(([col, isVisible]) => (
                  <label
                    key={col}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleColumn(col as keyof typeof visibleColumns)}
                      className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-[#F8F9FA] text-slate-600 font-semibold uppercase tracking-wider text-[11px] select-none">
              {visibleColumns.id && (
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Test Run ID</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.source && <th className="py-3 px-4">Source</th>}
              {visibleColumns.pattern && <th className="py-3 px-4">Pattern</th>}
              {visibleColumns.environment && <th className="py-3 px-4">Environment</th>}
              {visibleColumns.status && (
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.started && (
                <th
                  onClick={() => handleSort('startedAt')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Started</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.duration && (
                <th
                  onClick={() => handleSort('durationMs')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Duration</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.records && (
                <th
                  onClick={() => handleSort('recordCount')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Records</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.rescue && (
                <th
                  onClick={() => handleSort('rescueCount')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Rescue</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
              )}
              {visibleColumns.evidence && <th className="py-3 px-4">Evidence</th>}
              {visibleColumns.actions && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-normal">
            {paginatedRuns.map((run) => {
              const envStyle = getEnvironmentBadgeStyle(run.environment);
              return (
                <tr
                  key={run.id}
                  onClick={() => navigate(`/test-runs/${run.id}`)}
                  className="hover:bg-[#FFF9F5] transition-colors cursor-pointer group"
                >
                  {/* Test Run ID */}
                  {visibleColumns.id && (
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-navy-900 group-hover:text-[#FF6600] transition-colors">
                          {run.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(run.id, run.id, e)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                          title="Copy Run ID"
                        >
                          {copiedId === run.id ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-text-secondary truncate max-w-[200px] mt-0.5">
                        {run.testName}
                      </div>
                    </td>
                  )}

                  {/* Source */}
                  {visibleColumns.source && (
                    <td className="py-3.5 px-4 font-medium text-navy-900">
                      <div>{run.source}</div>
                      <div className="text-[10px] text-text-secondary font-mono">{run.sourceType}</div>
                    </td>
                  )}

                  {/* Pattern */}
                  {visibleColumns.pattern && (
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {run.pattern}
                      </span>
                    </td>
                  )}

                  {/* Environment */}
                  {visibleColumns.environment && (
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${envStyle.bg} ${envStyle.text} ${envStyle.border}`}
                      >
                        {run.environment}
                      </span>
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td className="py-3.5 px-4">
                      <StatusBadge status={run.status} size="sm" />
                    </td>
                  )}

                  {/* Started */}
                  {visibleColumns.started && (
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatTimestamp(run.startedAt)}
                    </td>
                  )}

                  {/* Duration */}
                  {visibleColumns.duration && (
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {formatDuration(run.durationMs)}
                    </td>
                  )}

                  {/* Records */}
                  {visibleColumns.records && (
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-navy-900">
                      {formatNumber(run.recordCount)}
                    </td>
                  )}

                  {/* Rescue */}
                  {visibleColumns.rescue && (
                    <td className="py-3.5 px-4 text-right font-mono">
                      {run.rescueCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3F2] text-[#F04438] border border-[#FECDCA]">
                          {run.rescueCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  )}

                  {/* Evidence */}
                  {visibleColumns.evidence && (
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        <Camera size={12} className="text-slate-500" />
                        <span>{run.evidenceCount} screenshots</span>
                      </div>
                    </td>
                  )}

                  {/* Actions */}
                  {visibleColumns.actions && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/test-runs/${run.id}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#FF6600] bg-[#FFF2EB] hover:bg-[#FFE5D6] rounded border border-[#FFD2B8] transition-colors"
                        >
                          View
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === run.id ? null : run.id)
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="More options"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {activeMenuId === run.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-border-subtle py-1 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onReRunTest?.(run.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Play size={13} className="text-[#FF6600]" />
                                <span>Re-run Test</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`/test-runs/${run.id}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Eye size={13} className="text-slate-500" />
                                <span>Inspect Pipeline</span>
                              </button>
                              <button
                                type="button"
                                onClick={(ev) => {
                                  setActiveMenuId(null);
                                  copyToClipboard(
                                    `s3://ej-compliance-evidence/${run.id}/`,
                                    's3-uri',
                                    ev
                                  );
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Share2 size={13} className="text-slate-500" />
                                <span>Copy S3 Evidence URI</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-border-subtle bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-border-subtle rounded text-xs text-slate-700 focus:outline-hidden"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">
            Page <strong className="text-navy-900">{currentPage}</strong> of{' '}
            <strong className="text-navy-900">{totalPages}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-border-subtle bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-[#FF6600] text-white shadow-xs'
                    : 'bg-white border border-border-subtle text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-border-subtle bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
