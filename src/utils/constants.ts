import { Environment, FileFormat, IngestionPattern, ValidationProfile } from '../types/testRun';

export const APP_NAME = 'EJ Data Ingestion Hub';

export const ENVIRONMENTS: Environment[] = ['DEV', 'PREPROD', 'PROD'];

export const INGESTION_PATTERNS: IngestionPattern[] = [
  'S3 → Lambda → S3 → Databricks',
  'SQS → Lambda → S3 → Databricks',
];


export const PIPELINE_STAGE_DEFINITIONS = [
  { id: 'test_input', name: 'Test Input', subtitle: 'Synthetic test dataset generation' },
  { id: 'source', name: 'Source', subtitle: 'S3 drop & SQS arrival event' },
  { id: 'preprocessing', name: 'Pre-processing', subtitle: 'Antivirus scan & manifest parse' },
  { id: 'acquisition', name: 'Acquisition', subtitle: 'AWS Lambda partition dispatch' },
  { id: 'jenkins', name: 'Jenkins', subtitle: 'CI/CD pipeline orchestrator #4182' },
  { id: 'databricks', name: 'Databricks', subtitle: 'Delta Live Tables Spark job' },
  { id: 'validation', name: 'Validation', subtitle: 'Great Expectations & reconciliation' },
  { id: 'evidence', name: 'Evidence', subtitle: 'Multi-stage audit capture' },
  { id: 'final_result', name: 'Final Result', subtitle: 'Verdict & notification dispatch' },
] as const;
