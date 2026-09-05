export type Environment = 'DEV' | 'PREPROD' | 'PROD';

export type TestStatus = 'Passed' | 'Failed' | 'Warning' | 'Running' | 'Pending' | 'Skipped';

export type IngestionPattern =
  | 'S3 → Lambda → S3 → Databricks'
  | 'SQS → Lambda → S3 → Databricks';

export type FileFormat = 'Parquet' | 'CSV' | 'JSON';

export type ValidationProfile =
  | 'Strict Production'
  | 'Schema & Counts Only'
  | 'Full Reconciliation + Data Quality'
  | 'Pre-Release Smoke';

export interface TestRun {
  id: string;
  testName: string;
  source: string;
  sourceType: 'S3 Object' | 'SQS Queue' | 'API Stream' | 'Database CDC';
  pattern: IngestionPattern;
  environment: Environment;
  status: TestStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  recordCount: number;
  rescueCount: number;
  evidenceCount: number;
  triggeredBy: string;
  targetTable: string;
  fileFormat: FileFormat;
  validationProfile: ValidationProfile;
  tags?: string[];
  gitBranch?: string;
  commitHash?: string;
  uploadedFileName?: string;
}

export interface TestRunFilters {
  searchQuery: string;
  environment: Environment | 'ALL';
  status: TestStatus | 'ALL';
  source: string | 'ALL';
  pattern: IngestionPattern | 'ALL';
  dateRange: 'ALL' | 'TODAY' | '7D' | '30D' | 'CUSTOM';
}

export interface SummaryMetrics {
  totalTests: number;
  totalChangePct: number;
  passedCount: number;
  passedPct: number;
  failedCount: number;
  failedPct: number;
  warningCount: number;
  warningPct: number;
  avgDurationFormatted: string;
  avgDurationSec: number;
  trend: {
    name: string;
    passed: number;
    failed: number;
    warning: number;
  }[];
}

export interface CreateTestInput {
  testName: string;
  source?: string;
  environment: Environment;
  pattern: IngestionPattern;
  fileFormat: FileFormat;
  targetTable: string;
  expectedRecordCount?: number;
  validationProfile?: ValidationProfile;
  notifyOnFailure?: boolean;
  notificationEmail?: string;
  tags?: string;
  uploadedFileName?: string;
}
