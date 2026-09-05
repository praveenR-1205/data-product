import { useState, useMemo, useCallback, useEffect } from 'react';
import { Environment, TestRunFilters } from '../types/testRun';

export const DEFAULT_FILTERS: TestRunFilters = {
  searchQuery: '',
  environment: 'ALL',
  status: 'ALL',
  source: 'ALL',
  pattern: 'ALL',
  dateRange: 'ALL',
};

export function useTestFilters(currentEnv: Environment = 'DEV') {
  const [filters, setFilters] = useState<TestRunFilters>({
    ...DEFAULT_FILTERS,
    environment: currentEnv,
  });

  // Keep environment filter in sync with global header environment selection
  useEffect(() => {
    setFilters((prev) => ({ ...prev, environment: currentEnv }));
  }, [currentEnv]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim() !== '') count++;
    if (filters.status !== 'ALL') count++;
    if (filters.dateRange !== 'ALL') count++;
    return count;
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof TestRunFilters>(key: K, value: TestRunFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      environment: currentEnv,
    });
  }, [currentEnv]);

  return {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
}
