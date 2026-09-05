import { PipelineStageId } from './pipeline';

export interface EvidenceItem {
  id: string;
  testRunId: string;
  stageId: PipelineStageId;
  stageName: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'Passed' | 'Failed' | 'Warning' | 'Info';
  s3Uri: string;
  sha256Hash: string;
  capturedBy: string;
  dimensions?: { width: number; height: number };
  contentType: 'screenshot' | 'log_snapshot' | 'data_diff' | 'metric_dump';
  imageUrl: string;
  metadata: {
    targetSystem: string;
    endpointOrTable: string;
    operator: string;
    sizeKb: number;
    durationMs?: number;
    tags: string[];
  };
}

export interface AIAnalysis {
  testRunId: string;
  status: 'HEALTHY' | 'PASS WITH WARNING' | 'ROOT CAUSE IDENTIFIED' | 'CRITICAL FAILURE';
  confidencePct: number;
  finding: string;
  likelyCause: string;
  recommendation: string;
  impactAssessment: string;
  evidenceReferences: {
    evidenceId: string;
    label: string;
    excerpt: string;
  }[];
  generatedAt: string;
  modelVersion: string;
}
