import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Share2,
  Copy,
  Check,
  Download,
  Terminal,
  Database,
  GitBranch,
  FileCheck,
  Layers,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react';
import { TestRun } from '../../types/testRun';
import { PipelineStage } from '../../types/pipeline';
import { ValidationSummary } from '../../types/validation';
import { EvidenceItem, AIAnalysis } from '../../types/evidence';
import { ingestionTestService } from '../../services/ingestionTestService';
import { StatusBadge } from '../common/StatusBadge';
import { PipelineJourney } from './PipelineJourney';
import { ValidationResults } from './ValidationResults';
import { EvidenceGallery } from './EvidenceGallery';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { formatDuration, formatNumber, formatTimestamp } from '../../utils/formatters';
import { getEnvironmentBadgeStyle } from '../../utils/status';

export const TestRunDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isReRunning, setIsReRunning] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [run, stgs, val, ev] = await Promise.all([
        ingestionTestService.getTestRun(id),
        ingestionTestService.getPipelineStages(id),
        ingestionTestService.getValidationResults(id),
        ingestionTestService.getEvidence(id),
      ]);

      if (!run) {
        setError(`Test run ${id} was not found in the ingestion catalog.`);
      } else {
        setTestRun(run);
        setStages(stgs);
        setValidation(val);
        setEvidence(ev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test execution details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyId = () => {
    if (!testRun) return;
    navigator.clipboard.writeText(testRun.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReRun = async () => {
    if (!id) return;
    setIsReRunning(true);
    try {
      await ingestionTestService.startTest(id);
      await loadData();
    } finally {
      setIsReRunning(false);
    }
  };



  if (isLoading) {
    return <LoadingState message={`Fetching orchestration telemetry for ${id}...`} rows={6} />;
  }

  if (error || !testRun) {
    return (
      <div className="space-y-4">
        <Link
          to="/test-runs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#FF6600]"
        >
          <ArrowLeft size={14} />
          <span>Back to Ingestion E2E Testing</span>
        </Link>
        <div className="p-8 bg-white rounded-xl border border-border-subtle text-center space-y-3">
          <h2 className="text-base font-bold text-navy-900">Execution Run Not Found</h2>
          <p className="text-xs text-text-secondary">{error || 'Test run could not be found'}</p>
          <button
            onClick={() => navigate('/test-runs')}
            className="px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#E55B00]"
          >
            Return to Ingestion E2E Testing
          </button>
        </div>
      </div>
    );
  }

  const envStyle = getEnvironmentBadgeStyle(testRun.environment);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back to main workspace link */}
      <div className="flex items-center justify-between">
        <Link
          to="/test-runs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#FF6600] group transition-colors"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-[#FF6600]"
          />
          <span>Back to Ingestion E2E Testing</span>
        </Link>
      </div>

      {/* Execution Page Header Card */}
      <div className="bg-white rounded-xl border border-border-subtle p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xl font-extrabold text-navy-900 tracking-tight">
                {testRun.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                title="Copy Run ID"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
              <StatusBadge status={testRun.status} size="lg" />
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${envStyle.bg} ${envStyle.text} ${envStyle.border}`}
              >
                {testRun.environment}
              </span>
            </div>
            <h1 className="text-lg font-bold text-navy-900 mt-1">{testRun.testName}</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isReRunning}
              onClick={handleReRun}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF6600] hover:bg-[#E55B00] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play size={13} className="fill-white" />
              <span>{isReRunning ? 'Rerunning...' : 'Re-run Test'}</span>
            </button>
          </div>
        </div>

        {/* Key Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border-subtle text-xs">
          <div className="col-span-1 sm:col-span-2">
            <span className="text-text-secondary block">Ingestion Pattern</span>
            <span className="font-mono font-medium text-slate-800 mt-0.5 block truncate">
              {testRun.pattern}
            </span>
          </div>
          <div>
            <span className="text-text-secondary block">Started</span>
            <span className="font-medium text-slate-800 mt-0.5 block whitespace-nowrap">
              {formatTimestamp(testRun.startedAt)}
            </span>
          </div>
          <div>
            <span className="text-text-secondary block">Duration</span>
            <span className="font-mono font-bold text-navy-900 mt-0.5 block">
              {formatDuration(testRun.durationMs)}
            </span>
          </div>
          <div>
            <span className="text-text-secondary block">Target Table</span>
            <span className="font-mono text-slate-800 mt-0.5 block truncate">
              {testRun.targetTable}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: E2E Pipeline Visualization (Databricks / Step Functions DAG) */}
      <PipelineJourney
        stages={stages}
        onOpenEvidence={(evId) => {
          const el = document.getElementById('evidence-center');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* SECTION 2: Validation Results */}
      <ValidationResults summary={validation} />

      {/* SECTION 3: Evidence Center Inside Test Details */}
      <div id="evidence-center">
        <EvidenceGallery evidence={evidence} />
      </div>
    </div>
  );
};
