import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Play, Save, Layers, AlertCircle, UploadCloud, FileText, CheckCircle2, Server, Folder, Cpu, GitBranch, Database } from 'lucide-react';
import { CreateTestInput, Environment, IngestionPattern } from '../../types/testRun';
import { ENVIRONMENTS, INGESTION_PATTERNS } from '../../utils/constants';

const newTestSchema = z
  .object({
    testName: z.string().min(3, 'Pipeline name is required'),
    environment: z.enum(['DEV', 'PREPROD', 'PROD'] as const),
    pattern: z.enum([
      'S3 → Lambda → S3 → Databricks',
      'SQS → Lambda → S3 → Databricks',
    ] as const),
    s3FolderPath: z.string().optional(),
    sqsQueueName: z.string().optional(),
    lambdaFunctionName: z.string().min(2, 'Lambda function name is required'),
    jenkinsPipelineName: z.string().min(2, 'Jenkins pipeline name is required'),
    dagName: z.string().min(2, 'DAG name is required'),
    targetTable: z.string().min(3, 'Target table is required'),
  })
  .superRefine((data, ctx) => {
    if (data.pattern === 'S3 → Lambda → S3 → Databricks') {
      if (!data.s3FolderPath || data.s3FolderPath.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['s3FolderPath'],
          message: 'S3 folder path is mandatory for S3 ingestion pattern',
        });
      }
    } else if (data.pattern === 'SQS → Lambda → S3 → Databricks') {
      if (!data.sqsQueueName || data.sqsQueueName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sqsQueueName'],
          message: 'SQS queue name is mandatory for SQS ingestion pattern',
        });
      }
    }
  });

type NewTestFormData = z.infer<typeof newTestSchema>;

interface NewTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTest: (data: CreateTestInput, runImmediately: boolean) => Promise<void>;
  defaultEnv?: Environment;
}

export const NewTestDialog: React.FC<NewTestDialogProps> = ({
  isOpen,
  onClose,
  onSubmitTest,
  defaultEnv = 'DEV',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewTestFormData>({
    resolver: zodResolver(newTestSchema) as any,
    defaultValues: {
      testName: '',
      environment: defaultEnv,
      pattern: 'S3 → Lambda → S3 → Databricks',
      s3FolderPath: '',
      sqsQueueName: '',
      lambdaFunctionName: '',
      jenkinsPipelineName: '',
      dagName: '',
      targetTable: '',
    },
  });

  const selectedPattern = watch('pattern');
  const selectedEnv = watch('environment');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const onFormSubmit = async (data: NewTestFormData, runImmediately: boolean) => {
    setIsSubmitting(true);
    try {
      let detectedFormat: 'Parquet' | 'CSV' | 'JSON' = 'Parquet';
      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'csv') detectedFormat = 'CSV';
        else if (ext === 'json' || ext === 'jsonl') detectedFormat = 'JSON';
      }

      await onSubmitTest(
        {
          testName: data.testName,
          environment: data.environment,
          pattern: data.pattern,
          fileFormat: detectedFormat,
          targetTable: data.targetTable,
          source: data.pattern.includes('S3') ? data.s3FolderPath || 'S3 Bucket' : data.sqsQueueName || 'SQS Queue',
          expectedRecordCount: 10000,
          validationProfile: 'Strict Production',
          uploadedFileName: selectedFile ? selectedFile.name : undefined,
        },
        runImmediately
      );
      reset();
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error('Failed to submit pipeline test', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border-subtle flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FFF2EB] text-[#FF6600] border border-[#FFD2B8]">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900 tracking-tight">
                Create End-to-End Ingestion Testing Pipeline
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Pipeline Name & Target Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-text-primary flex items-center">
                <span>Pipeline Name</span>
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                {...register('testName')}
                className="w-full px-3 py-2 bg-surface-muted border border-border-subtle rounded-lg text-xs text-navy-900 focus:outline-hidden focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
              />
              {errors.testName && (
                <p className="text-red-600 text-[11px] flex items-center gap-1">
                  <AlertCircle size={11} />
                  <span>{errors.testName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-primary flex items-center">
                <span>Target Environment</span>
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>
              <select
                {...register('environment')}
                className="w-full px-3 py-2 bg-surface-muted border border-border-subtle rounded-lg text-xs font-medium text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env} {env === 'PROD' ? '(Prod)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ingestion Pattern Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-text-primary flex items-center justify-between">
              <span className="flex items-center">
                <span>Ingestion Pattern</span>
                <span className="text-red-500 font-bold ml-1">*</span>
              </span>
              <span className="text-[10px] text-text-secondary font-normal">Select architectural flow</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {INGESTION_PATTERNS.map((pattern) => {
                const isSelected = selectedPattern === pattern;
                return (
                  <label
                    key={pattern}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF6600] bg-[#FFF2EB]/50 shadow-2xs'
                        : 'border-border-subtle hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value={pattern}
                        {...register('pattern')}
                        onChange={(e) => {
                          const val = e.target.value as IngestionPattern;
                          setValue('pattern', val);
                        }}
                        className="text-[#FF6600] focus:ring-[#FF6600]"
                      />
                      <span className="font-mono text-xs font-semibold text-navy-900">
                        {pattern}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-sans">
                      {pattern.startsWith('S3') ? 'S3 Bucket Trigger' : 'SQS Queue Event'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dynamic Component Architecture Configuration (Mandatory Fields) */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-700">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-[#FF6600]" />
                <span className="font-bold text-xs text-navy-900">
                  Pipeline Asset Configuration ({selectedPattern})
                </span>
              </div>
              <span className="text-[10px] font-semibold text-red-500">* All fields mandatory</span>
            </div>

            {/* Field 1: Pattern Specific - S3 Folder Path OR SQS Queue Name */}
            {selectedPattern === 'S3 → Lambda → S3 → Databricks' ? (
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Folder size={13} className="text-amber-600" />
                    <span>S3 Folder Path</span>
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">S3 URI Path</span>
                </label>
                <input
                  type="text"
                  {...register('s3FolderPath')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.s3FolderPath && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.s3FolderPath.message}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Server size={13} className="text-purple-600" />
                    <span>SQS Queue Name</span>
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">AWS SQS Name</span>
                </label>
                <input
                  type="text"
                  {...register('sqsQueueName')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.sqsQueueName && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.sqsQueueName.message}</span>
                  </p>
                )}
              </div>
            )}

            {/* Fields 2 & 3: Lambda Function Name & Jenkins Pipeline Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Cpu size={13} className="text-blue-600" />
                  <span>Lambda Function Name</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  {...register('lambdaFunctionName')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.lambdaFunctionName && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.lambdaFunctionName.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center gap-1.5">
                  <GitBranch size={13} className="text-emerald-600" />
                  <span>Jenkins Pipeline Name</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  {...register('jenkinsPipelineName')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.jenkinsPipelineName && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.jenkinsPipelineName.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Fields 4 & 5: DAG Name & Target Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path d="M12 12C8 6 3.5 4 4.5 9.5C5.5 15 10 12 12 12Z" fill="#E43927" />
                    <path d="M12 12C18 8 20 3.5 14.5 4.5C9 5.5 12 10 12 12Z" fill="#00C7D4" />
                    <path d="M12 12C16 18 20.5 20 19.5 14.5C18.5 9 14 12 12 12Z" fill="#00AD46" />
                    <path d="M12 12C6 16 4 20.5 9.5 19.5C15 18.5 12 14 12 12Z" fill="#0075E8" />
                  </svg>
                  <span>DAG Name</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  {...register('dagName')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.dagName && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.dagName.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Database size={13} className="text-[#FF6600]" />
                  <span>Target Table</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  {...register('targetTable')}
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-lg text-xs font-mono text-navy-900 focus:outline-hidden focus:border-[#FF6600]"
                />
                {errors.targetTable && (
                  <p className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle size={11} />
                    <span>{errors.targetTable.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Data Engineer File Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="font-semibold text-text-primary flex items-center justify-between">
              <span>Upload Test Data File</span>
              <span className="text-[10px] text-text-secondary font-normal font-sans">Sample dataset for pipeline validation</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".parquet,.csv,.json,.jsonl"
              className="hidden"
            />
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#FF6600] bg-[#FFF2EB]'
                    : 'border-slate-300 hover:border-[#FF6600] bg-slate-50/50 hover:bg-[#FFF2EB]/30'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-[#FFF2EB] text-[#FF6600] flex items-center justify-center border border-[#FFD2B8]">
                    <UploadCloud size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-navy-900 text-xs">Click to upload test file</span>
                    <span className="text-text-secondary text-xs"> or drag and drop</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Supports sample payload files for end-to-end pipeline ingestion validation
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-[#ECFDF3] border border-[#ABEFC6] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D1FADF] text-[#027A48] flex items-center justify-center font-bold text-xs shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-navy-900 text-xs truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={11} className="text-[#027A48]" />
                      <span>
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for pipeline execution
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* PROD Alert notice if PROD is selected */}
          {selectedEnv === 'PROD' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>
                <strong>Warning:</strong> Production testing triggers shadow isolation partition writes and requires Data Governance signoff.
              </span>
            </div>
          )}
        </form>

        {/* Modal Footer with Action Buttons */}
        <div className="px-6 py-4 border-t border-border-subtle bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onFormSubmit(data as NewTestFormData, false))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Save size={13} />
              <span>Save Pipeline</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onFormSubmit(data as NewTestFormData, true))}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#FF6600] hover:bg-[#E55B00] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play size={13} className="fill-white" />
              <span>{isSubmitting ? 'Launching...' : 'Run Pipeline'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
