import { useEffect, useState } from 'react';

import { createWorkflowMonitor, type WorkflowStatus } from '@repo/orchestration';

/**
 * Hook for monitoring individual workflow status using orchestration observability
 */
export function useWorkflowStatus(workflowRunId: string | null) {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowRunId) {
      setLoading(false);
      return;
    }

    const monitor = createWorkflowMonitor();
    let cancelled = false;

    const pollStatus = async () => {
      try {
        const currentStatus = await monitor.getStatus(workflowRunId);

        if (!cancelled) {
          setStatus(currentStatus);
          setError(null);

          // Stop polling if workflow is complete
          if (
            currentStatus &&
            ['RUN_CANCELED', 'RUN_FAILED', 'RUN_SUCCESS'].includes(currentStatus.state)
          ) {
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
        }
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [workflowRunId]);

  return { error, loading, status };
}

/**
 * Hook for monitoring all active workflows
 */
export function useActiveWorkflows(count = 50, refreshInterval = 5000) {
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const monitor = createWorkflowMonitor();
    let cancelled = false;

    const fetchWorkflows = async () => {
      try {
        const activeWorkflows = await monitor.listActiveWorkflows(count);

        if (!cancelled) {
          setWorkflows(activeWorkflows);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchWorkflows();

    // Set up polling
    const interval = setInterval(fetchWorkflows, refreshInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [count, refreshInterval]);

  return { error, loading, workflows };
}

/**
 * Hook for getting detailed workflow logs
 */
export function useWorkflowLogs(workflowRunId: string | null, count = 100) {
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowRunId) {
      setLoading(false);
      return;
    }

    const monitor = createWorkflowMonitor();
    let cancelled = false;

    const fetchLogs = async () => {
      try {
        const workflowLogs = await monitor.getWorkflowLogs(workflowRunId, count);

        if (!cancelled) {
          setLogs(workflowLogs);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch logs');
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      cancelled = true;
    };
  }, [workflowRunId, count]);

  return { error, loading, logs };
}

/**
 * Hook for system health monitoring
 */
export function useSystemHealth(refreshInterval = 10000) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/observability?action=health');
        const healthData = await response.json();

        if (!cancelled) {
          setHealth(healthData);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch health');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchHealth();

    // Set up polling
    const interval = setInterval(fetchHealth, refreshInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return { error, health, loading };
}

/**
 * Hook for error analysis and classification
 */
export function useErrorAnalysis() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeError = async (errorMessage: string, context?: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/observability', {
        body: JSON.stringify({
          action: 'analyze-error',
          context,
          error: errorMessage,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze error');
    } finally {
      setLoading(false);
    }
  };

  return { analysis, analyzeError, error, loading };
}

/**
 * Hook for system metrics monitoring
 */
export function useSystemMetrics(refreshInterval = 30000) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/observability?action=metrics&count=100');
        const metricsData = await response.json();

        if (!cancelled) {
          setMetrics(metricsData);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMetrics();

    // Set up polling
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return { error, loading, metrics };
}
