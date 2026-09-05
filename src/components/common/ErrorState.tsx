import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry,
}) => {
  return (
    <div className="w-full p-8 bg-white rounded-xl border border-red-200 text-center flex flex-col items-center justify-center space-y-3">
      <div className="p-3 bg-red-50 text-red-600 rounded-full">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#E55B00] transition-colors"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
