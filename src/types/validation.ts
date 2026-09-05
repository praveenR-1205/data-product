export type ValidationRuleStatus = 'PASS' | 'WARNING' | 'FAIL' | 'SKIPPED';

export interface ValidationRuleResult {
  id: string;
  category: 'Schema' | 'Record Count' | 'Mandatory Columns' | 'Duplicate Check' | 'Data Quality' | 'Rescue Data';
  name: string;
  status: ValidationRuleStatus;
  summary: string;
  expectedValue: string;
  actualValue: string;
  variance?: string;
  recordsEvaluated: number;
  failingRecordsCount: number;
  assertionSql?: string;
  description: string;
  discrepancies?: {
    primaryKey: string;
    column: string;
    expected: string;
    actual: string;
    ruleDescription: string;
  }[];
}

export interface ValidationSummary {
  testRunId: string;
  totalChecks: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  overallStatus: ValidationRuleStatus;
  executionDurationMs: number;
  timestamp: string;
  rules: ValidationRuleResult[];
}
