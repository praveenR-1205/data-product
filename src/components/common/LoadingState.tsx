import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data ingestion records...',
  rows = 5,
}) => {
  return (
    <div className="w-full p-8 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-3 text-sm text-text-secondary">
        <Loader2 className="w-5 h-5 text-[#FF6600] animate-spin" />
        <span>{message}</span>
      </div>
      <div className="w-full max-w-3xl space-y-2 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-slate-100 rounded-md animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
};
