import { useState, useEffect, useCallback } from 'react';
import { CreateTestInput, SummaryMetrics, TestRun, TestRunFilters } from '../types/testRun';
import { ingestionTestService } from '../services/ingestionTestService';

export function useTestRuns(filters?: Partial<TestRunFilters>) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [runs, summary] = await Promise.all([
        ingestionTestService.getTestRuns(filters),
        ingestionTestService.getSummaryMetrics(filters?.environment),
      ]);
      setTestRuns(runs);
      setMetrics(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test runs');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const createRun = useCallback(async (input: CreateTestInput) => {
    try {
      const newRun = await ingestionTestService.createTestRun(input);
      await fetchRuns();
      return newRun;
    } catch (err) {
      throw err;
    }
  }, [fetchRuns]);

  const reRunTest = useCallback(async (id: string) => {
    try {
      await ingestionTestService.startTest(id);
      await fetchRuns();
    } catch (err) {
      console.error('Failed to rerun test', err);
    }
  }, [fetchRuns]);

  return {
    testRuns,
    metrics,
    isLoading,
    error,
    refresh: fetchRuns,
    createRun,
    reRunTest,
  };
}
