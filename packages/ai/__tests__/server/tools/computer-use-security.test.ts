/**
 * Computer Use Tools Security Tests
 * Testing sandboxed execution, resource monitoring, and security constraints
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect } from 'vitest';
import { MonitoredComputerTool } from '../../../src/server/tools/computer-use/monitored-computer-tool';
import {
  ComputerToolMonitor,
  ComputerToolSecurityTester,
} from '../../../src/server/tools/computer-use/resource-monitoring';

describe('computerToolMonitor', () => {
  let monitor: ComputerToolMonitor;

  beforeEach(() => {
    monitor = new ComputerToolMonitor({
      resourceLimits: {
        maxMemoryMB: 100,
        maxCpuPercent: 50,
        maxDiskSpaceMB: 500,
        maxNetworkKBps: 1000,
        maxExecutionTimeMs: 30000,
      },
      monitoring: {
        enableResourceTracking: true,
        enableSecurityChecks: true,
        sampleIntervalMs: 100,
      },
      security: {
        enableSandboxing: true,
        allowedDomains: ['localhost', '127.0.0.1'],
        blockedPorts: [22, 23, 25, 53, 135, 139, 445],
        maxFileSize: 10 * 1024 * 1024, // 10MB
      },
    });
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('resource Monitoring', () => {
    test('should track resource usage during tool execution', async () => {
      const toolId = 'resource-test-tool';

      // Start monitoring
      monitor.startMonitoring(toolId, {
        toolName: 'Resource Test Tool',
        operation: 'test_operation',
        expectedDuration: 1000,
      });

      // Simulate resource usage
      await new Promise(resolve => setTimeout(resolve, 200));

      // Record resource usage
      monitor.recordResourceUsage(toolId, {
        memoryMB: 25,
        cpuPercent: 15,
        diskUsageMB: 50,
        networkKBps: 100,
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // End monitoring
      const result = monitor.endMonitoring(toolId, {
        success: true,
        operation: 'test_operation',
      });

      expect(result.success).toBeTruthy();
      expect(result.resourceUsage.peakMemoryMB).toBe(25);
      expect(result.resourceUsage.peakCpuPercent).toBe(15);
      expect(result.totalExecutionTime).toBeGreaterThan(250);
      expect(result.violations).toHaveLength(0);
    });

    test('should detect resource limit violations', async () => {
      const toolId = 'violation-test-tool';

      monitor.startMonitoring(toolId, {
        toolName: 'Violation Test Tool',
        operation: 'excessive_resource_usage',
      });

      // Simulate excessive resource usage
      monitor.recordResourceUsage(toolId, {
        memoryMB: 150, // Exceeds 100MB limit
        cpuPercent: 75, // Exceeds 50% limit
        diskUsageMB: 600, // Exceeds 500MB limit
        networkKBps: 1500, // Exceeds 1000 KBps limit
      });

      const result = monitor.endMonitoring(toolId, {
        success: false,
        operation: 'excessive_resource_usage',
        error: 'Resource limits exceeded',
      });

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some(v => v.type === 'memory_limit_exceeded')).toBeTruthy();
      expect(result.violations.some(v => v.type === 'cpu_limit_exceeded')).toBeTruthy();
      expect(result.violations.some(v => v.type === 'disk_limit_exceeded')).toBeTruthy();
      expect(result.violations.some(v => v.type === 'network_limit_exceeded')).toBeTruthy();
    });

    test('should handle execution timeout', async () => {
      const shortTimeoutMonitor = new ComputerToolMonitor({
        resourceLimits: {
          maxExecutionTimeMs: 100, // 100ms timeout
        },
        monitoring: { enableResourceTracking: true },
      });

      const toolId = 'timeout-test-tool';

      shortTimeoutMonitor.startMonitoring(toolId, {
        toolName: 'Timeout Test Tool',
        operation: 'long_running_operation',
      });

      // Simulate long-running operation
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = shortTimeoutMonitor.endMonitoring(toolId, {
        success: false,
        operation: 'long_running_operation',
        error: 'Operation timed out',
      });

      expect(result.violations.some(v => v.type === 'execution_timeout')).toBeTruthy();

      shortTimeoutMonitor.destroy();
    });
  });

  describe('security Monitoring', () => {
    test('should detect unauthorized network access attempts', async () => {
      const toolId = 'network-security-test';

      monitor.startMonitoring(toolId, {
        toolName: 'Network Security Test',
        operation: 'network_access',
      });

      // Simulate unauthorized network access
      monitor.recordSecurityEvent(toolId, {
        type: 'network_access_attempt',
        target: 'malicious-site.com',
        blocked: true,
        severity: 'high',
        timestamp: Date.now(),
      });

      const result = monitor.endMonitoring(toolId, {
        success: false,
        operation: 'network_access',
        error: 'Unauthorized network access blocked',
      });

      expect(result.securityEvents.length).toBeGreaterThan(0);
      expect(result.securityEvents[0].type).toBe('network_access_attempt');
      expect(result.securityEvents[0].blocked).toBeTruthy();
      expect(result.violations.some(v => v.type === 'security_violation')).toBeTruthy();
    });

    test('should validate allowed domains and block unauthorized ones', async () => {
      const toolId = 'domain-validation-test';

      monitor.startMonitoring(toolId, {
        toolName: 'Domain Validation Test',
        operation: 'domain_access',
      });

      // Test allowed domain
      const allowedResult = monitor.validateNetworkAccess('localhost', 8080);
      expect(allowedResult.allowed).toBeTruthy();

      // Test blocked domain
      const blockedResult = monitor.validateNetworkAccess('evil-domain.com', 80);
      expect(blockedResult.allowed).toBeFalsy();
      expect(blockedResult.reason).toContain('domain not in allowlist');

      // Test blocked port
      const blockedPortResult = monitor.validateNetworkAccess('localhost', 22);
      expect(blockedPortResult.allowed).toBeFalsy();
      expect(blockedPortResult.reason).toContain('port blocked');

      monitor.endMonitoring(toolId, {
        success: true,
        operation: 'domain_access',
      });
    });

    test('should monitor file system access', async () => {
      const toolId = 'filesystem-security-test';

      monitor.startMonitoring(toolId, {
        toolName: 'File System Security Test',
        operation: 'file_access',
      });

      // Simulate suspicious file access
      monitor.recordSecurityEvent(toolId, {
        type: 'file_access_attempt',
        target: '/etc/passwd',
        blocked: true,
        severity: 'critical',
        timestamp: Date.now(),
      });

      const result = monitor.endMonitoring(toolId, {
        success: false,
        operation: 'file_access',
        error: 'Unauthorized file access blocked',
      });

      expect(result.securityEvents.some(e => e.type === 'file_access_attempt')).toBeTruthy();
      expect(result.securityEvents.some(e => e.severity === 'critical')).toBeTruthy();
    });
  });

  describe('performance Analysis', () => {
    test('should generate performance reports', async () => {
      const toolId = 'performance-analysis-test';

      monitor.startMonitoring(toolId, {
        toolName: 'Performance Analysis Test',
        operation: 'analysis_operation',
      });

      // Simulate varying resource usage
      const resourceReadings = [
        { memoryMB: 20, cpuPercent: 10, timestamp: Date.now() },
        { memoryMB: 35, cpuPercent: 25, timestamp: Date.now() + 100 },
        { memoryMB: 50, cpuPercent: 40, timestamp: Date.now() + 200 },
        { memoryMB: 30, cpuPercent: 20, timestamp: Date.now() + 300 },
      ];

      resourceReadings.forEach(reading => {
        monitor.recordResourceUsage(toolId, reading);
      });

      const result = monitor.endMonitoring(toolId, {
        success: true,
        operation: 'analysis_operation',
      });

      const report = monitor.generatePerformanceReport(toolId);

      expect(report).toBeDefined();
      expect(report.resourceUtilization.memory.average).toBeGreaterThan(0);
      expect(report.resourceUtilization.memory.peak).toBe(50);
      expect(report.resourceUtilization.cpu.average).toBeGreaterThan(0);
      expect(report.resourceUtilization.cpu.peak).toBe(40);
      expect(report.efficiency.score).toBeGreaterThan(0);
    });

    test('should identify performance bottlenecks', async () => {
      const toolId = 'bottleneck-test';

      monitor.startMonitoring(toolId, {
        toolName: 'Bottleneck Test',
        operation: 'bottleneck_operation',
      });

      // Simulate resource bottleneck
      monitor.recordResourceUsage(toolId, {
        memoryMB: 95, // Near memory limit
        cpuPercent: 48, // Near CPU limit
        diskUsageMB: 490, // Near disk limit
        networkKBps: 950, // Near network limit
      });

      monitor.endMonitoring(toolId, {
        success: true,
        operation: 'bottleneck_operation',
      });

      const bottlenecks = monitor.identifyBottlenecks(toolId);

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.resource === 'memory')).toBeTruthy();
      expect(bottlenecks.some(b => b.severity === 'high')).toBeTruthy();
    });
  });

  describe('alert System', () => {
    test('should trigger alerts for security violations', async () => {
      const alertMonitor = new ComputerToolMonitor({
        resourceLimits: { maxMemoryMB: 100 },
        monitoring: { enableSecurityChecks: true },
        alerting: {
          enabled: true,
          securityViolationAlert: true,
          resourceThresholdAlert: true,
        },
      });

      const toolId = 'alert-test';

      alertMonitor.startMonitoring(toolId, {
        toolName: 'Alert Test',
        operation: 'security_test',
      });

      alertMonitor.recordSecurityEvent(toolId, {
        type: 'suspicious_activity',
        target: 'system_files',
        blocked: false,
        severity: 'high',
        timestamp: Date.now(),
      });

      alertMonitor.endMonitoring(toolId, {
        success: false,
        operation: 'security_test',
      });

      const alerts = alertMonitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'security_violation')).toBeTruthy();

      alertMonitor.destroy();
    });

    test('should manage alert lifecycle', async () => {
      const alertMonitor = new ComputerToolMonitor({
        alerting: { enabled: true, alertTTL: 1000 }, // 1 second TTL
      });

      const toolId = 'alert-lifecycle-test';

      alertMonitor.startMonitoring(toolId, { toolName: 'Alert Lifecycle Test' });

      alertMonitor.recordSecurityEvent(toolId, {
        type: 'test_violation',
        severity: 'medium',
        timestamp: Date.now(),
      });

      alertMonitor.endMonitoring(toolId, { success: false });

      // Immediate check - alert should exist
      let alerts = alertMonitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Alert should be expired
      alerts = alertMonitor.getActiveAlerts();
      expect(alerts).toHaveLength(0);

      alertMonitor.destroy();
    });
  });
});

describe('computerToolSecurityTester', () => {
  let securityTester: ComputerToolSecurityTester;

  beforeEach(() => {
    securityTester = new ComputerToolSecurityTester({
      testCategories: {
        networkSecurity: true,
        fileSystemSecurity: true,
        processIsolation: true,
        resourceExhaustion: true,
      },
      testIntensity: 'medium',
      sandboxConfig: {
        enableNetworkIsolation: true,
        enableFileSystemRestrictions: true,
        enableProcessLimits: true,
      },
    });
  });

  afterEach(() => {
    securityTester.destroy();
  });

  describe('network Security Tests', () => {
    test('should test network access restrictions', async () => {
      const testResults = await securityTester.runNetworkSecurityTests({
        testUnauthorizedDomains: true,
        testPortScanning: true,
        testProtocolViolations: true,
      });

      expect(testResults.length).toBeGreaterThan(0);
      expect(testResults.some(r => r.testType === 'unauthorized_domain_access')).toBeTruthy();
      expect(testResults.some(r => r.testType === 'port_scanning')).toBeTruthy();
      expect(testResults.every(r => r.blocked === true)).toBeTruthy(); // All should be blocked
    });

    test('should validate DNS resolution restrictions', async () => {
      const dnsTests = await securityTester.runDNSSecurityTests({
        testMaliciousDomains: true,
        testDNSRebinding: true,
        testDNSTunneling: true,
      });

      expect(dnsTests.length).toBeGreaterThan(0);
      expect(dnsTests.some(t => t.testType === 'malicious_domain_resolution')).toBeTruthy();
      expect(dnsTests.every(t => t.success === true)).toBeTruthy(); // All tests should pass (block malicious)
    });
  });

  describe('file System Security Tests', () => {
    test('should test file access restrictions', async () => {
      const fileSystemTests = await securityTester.runFileSystemSecurityTests({
        testSystemFileAccess: true,
        testDirectoryTraversal: true,
        testFilePermissions: true,
      });

      expect(fileSystemTests.length).toBeGreaterThan(0);
      expect(fileSystemTests.some(t => t.testType === 'system_file_access')).toBeTruthy();
      expect(fileSystemTests.some(t => t.testType === 'directory_traversal')).toBeTruthy();
      expect(fileSystemTests.every(t => t.blocked === true)).toBeTruthy();
    });

    test('should test file size and type restrictions', async () => {
      const fileSizeTests = await securityTester.runFileSizeSecurityTests({
        testLargeFileCreation: true,
        testExecutableFileCreation: true,
        testHiddenFileAccess: true,
      });

      expect(fileSizeTests.length).toBeGreaterThan(0);
      expect(fileSizeTests.some(t => t.testType === 'large_file_creation')).toBeTruthy();
      expect(fileSizeTests.some(t => t.testType === 'executable_file_creation')).toBeTruthy();
    });
  });

  describe('process Isolation Tests', () => {
    test('should test process spawning restrictions', async () => {
      const processTests = await securityTester.runProcessSecurityTests({
        testProcessSpawning: true,
        testProcessEscalation: true,
        testInterProcessCommunication: true,
      });

      expect(processTests.length).toBeGreaterThan(0);
      expect(processTests.some(t => t.testType === 'process_spawning')).toBeTruthy();
      expect(processTests.some(t => t.testType === 'privilege_escalation')).toBeTruthy();
      expect(processTests.every(t => t.blocked === true)).toBeTruthy();
    });

    test('should test memory protection', async () => {
      const memoryTests = await securityTester.runMemorySecurityTests({
        testBufferOverflow: true,
        testMemoryLeaks: true,
        testMemoryInjection: true,
      });

      expect(memoryTests.length).toBeGreaterThan(0);
      expect(memoryTests.some(t => t.testType === 'buffer_overflow_attempt')).toBeTruthy();
      expect(memoryTests.some(t => t.testType === 'memory_injection_attempt')).toBeTruthy();
    });
  });

  describe('resource Exhaustion Tests', () => {
    test('should test resource limit enforcement', async () => {
      const resourceTests = await securityTester.runResourceExhaustionTests({
        testMemoryExhaustion: true,
        testCPUExhaustion: true,
        testDiskExhaustion: true,
        testNetworkFlooding: true,
      });

      expect(resourceTests.length).toBeGreaterThan(0);
      expect(resourceTests.some(t => t.testType === 'memory_exhaustion')).toBeTruthy();
      expect(resourceTests.some(t => t.testType === 'cpu_exhaustion')).toBeTruthy();
      expect(resourceTests.every(t => t.limitEnforced === true)).toBeTruthy();
    });

    test('should test denial of service prevention', async () => {
      const dosTests = await securityTester.runDOSPreventionTests({
        testConnectionFlooding: true,
        testRequestFlooding: true,
        testResourceLocking: true,
      });

      expect(dosTests.length).toBeGreaterThan(0);
      expect(dosTests.some(t => t.testType === 'connection_flooding')).toBeTruthy();
      expect(dosTests.some(t => t.testType === 'request_flooding')).toBeTruthy();
      expect(dosTests.every(t => t.mitigated === true)).toBeTruthy();
    });
  });

  describe('comprehensive Security Assessment', () => {
    test('should run full security test suite', async () => {
      const assessment = await securityTester.runComprehensiveAssessment({
        includePerformanceImpact: true,
        generateDetailedReport: true,
        testTimeout: 30000,
      });

      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.overallScore).toBeLessThanOrEqual(100);
      expect(assessment.testResults.length).toBeGreaterThan(10);
      expect(assessment.vulnerabilities).toHaveLength(0); // Should find no vulnerabilities
      expect(assessment.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    test('should generate security compliance report', async () => {
      const complianceReport = await securityTester.generateComplianceReport({
        standards: ['OWASP', 'NIST', 'SOC2'],
        includeEvidence: true,
        detailLevel: 'comprehensive',
      });

      expect(complianceReport.standards.length).toBeGreaterThan(0);
      expect(complianceReport.complianceScore).toBeGreaterThan(0);
      expect(complianceReport.findings.length).toBeGreaterThanOrEqual(0);
      expect(complianceReport.evidence.length).toBeGreaterThan(0);
    });
  });

  describe('security Monitoring Integration', () => {
    test('should integrate with monitoring system', async () => {
      const monitor = new ComputerToolMonitor({
        security: { enableSandboxing: true },
        monitoring: { enableSecurityChecks: true },
      });

      const integrationTests = await securityTester.runIntegrationTests(monitor);

      expect(integrationTests.monitoringIntegration.success).toBeTruthy();
      expect(integrationTests.alertingIntegration.success).toBeTruthy();
      expect(integrationTests.reportingIntegration.success).toBeTruthy();

      monitor.destroy();
    });
  });
});

describe('monitoredComputerTool', () => {
  let monitoredTool: MonitoredComputerTool;

  beforeEach(() => {
    monitoredTool = new MonitoredComputerTool({
      monitoring: {
        enableResourceTracking: true,
        enableSecurityChecks: true,
        enablePerformanceAnalysis: true,
      },
      security: {
        enableSandboxing: true,
        strictMode: true,
      },
      resourceLimits: {
        maxMemoryMB: 50,
        maxExecutionTimeMs: 10000,
      },
    });
  });

  afterEach(() => {
    monitoredTool.destroy();
  });

  describe('monitored Tool Execution', () => {
    test('should execute tools with monitoring', async () => {
      const toolResult = await monitoredTool.execute({
        tool: 'screen_capture',
        parameters: {
          region: { x: 0, y: 0, width: 100, height: 100 },
          format: 'png',
        },
      });

      expect(toolResult.success).toBeTruthy();
      expect(toolResult.monitoring).toBeDefined();
      expect(toolResult.monitoring.resourceUsage).toBeDefined();
      expect(toolResult.monitoring.securityEvents).toBeDefined();
      expect(toolResult.monitoring.violations).toHaveLength(0);
    });

    test('should handle tool execution failures safely', async () => {
      const toolResult = await monitoredTool.execute({
        tool: 'invalid_tool',
        parameters: {},
      });

      expect(toolResult.success).toBeFalsy();
      expect(toolResult.error).toBeDefined();
      expect(toolResult.monitoring.violations.length).toBeGreaterThanOrEqual(0);
    });

    test('should enforce resource limits during execution', async () => {
      const restrictiveTool = new MonitoredComputerTool({
        resourceLimits: {
          maxMemoryMB: 1, // Very restrictive
          maxExecutionTimeMs: 100, // Very short timeout
        },
        monitoring: { enableResourceTracking: true },
      });

      const toolResult = await restrictiveTool.execute({
        tool: 'memory_intensive_operation',
        parameters: { size: '10MB' },
      });

      expect(toolResult.success).toBeFalsy();
      expect(
        toolResult.monitoring.violations.some(
          v => v.type === 'memory_limit_exceeded' || v.type === 'execution_timeout',
        ),
      ).toBeTruthy();

      restrictiveTool.destroy();
    });
  });

  describe('security Enforcement', () => {
    test('should block unauthorized operations in strict mode', async () => {
      const strictTool = new MonitoredComputerTool({
        security: {
          enableSandboxing: true,
          strictMode: true,
          allowedOperations: ['screen_capture'], // Only allow screen capture
        },
        monitoring: { enableSecurityChecks: true },
      });

      const allowedResult = await strictTool.execute({
        tool: 'screen_capture',
        parameters: { region: { x: 0, y: 0, width: 50, height: 50 } },
      });

      const blockedResult = await strictTool.execute({
        tool: 'file_write',
        parameters: { path: '/tmp/test.txt', content: 'test' },
      });

      expect(allowedResult.success).toBeTruthy();
      expect(blockedResult.success).toBeFalsy();
      expect(
        blockedResult.monitoring.securityEvents.some(e => e.type === 'unauthorized_operation'),
      ).toBeTruthy();

      strictTool.destroy();
    });
  });

  describe('performance Analysis', () => {
    test('should provide detailed performance metrics', async () => {
      const performanceTool = new MonitoredComputerTool({
        monitoring: {
          enablePerformanceAnalysis: true,
          detailedMetrics: true,
        },
      });

      const result = await performanceTool.execute({
        tool: 'text_processing',
        parameters: { text: 'performance test data', operation: 'analyze' },
      });

      expect(result.monitoring.performance).toBeDefined();
      expect(result.monitoring.performance.executionPhases).toBeDefined();
      expect(result.monitoring.performance.resourceEfficiency).toBeDefined();
      expect(result.monitoring.performance.optimizationOpportunities).toBeDefined();

      performanceTool.destroy();
    });

    test('should generate optimization recommendations', async () => {
      await monitoredTool.execute({
        tool: 'cpu_intensive_task',
        parameters: { iterations: 1000 },
      });

      const recommendations = monitoredTool.getOptimizationRecommendations();

      expect(recommendations.length).toBeGreaterThanOrEqual(0);
      if (recommendations.length > 0) {
        expect(recommendations[0].type).toBeDefined();
        expect(recommendations[0].description).toBeDefined();
        expect(recommendations[0].expectedImprovement).toBeGreaterThan(0);
      }
    });
  });

  describe('audit and Logging', () => {
    test('should maintain comprehensive audit logs', async () => {
      await monitoredTool.execute({
        tool: 'file_read',
        parameters: { path: '/tmp/audit-test.txt' },
      });

      await monitoredTool.execute({
        tool: 'network_request',
        parameters: { url: 'http://localhost:8080/test' },
      });

      const auditLog = monitoredTool.getAuditLog();

      expect(auditLog).toHaveLength(2);
      expect(auditLog[0].tool).toBe('file_read');
      expect(auditLog[1].tool).toBe('network_request');
      expect(auditLog.every(entry => entry.timestamp > 0)).toBeTruthy();
      expect(auditLog.every(entry => entry.monitoring)).toBeTruthy();
    });

    test('should export security reports', async () => {
      // Execute operations that create security events
      await monitoredTool.execute({
        tool: 'suspicious_operation',
        parameters: { target: 'system_files' },
      });

      const securityReport = monitoredTool.generateSecurityReport({
        includeViolations: true,
        includeAuditTrail: true,
        format: 'detailed',
      });

      expect(securityReport.summary).toBeDefined();
      expect(securityReport.violations).toBeDefined();
      expect(securityReport.auditTrail).toBeDefined();
      expect(securityReport.recommendations).toBeDefined();
    });
  });
});
