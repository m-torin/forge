// Client-side utility functions

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'running':
      return 'blue';
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'running':
      return '⚡';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    case 'cancelled':
      return '⛔';
    default:
      return '❓';
  }
};

export const createExecutionId = () =>
  `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
