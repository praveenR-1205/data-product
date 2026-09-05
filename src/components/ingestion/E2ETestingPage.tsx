import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Activity } from 'lucide-react';
import { useApp } from '../../app/providers';
import { useTestRuns } from '../../hooks/useTestRuns';
import { useTestFilters } from '../../hooks/useTestFilters';
import { TestSummaryCards } from './TestSummaryCards';
import { TestFilters } from './TestFilters';
import { TestRunsTable } from './TestRunsTable';
import { NewTestDialog } from './NewTestDialog';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { CreateTestInput } from '../../types/testRun';
import { getEnvironmentBadgeStyle } from '../../utils/status';

export const E2ETestingPage: React.FC = () => {
  const { environment } = useApp();
  const navigate = useNavigate();

  const { filters, updateFilter, clearFilters, activeFilterCount } = useTestFilters(environment);
  const { testRuns, metrics, isLoading, error, refresh, createRun, reRunTest } = useTestRuns(filters);

  const [isNewTestOpen, setIsNewTestOpen] = useState<boolean>(false);

  const handleCreateTest = async (data: CreateTestInput, runImmediately: boolean) => {
    const newRun = await createRun(data);
    if (runImmediately) {
      navigate(`/test-runs/${newRun.id}`);
    }
  };

  const envStyle = getEnvironmentBadgeStyle(environment);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header (Section 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Ingestion E2E Testing
            </h1>
            {/* Compact environment indicator */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${envStyle.bg} ${envStyle.text} ${envStyle.border}`}
            >
              Environment: {environment}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            End-to-end validation workspace for data ingestion pipelines
          </p>
        </div>

        {/* Primary Action Button: [ New Test ] & Refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={refresh}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-border-subtle rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh test runs"
          >
            <RefreshCw size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsNewTestOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6600] hover:bg-[#E55B00] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors active:scale-98"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards (Section 7) */}
      <TestSummaryCards metrics={metrics} isLoading={isLoading && !metrics} />

      {/* Dynamic Filters Bar (Section 15) */}
      <TestFilters
        filters={filters}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Test Run Table (Section 9) */}
      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : isLoading && testRuns.length === 0 ? (
        <LoadingState message="Fetching ingestion test run records..." rows={8} />
      ) : testRuns.length === 0 ? (
        <EmptyState
          title="No Ingestion Test Runs Found"
          description="No execution runs match your current query. Try adjusting or clearing your filters, or initiate a new test run."
          onAction={clearFilters}
          onSecondaryAction={() => setIsNewTestOpen(true)}
        />
      ) : (
        <TestRunsTable
          testRuns={testRuns}
          isLoading={isLoading}
          onReRunTest={reRunTest}
        />
      )}

      {/* New Test Creation Modal (Section 12) */}
      <NewTestDialog
        isOpen={isNewTestOpen}
        onClose={() => setIsNewTestOpen(false)}
        onSubmitTest={handleCreateTest}
        defaultEnv={environment}
      />
    </div>
  );
};
