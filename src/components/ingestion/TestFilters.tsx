import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { TestRunFilters, TestStatus } from '../../types/testRun';

interface TestFiltersProps {
  filters: TestRunFilters;
  onUpdateFilter: <K extends keyof TestRunFilters>(key: K, value: TestRunFilters[K]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const STATUS_OPTIONS: { label: string; value: TestStatus | 'ALL' }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Passed', value: 'Passed' },
  { label: 'Warning', value: 'Warning' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Running', value: 'Running' },
  { label: 'Pending', value: 'Pending' },
];

export const TestFilters: React.FC<TestFiltersProps> = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  activeFilterCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-border-subtle p-3.5 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test run ID, name, source table, or operator..."
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs text-text-primary placeholder-text-secondary bg-surface-muted border border-border-subtle rounded-lg focus:outline-hidden focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilter('searchQuery', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns (Status & Date) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onUpdateFilter('status', e.target.value as TestStatus | 'ALL')}
              className="appearance-none pl-3 pr-8 py-2 bg-surface-muted border border-border-subtle rounded-lg text-xs font-medium text-text-primary hover:bg-slate-50 focus:outline-hidden focus:border-[#FF6600] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Status: {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </div>
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => onUpdateFilter('dateRange', e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 bg-surface-muted border border-border-subtle rounded-lg text-xs font-medium text-text-primary hover:bg-slate-50 focus:outline-hidden focus:border-[#FF6600] cursor-pointer"
            >
              <option value="ALL">Date: All Time</option>
              <option value="TODAY">Date: Today</option>
              <option value="7D">Date: Last 7 Days</option>
              <option value="30D">Date: Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </div>
          </div>

          {/* Clear Filters button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              <RotateCcw size={12} />
              <span>Clear Filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
