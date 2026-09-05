import { PipelineStage } from '../types/pipeline';
import { ValidationSummary } from '../types/validation';
import { EvidenceItem } from '../types/evidence';
import { CreateTestInput } from '../types/testRun';

// Helper to generate clean, high-fidelity SVGs representing real-time telemetry screenshots
function createSvgScreenshot(title: string, subtitle: string, accentColor: string, lines: string[]): string {
  const lineSvg = lines
    .map((l, idx) => `<text x="24" y="${120 + idx * 26}" font-family="JetBrains Mono, monospace" font-size="13" fill="#94A3B8">${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="100%" height="100%">
    <rect width="900" height="500" fill="#0C111D" rx="10"/>
    <rect width="900" height="42" fill="#141D30" rx="10 10 0 0"/>
    <circle cx="24" cy="21" r="6" fill="#F04438"/>
    <circle cx="44" cy="21" r="6" fill="#F79009"/>
    <circle cx="64" cy="21" r="6" fill="#12B76A"/>
    <text x="96" y="26" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0">${title}</text>
    <rect x="740" y="10" width="136" height="22" rx="4" fill="${accentColor}22" stroke="${accentColor}" stroke-width="1"/>
    <text x="808" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${accentColor}">EVIDENCE SNAPSHOT</text>
    <rect x="0" y="42" width="900" height="36" fill="#101828" stroke="#1E293B" stroke-width="1"/>
    <text x="24" y="65" font-family="Inter, sans-serif" font-size="12" fill="#98A2B3">${subtitle}</text>
    <rect x="16" y="90" width="868" height="390" fill="#0B0F19" rx="6" stroke="#1E293B" stroke-width="1"/>
    ${lineSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Dynamically generates 9 sequential enterprise pipeline stages based on test input parameters.
 */
export function generatePipelineStages(runId: string, input?: Partial<CreateTestInput>): PipelineStage[] {
  const targetTable = input?.targetTable || 'bronze_flight_events';
  const sourceName = input?.source || 'File Ingestion';
  const pattern = input?.pattern || 'S3 → Lambda → S3 → Databricks';
  const recordCount = input?.expectedRecordCount || 10000;
  const isSqs = pattern.includes('SQS');

  return [
    {
      id: 'test_input',
      order: 1,
      name: 'Test Input',
      subtitle: 'Generate synthetic batch manifest & test payload',
      category: 'Trigger',
      status: 'Passed',
      durationMs: 14200,
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date(Date.now() - 285000).toISOString(),
      recordsIn: recordCount,
      recordsOut: recordCount,
      bytesProcessed: '4.82 MB',
      computeTarget: 'ej-test-harness-runner-01',
      inputPayload: {
        testRunId: runId,
        targetDomain: sourceName,
        seedRecords: recordCount,
        distributionProfile: 'easyJet-EU-UK-v2',
        destinationBucket: 's3://ej-data-platform-dev-ingest/raw/',
      },
      outputPayload: {
        manifestHash: `sha256:${runId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        generatedFiles: ['batch_chunk_001.parquet', 'batch_chunk_002.parquet'],
        totalSizeKb: 4935,
        recordsSynthesized: recordCount,
      },
      logs: [
        { timestamp: '10:30:15.102', level: 'INFO', message: `Initializing test execution harness for [${sourceName}]` },
        { timestamp: '10:30:17.340', level: 'INFO', message: `Synthesizing ${recordCount.toLocaleString()} deterministic records` },
        { timestamp: '10:30:28.940', level: 'INFO', message: 'Generated Parquet chunks totaling 4.82 MB' },
        { timestamp: '10:30:29.190', level: 'INFO', message: 'Test Input stage completed successfully' },
      ],
      evidenceIdRef: `EV-${runId}-101`,
    },
    {
      id: 'source',
      order: 2,
      name: 'Source',
      subtitle: isSqs ? 'SQS message arrival & validation' : 'S3 object ingestion notification',
      category: 'Ingestion',
      status: 'Passed',
      durationMs: 28400,
      startedAt: new Date(Date.now() - 285000).toISOString(),
      completedAt: new Date(Date.now() - 256000).toISOString(),
      recordsIn: recordCount,
      recordsOut: recordCount,
      bytesProcessed: '4.82 MB',
      computeTarget: isSqs ? 'AWS SQS eu-west-1' : 'AWS S3 eu-west-1',
      inputPayload: {
        s3Location: `s3://ej-data-platform-dev-ingest/raw/${targetTable}/`,
        eventPattern: isSqs ? 'SQS:ReceiveMessage' : 'ObjectCreated:Put',
      },
      outputPayload: {
        s3EventId: `evt_${runId}_s3_event`,
        latencyToQueueMs: 142,
      },
      logs: [
        { timestamp: '10:30:29.412', level: 'INFO', message: 'Publishing upload to ingest landing bucket' },
        { timestamp: '10:30:45.180', level: 'INFO', message: 'Payload verified against local checksum' },
        { timestamp: '10:30:57.910', level: 'INFO', message: 'Event receipt verified with 0 dead-letter queue forwards' },
      ],
      evidenceIdRef: `EV-${runId}-102`,
    },
    {
      id: 'preprocessing',
      order: 3,
      name: 'Pre-processing',
      subtitle: 'Antivirus scan, schema validation & header sanitization',
      category: 'Ingestion',
      status: 'Passed',
      durationMs: 46100,
      startedAt: new Date(Date.now() - 256000).toISOString(),
      completedAt: new Date(Date.now() - 210000).toISOString(),
      recordsIn: recordCount,
      recordsOut: recordCount,
      bytesProcessed: '4.82 MB',
      computeTarget: 'AWS Lambda (Node20.x, 2048MB, ARM64)',
      inputPayload: {
        functionArn: `arn:aws:lambda:eu-west-1:412891048:function:ej-preprocess-${targetTable}`,
        clamAvEngine: 'v0.105.1-libclamav',
        headerStrictCheck: true,
      },
      outputPayload: {
        antivirusStatus: 'CLEAN',
        quarantinedFiles: 0,
        validHeadersCount: 42,
      },
      logs: [
        { timestamp: '10:30:58.204', level: 'INFO', message: 'Lambda invoked with event ID from Source stage' },
        { timestamp: '10:31:14.390', level: 'INFO', message: 'ClamAV container scan: 0 threats detected in byte buffers' },
        { timestamp: '10:31:44.290', level: 'INFO', message: 'Pre-processing checks passed; payload forwarded to S3 Raw Landing' },
      ],
      evidenceIdRef: `EV-${runId}-103`,
    },
    {
      id: 'acquisition',
      order: 4,
      name: 'S3 Raw Landing',
      subtitle: 'Write to immutable data lake archive partition',
      category: 'Compute',
      status: 'Running',
      durationMs: 31800,
      startedAt: new Date(Date.now() - 210000).toISOString(),
      recordsIn: recordCount,
      recordsOut: recordCount,
      bytesProcessed: '4.82 MB',
      computeTarget: 'AWS S3 Glacier Instant Retrieval / Standard',
      inputPayload: {
        targetBucket: 's3://ej-lake-raw-eu-west-1',
        partitionKey: `year=2026/month=09/day=05/test_id=${runId}`,
        kmsKeyArn: 'arn:aws:kms:eu-west-1:412891048:key/ej-datalake-encryption',
      },
      outputPayload: {
        rawFilesCount: 2,
        serverSideEncryption: 'aws:kms',
      },
      logs: [
        { timestamp: '10:31:44.890', level: 'INFO', message: 'Writing raw objects to S3 raw landing zone' },
        { timestamp: '10:32:01.440', level: 'INFO', message: 'Validating AWS KMS envelope encryption' },
        { timestamp: '10:32:16.602', level: 'INFO', message: 'Raw partition registered successfully' },
      ],
      evidenceIdRef: `EV-${runId}-104`,
    },
    {
      id: 'jenkins',
      order: 5,
      name: 'Jenkins CI/CD Trigger',
      subtitle: 'Trigger downstream orchestration & pipeline deployment',
      category: 'Compute',
      status: 'Pending',
      durationMs: 19500,
      startedAt: '',
      recordsIn: recordCount,
      recordsOut: recordCount,
      computeTarget: 'Jenkins Production Controller (Master-02)',
      inputPayload: {
        jobName: `JENKINS-DATA-INGEST-${targetTable.toUpperCase()}`,
        buildParameters: { RUN_ID: runId, TARGET_TABLE: targetTable },
      },
      outputPayload: {
        buildNumber: 4182,
        buildResult: 'SUCCESS',
      },
      logs: [
        { timestamp: '10:32:17.100', level: 'INFO', message: 'Dispatching webhook trigger to Jenkins enterprise cluster' },
        { timestamp: '10:32:21.400', level: 'INFO', message: 'Jenkins build queued' },
      ],
      evidenceIdRef: `EV-${runId}-105`,
    },
    {
      id: 'databricks',
      order: 6,
      name: 'Databricks Delta Merge',
      subtitle: 'Merge into target Delta table & optimize partition',
      category: 'Compute',
      status: 'Pending',
      durationMs: 184500,
      startedAt: '',
      recordsIn: recordCount,
      recordsOut: recordCount,
      computeTarget: 'Databricks Job Cluster (Runtime 14.3 LTS)',
      inputPayload: {
        targetTable: targetTable,
        mergeKeys: ['customer_id', 'flight_id'],
      },
      outputPayload: {
        numTargetRowsInserted: recordCount,
        numTargetRowsUpdated: 0,
      },
      logs: [
        { timestamp: '10:33:19.100', level: 'INFO', message: `Executing MERGE INTO ${targetTable}` },
        { timestamp: '10:36:23.600', level: 'INFO', message: 'Delta Lake ACID transaction committed' },
      ],
      evidenceIdRef: `EV-${runId}-106`,
    },
    {
      id: 'validation',
      order: 7,
      name: 'Target Validation',
      subtitle: 'Automated Great Expectations & schema conformity checks',
      category: 'Quality',
      status: 'Pending',
      durationMs: 51200,
      startedAt: '',
      recordsIn: recordCount,
      recordsOut: recordCount,
      computeTarget: 'Great Expectations Test Harness Container',
      inputPayload: {
        targetTable: targetTable,
        suiteName: 'easyjet_production_integrity_suite',
      },
      outputPayload: {
        expectationChecksRun: 6,
        passedChecks: 6,
      },
      logs: [
        { timestamp: '10:37:03.110', level: 'INFO', message: 'Running automated Great Expectations suite' },
        { timestamp: '10:37:54.310', level: 'INFO', message: 'All target validation checks completed' },
      ],
      evidenceIdRef: `EV-${runId}-107`,
    },
    {
      id: 'evidence',
      order: 8,
      name: 'Evidence Gathering',
      subtitle: 'Collect checksums, screenshots and runtime telemetry',
      category: 'Quality',
      status: 'Pending',
      durationMs: 25000,
      startedAt: '',
      recordsIn: recordCount,
      recordsOut: recordCount,
      computeTarget: 'Evidence Collector Daemon',
      inputPayload: {
        testRunId: runId,
        targetTable: targetTable,
      },
      outputPayload: {
        evidenceItemsCollected: 3,
      },
      logs: [
        { timestamp: '10:37:55.010', level: 'INFO', message: 'Packaging evidence items for compliance archive' },
      ],
      evidenceIdRef: `EV-${runId}-108`,
    },
    {
      id: 'final_result',
      order: 9,
      name: 'Final Verdict',
      subtitle: 'Aggregate quality score & pipeline sign-off',
      category: 'Verdict',
      status: 'Pending',
      durationMs: 5000,
      startedAt: '',
      recordsIn: recordCount,
      recordsOut: recordCount,
      computeTarget: 'Gatekeeper Verdict Engine',
      inputPayload: {
        testRunId: runId,
      },
      outputPayload: {
        verdict: 'PASSED',
      },
      logs: [
        { timestamp: '10:38:00.000', level: 'INFO', message: 'Pipeline completed successfully' },
      ],
      evidenceIdRef: `EV-${runId}-109`,
    },
  ];
}

/**
 * Dynamically generates enterprise validation rule checks for a test run.
 */
export function generateValidationSummary(runId: string, input?: Partial<CreateTestInput>): ValidationSummary {
  const targetTable = input?.targetTable || 'bronze_table';
  const recordCount = input?.expectedRecordCount || 10000;
  const formattedCount = recordCount.toLocaleString();

  return {
    testRunId: runId,
    totalChecks: 6,
    passedCount: 6,
    warningCount: 0,
    failedCount: 0,
    overallStatus: 'PASS',
    executionDurationMs: 152000,
    timestamp: new Date().toISOString(),
    rules: [
      {
        id: 'VAL-001',
        category: 'Schema',
        name: 'Delta Table Schema Conformance',
        status: 'PASS',
        summary: 'Matched',
        expectedValue: 'Strict Types & Nullability',
        actualValue: 'All Columns Matched',
        variance: '0%',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT count(*) FROM information_schema.columns WHERE table_name = "${targetTable}"`,
        description: 'Verifies that incoming raw fields strictly conform in data type, physical column name, and structural hierarchy.',
      },
      {
        id: 'VAL-002',
        category: 'Record Count',
        name: 'Source-to-Target Exact Row Reconciliation',
        status: 'PASS',
        summary: formattedCount,
        expectedValue: `${formattedCount} Records`,
        actualValue: `${formattedCount} Records`,
        variance: '0.00%',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT (SELECT count(*) FROM s3_source_manifest) - (SELECT count(*) FROM ${targetTable} WHERE test_run_id = "${runId}") AS discrepancy`,
        description: 'Reconciles the count of source files in S3 against rows inserted into the Databricks Delta table.',
      },
      {
        id: 'VAL-003',
        category: 'Mandatory Columns',
        name: 'Non-Null Primary Keys & Essential Identifiers',
        status: 'PASS',
        summary: '100%',
        expectedValue: '100.00% Non-Null',
        actualValue: '100.00% Non-Null (0 Nulls)',
        variance: '0.00%',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT count(*) FROM ${targetTable} WHERE primary_id IS NULL`,
        description: 'Asserts that critical business columns do not have null or empty values.',
      },
      {
        id: 'VAL-004',
        category: 'Duplicate Check',
        name: 'Primary Key Uniqueness Enforcement',
        status: 'PASS',
        summary: '0 Duplicates',
        expectedValue: '0 Duplicates',
        actualValue: '0 Duplicates Detected',
        variance: '0',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT primary_id, count(*) FROM ${targetTable} GROUP BY primary_id HAVING count(*) > 1`,
        description: 'Validates that duplicate record keys are prevented by the Delta merge operation.',
      },
      {
        id: 'VAL-005',
        category: 'Data Quality',
        name: 'ISO-8601 Timestamp Standard Compliance',
        status: 'PASS',
        summary: '100%',
        expectedValue: '100.00% ISO-8601 Valid',
        actualValue: '100.00% Valid',
        variance: '0.00%',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT count(*) FROM ${targetTable} WHERE try_to_timestamp(event_timestamp) IS NULL`,
        description: 'Verifies all timestamps adhere to UTC ISO-8601 format.',
      },
      {
        id: 'VAL-006',
        category: 'Data Quality',
        name: 'Enterprise Contract v3.2 Strict Rule Validation',
        status: 'PASS',
        summary: '100%',
        expectedValue: '100.00% Contract Adherence',
        actualValue: '100.00% Verified',
        variance: '0.00%',
        recordsEvaluated: recordCount,
        failingRecordsCount: 0,
        assertionSql: `SELECT count(*) FROM ${targetTable} WHERE is_valid_contract = false`,
        description: 'Full semantic validation of payload against registered enterprise data contracts.',
      },
    ],
  };
}

/**
 * Dynamically generates evidence items with visual screenshot telemetry for a test run.
 */
export function generateEvidenceItems(runId: string, input?: Partial<CreateTestInput>): EvidenceItem[] {
  const targetTable = input?.targetTable || 'bronze_flight_events';
  const recordCount = input?.expectedRecordCount || 10000;

  return [
    {
      id: `EV-${runId}-101`,
      testRunId: runId,
      stageId: 'test_input',
      stageName: 'Test Input',
      title: 'S3 Synthetic Source Input Manifest',
      description: 'Captured test harness payload batch generation parameters and Parquet file checksums.',
      timestamp: new Date().toISOString(),
      status: 'Passed',
      s3Uri: `s3://ej-compliance-evidence/${runId}/proof-01-input-manifest.png`,
      sha256Hash: `sha256-${runId}-proof-01`,
      capturedBy: 'TestHarnessAgent-v2',
      dimensions: { width: 1920, height: 1080 },
      contentType: 'screenshot',
      imageUrl: createSvgScreenshot('AWS S3 Console — Ingestion Landing Bucket', `Bucket: ej-data-platform-dev-ingest/raw/${targetTable}/`, '#12B76A', [
        `// Manifest: manifest-${runId}.json`,
        '├── batch_chunk_001.parquet  (2.41 MB)  Status: VERIFIED',
        '├── batch_chunk_002.parquet  (2.41 MB)  Status: VERIFIED',
        '└── _SUCCESS                 (0 Bytes)  Status: UPLOADED_COMPLIANT',
        '',
        `Total Records Generated: ${recordCount.toLocaleString()} | Compression: SNAPPY`,
        'Encryption: AWS KMS (arn:aws:kms:eu-west-1:ej-lake-key-01)',
      ]),
      metadata: {
        targetSystem: 'Amazon S3',
        endpointOrTable: `s3://ej-data-platform-dev-ingest/raw/${targetTable}/`,
        operator: 'Automated Test Harness',
        sizeKb: 4935,
        tags: ['s3', 'raw', 'input-manifest'],
      },
    },
    {
      id: `EV-${runId}-102`,
      testRunId: runId,
      stageId: 'jenkins',
      stageName: 'Jenkins CI/CD Trigger',
      title: 'Jenkins Pipeline Build Console Output',
      description: 'Execution logs from Jenkins job trigger and agent provisioning.',
      timestamp: new Date().toISOString(),
      status: 'Passed',
      s3Uri: `s3://ej-compliance-evidence/${runId}/proof-02-jenkins.png`,
      sha256Hash: `sha256-${runId}-proof-02`,
      capturedBy: 'JenkinsWebhookPlugin-v4.1',
      dimensions: { width: 1920, height: 1080 },
      contentType: 'screenshot',
      imageUrl: createSvgScreenshot('Jenkins Blue Ocean — Pipeline Stage View', `Job: JENKINS-DATA-INGEST-JOB #4182`, '#0284C7', [
        '[Pipeline] Start of Pipeline',
        `[Pipeline] stage: Ingest Payload [${runId}]`,
        '[Pipeline] sh: python3 -m ej_data_pipeline.trigger',
        '[Pipeline] Finished: SUCCESS in 19.5s',
      ]),
      metadata: {
        targetSystem: 'Jenkins CI/CD',
        endpointOrTable: 'https://jenkins.easyjet.internal/job/DATA-INGEST/',
        operator: 'Jenkins CI/CD Controller',
        sizeKb: 128,
        tags: ['jenkins', 'ci-cd', 'orchestration'],
      },
    },
    {
      id: `EV-${runId}-103`,
      testRunId: runId,
      stageId: 'databricks',
      stageName: 'Databricks Delta Merge',
      title: 'Databricks Delta Lake Transaction Log',
      description: 'Delta table transaction version commit and ACID merge telemetry.',
      timestamp: new Date().toISOString(),
      status: 'Passed',
      s3Uri: `s3://ej-compliance-evidence/${runId}/proof-03-databricks.png`,
      sha256Hash: `sha256-${runId}-proof-03`,
      capturedBy: 'DatabricksTelemetryHook',
      dimensions: { width: 1920, height: 1080 },
      contentType: 'screenshot',
      imageUrl: createSvgScreenshot('Databricks Workspace — Delta Lake Table History', `Table: main.bronze.${targetTable}`, '#12B76A', [
        `Version: 89 | Operation: MERGE | Status: COMMITTED`,
        `Target Table: ${targetTable}`,
        `Rows Inserted: ${recordCount.toLocaleString()} | Rows Updated: 0 | Rows Deleted: 0`,
        'Cluster: runtime-14.3-lts-photon-8worker',
      ]),
      metadata: {
        targetSystem: 'Databricks Delta Lake',
        endpointOrTable: targetTable,
        operator: 'Spark Engine v3.5',
        sizeKb: 2048,
        tags: ['databricks', 'delta-lake', 'acid-merge'],
      },
    },
  ];
}
