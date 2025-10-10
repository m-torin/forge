/**
 * Enterprise Compliance Monitoring and Reporting Module
 *
 * Centralized exports for comprehensive compliance monitoring, reporting automation,
 * and regulatory compliance management leveraging Node.js 22+ features.
 *
 * @module ComplianceMonitoring
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

// Core compliance reporting system
export {
  ComplianceFramework,
  ComplianceReportingSystem,
  ComplianceUtils,
  ReportFormat,
  ReportStatus,
  ViolationSeverity,
  globalComplianceReporting,
  startComplianceReporting,
} from './compliance-reports';

// Type exports
export type { ComplianceReportConfig } from './compliance-reports';

/**
 * Re-export commonly used compliance utilities
 */
export const { formatFrameworkName, getViolationSeverityColor, getComplianceGrade } =
  ComplianceUtils;
