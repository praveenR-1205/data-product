import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Database, GitBranch, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/providers';
import { TestRun } from '../../types/testRun';
import { ingestionTestService } from '../../services/ingestionTestService';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [filteredRuns, setFilteredRuns] = useState<TestRun[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      ingestionTestService.getTestRuns({ searchQuery: query }).then((runs) => {
        setFilteredRuns(runs.slice(0, 6));
      });
    } else {
      setQuery('');
      setFilteredRuns([]);
    }
  }, [isSearchOpen, query]);

  const handleSelect = (runId: string) => {
    setIsSearchOpen(false);
    navigate(`/test-runs/${runId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search test runs by ID, source, target table, or operator..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {query.trim() === '' ? 'Recent Test Runs' : 'Matching Test Runs'}
          </div>

          {filteredRuns.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredRuns.map((run) => (
              <button
                key={run.id}
                onClick={() => handleSelect(run.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-md group-hover:bg-[#FFF2EB] transition-colors">
                    <Layers size={16} className="text-slate-600 group-hover:text-[#FF6600]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#FF6600]">
                        {run.id}
                      </span>
                      <StatusBadge status={run.status} size="sm" />
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {run.environment}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{run.testName}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Database size={12} />
                        {run.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch size={12} />
                        {run.pattern}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-400 group-hover:text-[#FF6600] transform group-hover:translate-x-1 transition-transform"
                />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-600">Esc</kbd> to close</span>
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-600">Enter</kbd> to view</span>
        </div>
      </div>
    </div>
  );
};
