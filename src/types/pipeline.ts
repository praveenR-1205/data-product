import { TestStatus } from './testRun';

export type PipelineStageId =
  | 'test_input'
  | 'source'
  | 'preprocessing'
  | 'acquisition'
  | 'jenkins'
  | 'databricks'
  | 'validation'
  | 'evidence'
  | 'final_result';

export interface StageLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  sourceModule?: string;
}

export interface PipelineStage {
  id: PipelineStageId;
  order: number;
  name: string;
  subtitle: string;
  category: 'Trigger' | 'Ingestion' | 'Compute' | 'Quality' | 'Verdict';
  status: TestStatus;
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  recordsIn?: number;
  recordsOut?: number;
  bytesProcessed?: string;
  computeTarget?: string;
  clusterDetails?: {
    clusterName: string;
    runtime: string;
    workers: number;
    nodeType: string;
  };
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  logs: StageLogEntry[];
  evidenceIdRef?: string;
}
