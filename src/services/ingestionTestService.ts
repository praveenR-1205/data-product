import { CreateTestInput, Environment, SummaryMetrics, TestRun, TestRunFilters } from '../types/testRun';
import { PipelineStage } from '../types/pipeline';
import { ValidationSummary } from '../types/validation';
import { EvidenceItem } from '../types/evidence';
import { generatePipelineStages, generateValidationSummary, generateEvidenceItems } from './pipelineGenerators';
import { formatDuration } from '../utils/formatters';

const STORAGE_KEY = 'ej_data_ingestion_runs_v4';

class IngestionTestService {
  private testRuns: TestRun[] = [];
  private pipelineStagesMap: Map<string, PipelineStage[]> = new Map();
  private validationSummaryMap: Map<string, ValidationSummary> = new Map();
  private evidenceMap: Map<string, EvidenceItem[]> = new Map();

  constructor() {
    this.initData();
  }

  private initData(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.testRuns = JSON.parse(saved);
      } catch {
        this.testRuns = [];
      }
    } else {
      this.testRuns = [];
      this.persist();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.testRuns));
    } catch (err) {
      console.warn('Failed to persist test runs to localStorage', err);
    }
  }

  private delay(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTestRuns(filters?: Partial<TestRunFilters>): Promise<TestRun[]> {
    await this.delay(80);
    let runs = [...this.testRuns];

    if (!filters) return runs;

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      runs = runs.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.testName.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.targetTable.toLowerCase().includes(q) ||
          r.triggeredBy.toLowerCase().includes(q)
      );
    }

    if (filters.environment && filters.environment !== 'ALL') {
      runs = runs.filter((r) => r.environment === filters.environment);
    }

    if (filters.status && filters.status !== 'ALL') {
      runs = runs.filter((r) => r.status === filters.status);
    }

    if (filters.source && filters.source !== 'ALL') {
      runs = runs.filter((r) => r.source === filters.source);
    }

    if (filters.pattern && filters.pattern !== 'ALL') {
      runs = runs.filter((r) => r.pattern === filters.pattern);
    }

    return runs;
  }

  async getTestRun(id: string): Promise<TestRun | null> {
    await this.delay(80);
    const found = this.testRuns.find((r) => r.id === id);
    return found || null;
  }

  async createTestRun(input: CreateTestInput): Promise<TestRun> {
    await this.delay(150);
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newId = `TR-${year}-${randomNum}`;

    const sourceName = input.source || 'Data Engineering File Ingestion';
    const recordCountVal = input.expectedRecordCount || 10000;
    const valProf = input.validationProfile || 'Strict Production';

    const newRun: TestRun = {
      id: newId,
      testName: input.testName || `${sourceName} E2E Ingestion Test`,
      source: sourceName,
      sourceType: input.pattern.includes('SQS') ? 'SQS Queue' : 'S3 Object',
      pattern: input.pattern,
      environment: input.environment,
      status: 'Running',
      startedAt: new Date().toISOString(),
      durationMs: 45000,
      recordCount: recordCountVal,
      rescueCount: 0,
      evidenceCount: 3,
      triggeredBy: 'praveen.radhakrishnan@easyjet.com',
      targetTable: input.targetTable,
      fileFormat: input.fileFormat,
      validationProfile: valProf,
      uploadedFileName: input.uploadedFileName,
      tags: input.tags ? input.tags.split(',').map((t) => t.trim()) : ['adhoc', 'e2e-pipeline'],
      gitBranch: 'main',
      commitHash: 'a1b2c3d',
    };

    this.testRuns.unshift(newRun);
    this.persist();

    // Generate dynamic pipeline stages, validations, and evidence for this test run
    const dynamicStages = generatePipelineStages(newId, input);
    this.pipelineStagesMap.set(newId, dynamicStages);

    const dynamicValidation = generateValidationSummary(newId, input);
    this.validationSummaryMap.set(newId, dynamicValidation);

    const dynamicEvidence = generateEvidenceItems(newId, input);
    this.evidenceMap.set(newId, dynamicEvidence);

    return newRun;
  }

  async getPipelineStages(id: string): Promise<PipelineStage[]> {
    await this.delay(100);
    if (this.pipelineStagesMap.has(id)) {
      return this.pipelineStagesMap.get(id)!;
    }
    const run = this.testRuns.find((r) => r.id === id);
    const stages = generatePipelineStages(id, run ? {
      targetTable: run.targetTable,
      source: run.source,
      pattern: run.pattern,
      expectedRecordCount: run.recordCount,
    } : undefined);
    this.pipelineStagesMap.set(id, stages);
    return stages;
  }

  async getValidationResults(id: string): Promise<ValidationSummary | null> {
    await this.delay(90);
    if (this.validationSummaryMap.has(id)) {
      return this.validationSummaryMap.get(id)!;
    }
    const run = this.testRuns.find((r) => r.id === id);
    const summary = generateValidationSummary(id, run ? {
      targetTable: run.targetTable,
      expectedRecordCount: run.recordCount,
    } : undefined);
    this.validationSummaryMap.set(id, summary);
    return summary;
  }

  async getEvidence(id: string): Promise<EvidenceItem[]> {
    await this.delay(100);
    if (this.evidenceMap.has(id)) {
      return this.evidenceMap.get(id)!;
    }
    const run = this.testRuns.find((r) => r.id === id);
    const evidence = generateEvidenceItems(id, run ? {
      targetTable: run.targetTable,
      expectedRecordCount: run.recordCount,
    } : undefined);
    this.evidenceMap.set(id, evidence);
    return evidence;
  }

  async startTest(id: string): Promise<void> {
    await this.delay(120);
    const index = this.testRuns.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.testRuns[index].status = 'Running';
      this.testRuns[index].startedAt = new Date().toISOString();
      this.persist();
    }
  }

  async getSummaryMetrics(env?: Environment | 'ALL'): Promise<SummaryMetrics> {
    await this.delay(50);
    const runs = (!env || env === 'ALL')
      ? this.testRuns
      : this.testRuns.filter((r) => r.environment === env);

    const total = runs.length;
    const passed = runs.filter((r) => r.status === 'Passed').length;
    const failed = runs.filter((r) => r.status === 'Failed').length;
    const warning = runs.filter((r) => r.status === 'Warning').length;

    const totalDurationMs = runs.reduce((acc, r) => acc + (r.durationMs || 0), 0);
    const avgDurationMs = total > 0 ? Math.round(totalDurationMs / total) : 0;

    return {
      totalTests: total,
      totalChangePct: 0,
      passedCount: passed,
      passedPct: total > 0 ? (passed / total) * 100 : 0,
      failedCount: failed,
      failedPct: total > 0 ? (failed / total) * 100 : 0,
      warningCount: warning,
      warningPct: total > 0 ? (warning / total) * 100 : 0,
      avgDurationFormatted: formatDuration(avgDurationMs),
      avgDurationSec: Math.round(avgDurationMs / 1000),
      trend: [],
    };
  }

  async resetData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.testRuns = [];
    this.persist();
  }
}

export const ingestionTestService = new IngestionTestService();
