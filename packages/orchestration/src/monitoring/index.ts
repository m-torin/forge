/**
 * Enterprise Monitoring and Observability Module
 *
 * Comprehensive monitoring system leveraging Node.js 22+ features for enterprise-grade
 * observability, compliance monitoring, and operational intelligence.
 *
 * @module Monitoring
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

// Dashboard exports
export * from './dashboards/audit-dashboard';
export * from './dashboards/memory-dashboard';
export * from './dashboards/performance-dashboard';

// Alerting system exports
export * from './alerts/memory-alerts';
export * from './alerts/performance-alerts';
export * from './alerts/security-alerts';

// Analytics exports
export * from './analytics/audit-analytics';

// Compliance reporting exports
export * from './compliance';

/**
 * Convenience function to start all monitoring systems
 */
export async function startAllMonitoring(): Promise<{
  performance: any;
  memory: any;
  audit: any;
  compliance: any;
}> {
  const { startPerformanceDashboard } = await import('./dashboards/performance-dashboard');
  const { startMemoryDashboard } = await import('./dashboards/memory-dashboard');
  const { startAuditDashboard } = await import('./dashboards/audit-dashboard');
  const { startComplianceReporting } = await import('./compliance');

  const [performance, memory, audit, compliance] = await Promise.all([
    startPerformanceDashboard(),
    startMemoryDashboard(),
    startAuditDashboard(),
    startComplianceReporting(),
  ]);

  return {
    performance,
    memory,
    audit,
    compliance,
  };
}
