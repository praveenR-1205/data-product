import React from 'react';
import { FilterX, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Ingestion Pipelines Found',
  description = 'No pipelines match your current search and filter criteria. Try clearing filters or create a new pipeline.',
  actionLabel = 'Clear Filters',
  onAction,
  secondaryActionLabel = 'New Pipeline',
  onSecondaryAction,
}) => {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-lg border border-border-subtle shadow-xs">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <FilterX size={22} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#FF6600] rounded-md hover:bg-[#E55B00] transition-colors shadow-xs"
          >
            <Plus size={14} />
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
