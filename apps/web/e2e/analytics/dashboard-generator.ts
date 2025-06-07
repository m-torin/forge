import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  FlakyTestAnalysis,
  PerformanceTrend,
  ReliabilityMetrics,
  TestAnalytics,
  TestInsights,
} from "./test-analytics.js";

/**
 * Dashboard Generator - Creates interactive HTML dashboards for test analytics
 */
export class DashboardGenerator {
  constructor(private outputDir: string) {}

  /**
   * Generate comprehensive analytics dashboard
   */
  generateDashboard(analytics: TestAnalytics): void {
    const dashboardData = analytics.getDashboardData();
    const insights = analytics.generateInsights();
    const flakyTests = analytics.analyzeFlakyTests();
    const performanceTrends = analytics.analyzePerformanceTrends();
    const reliabilityMetrics = analytics.calculateReliabilityMetrics();

    const html = this.createDashboardHTML({
      dashboardData,
      flakyTests,
      insights,
      performanceTrends,
      reliabilityMetrics,
    });

    const outputPath = resolve(this.outputDir, "test-analytics-dashboard.html");
    writeFileSync(outputPath, html);

    console.log(`📊 Analytics dashboard generated: ${outputPath}`);
  }

  /**
   * Create the HTML dashboard
   */
  private createDashboardHTML(data: {
    dashboardData: any;
    insights: TestInsights;
    flakyTests: FlakyTestAnalysis[];
    performanceTrends: PerformanceTrend[];
    reliabilityMetrics: ReliabilityMetrics;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${this.getCSS()}
    </style>
</head>
<body>
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>🧪 Test Analytics Dashboard</h1>
            <div class="header-stats">
                <div class="stat">
                    <span class="stat-value">${data.dashboardData.overview.totalTests}</span>
                    <span class="stat-label">Total Tests</span>
                </div>
                <div class="stat">
                    <span class="stat-value ${this.getPassRateClass(data.dashboardData.overview.passRate)}">${Math.round(data.dashboardData.overview.passRate * 100)}%</span>
                    <span class="stat-label">Pass Rate</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${data.dashboardData.overview.flakyTests}</span>
                    <span class="stat-label">Flaky Tests</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${Math.round(data.dashboardData.overview.avgDuration / 1000)}s</span>
                    <span class="stat-label">Avg Duration</span>
                </div>
            </div>
        </header>

        <div class="dashboard-grid">
            <!-- Overview Section -->
            <div class="card overview-card">
                <h2>📊 Test Health Overview</h2>
                <div class="health-score">
                    <div class="score-circle ${this.getHealthScoreClass(data.reliabilityMetrics.reliabilityScore)}">
                        <span class="score-value">${Math.round(data.reliabilityMetrics.reliabilityScore)}</span>
                        <span class="score-label">Health Score</span>
                    </div>
                </div>
                <div class="health-details">
                    <div class="health-item">
                        <span class="health-label">Success Rate</span>
                        <span class="health-value">${Math.round(data.reliabilityMetrics.successRate * 100)}%</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Avg Retries</span>
                        <span class="health-value">${data.reliabilityMetrics.averageRetries.toFixed(1)}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Consistent Tests</span>
                        <span class="health-value">${data.reliabilityMetrics.consistentTests}</span>
                    </div>
                </div>
            </div>

            <!-- Trends Chart -->
            <div class="card chart-card">
                <h2>📈 Pass Rate Trend (30 days)</h2>
                <canvas id="passRateChart"></canvas>
            </div>

            <!-- Performance Chart -->
            <div class="card chart-card">
                <h2>⏱️ Performance Trend (30 days)</h2>
                <canvas id="performanceChart"></canvas>
            </div>

            <!-- Flaky Tests -->
            <div class="card flaky-tests-card">
                <h2>🎭 Most Flaky Tests</h2>
                <div class="flaky-tests-list">
                    ${data.flakyTests
                      .slice(0, 5)
                      .map(
                        (test) => `
                    <div class="flaky-test-item">
                        <div class="test-name">${this.truncateTestName(test.testName)}</div>
                        <div class="flaky-score ${this.getFlakyScoreClass(test.flakyScore)}">
                            ${Math.round(test.flakyScore * 100)}%
                        </div>
                        <div class="test-details">
                            ${test.totalRuns} runs • ${test.failures} failures
                        </div>
                    </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>

            <!-- Top Issues -->
            <div class="card issues-card">
                <h2>⚠️ Top Issues</h2>
                <div class="issues-list">
                    ${data.dashboardData.topIssues
                      .slice(0, 6)
                      .map(
                        (issue) => `
                    <div class="issue-item ${issue.severity}">
                        <div class="issue-type">${this.getIssueIcon(issue.type)} ${issue.type.toUpperCase()}</div>
                        <div class="issue-test">${this.truncateTestName(issue.testName)}</div>
                        <div class="issue-description">${issue.description}</div>
                    </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>

            <!-- Alerts -->
            <div class="card alerts-card">
                <h2>🚨 System Alerts</h2>
                <div class="alerts-container">
                    ${
                      data.insights.alerts.criticalIssues.length > 0
                        ? `
                    <div class="alert-section critical">
                        <h3>🔴 Critical Issues</h3>
                        <ul>
                            ${data.insights.alerts.criticalIssues.map((issue) => `<li>${issue}</li>`).join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      data.insights.alerts.warnings.length > 0
                        ? `
                    <div class="alert-section warning">
                        <h3>🟡 Warnings</h3>
                        <ul>
                            ${data.insights.alerts.warnings.map((warning) => `<li>${warning}</li>`).join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      data.insights.alerts.criticalIssues.length === 0 &&
                      data.insights.alerts.warnings.length === 0
                        ? `
                    <div class="no-alerts">
                        ✅ No active alerts - all systems healthy!
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>

            <!-- Recommendations -->
            <div class="card recommendations-card">
                <h2>💡 Recommendations</h2>
                <div class="recommendations-grid">
                    ${
                      data.insights.recommendations.testsToOptimize.length > 0
                        ? `
                    <div class="recommendation-section">
                        <h3>🚀 Optimize Performance</h3>
                        <ul>
                            ${data.insights.recommendations.testsToOptimize
                              .slice(0, 3)
                              .map(
                                (test) =>
                                  `<li>${this.truncateTestName(test)}</li>`,
                              )
                              .join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      data.insights.recommendations.testsToFix.length > 0
                        ? `
                    <div class="recommendation-section">
                        <h3>🔧 Fix Reliability</h3>
                        <ul>
                            ${data.insights.recommendations.testsToFix
                              .slice(0, 3)
                              .map(
                                (test) =>
                                  `<li>${this.truncateTestName(test)}</li>`,
                              )
                              .join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      data.insights.recommendations.coverageGaps.length > 0
                        ? `
                    <div class="recommendation-section">
                        <h3>📋 Coverage Gaps</h3>
                        <ul>
                            ${data.insights.recommendations.coverageGaps
                              .slice(0, 3)
                              .map((gap) => `<li>${gap}</li>`)
                              .join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>

            <!-- Execution Patterns -->
            <div class="card patterns-card">
                <h2>📅 Execution Patterns</h2>
                <div class="patterns-grid">
                    <div class="pattern-item">
                        <h3>Peak Hours</h3>
                        <div class="peak-hours">
                            ${data.insights.executionPatterns.peakExecutionHours
                              .map(
                                (hour) =>
                                  `<span class="hour-badge">${hour}:00</span>`,
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="pattern-item">
                        <h3>Most Active Environments</h3>
                        <div class="env-list">
                            ${data.insights.executionPatterns.mostActiveEnvironments
                              .map(
                                (env) =>
                                  `<span class="env-badge">${env}</span>`,
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="pattern-item">
                        <h3>Daily Average</h3>
                        <div class="daily-avg">
                            ${Math.round(data.insights.executionPatterns.averageExecutionsPerDay)} executions/day
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="dashboard-footer">
            <p>Generated on ${new Date().toLocaleString()} • Last updated: ${new Date().toLocaleString()}</p>
        </footer>
    </div>

    <script>
        ${this.getJavaScript(data)}
    </script>
</body>
</html>`;
  }

  /**
   * Get CSS styles for the dashboard
   */
  private getCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }

        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .dashboard-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }

        .dashboard-header h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }

        .header-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
        }

        .stat {
            text-align: center;
        }

        .stat-value {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-value.good { color: #10b981; }
        .stat-value.warning { color: #f59e0b; }
        .stat-value.danger { color: #ef4444; }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            margin-bottom: 20px;
            color: #1f2937;
            font-size: 1.25rem;
        }

        .overview-card {
            grid-column: span 1;
        }

        .health-score {
            text-align: center;
            margin-bottom: 20px;
        }

        .score-circle {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 6px solid;
            margin: 0 auto;
        }

        .score-circle.excellent { border-color: #10b981; background: #ecfdf5; }
        .score-circle.good { border-color: #3b82f6; background: #eff6ff; }
        .score-circle.warning { border-color: #f59e0b; background: #fffbeb; }
        .score-circle.poor { border-color: #ef4444; background: #fef2f2; }

        .score-value {
            font-size: 2rem;
            font-weight: bold;
        }

        .score-label {
            font-size: 0.8rem;
            opacity: 0.7;
        }

        .health-details {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .health-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .chart-card {
            grid-column: span 1;
        }

        .chart-card canvas {
            max-height: 300px;
        }

        .flaky-tests-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .flaky-test-item {
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }

        .test-name {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .flaky-score {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .flaky-score.high { color: #ef4444; }
        .flaky-score.medium { color: #f59e0b; }
        .flaky-score.low { color: #10b981; }

        .test-details {
            font-size: 0.9rem;
            color: #6b7280;
        }

        .issues-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .issue-item {
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .issue-item.high {
            background: #fef2f2;
            border-color: #ef4444;
        }

        .issue-item.medium {
            background: #fffbeb;
            border-color: #f59e0b;
        }

        .issue-item.low {
            background: #f0f9ff;
            border-color: #3b82f6;
        }

        .issue-type {
            font-weight: bold;
            font-size: 0.8rem;
            margin-bottom: 4px;
        }

        .issue-test {
            font-weight: 600;
            margin-bottom: 4px;
        }

        .issue-description {
            font-size: 0.9rem;
            color: #6b7280;
        }

        .alerts-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .alert-section {
            padding: 15px;
            border-radius: 8px;
        }

        .alert-section.critical {
            background: #fef2f2;
            border: 1px solid #fecaca;
        }

        .alert-section.warning {
            background: #fffbeb;
            border: 1px solid #fed7aa;
        }

        .alert-section h3 {
            margin-bottom: 10px;
        }

        .alert-section ul {
            list-style: none;
            padding-left: 20px;
        }

        .alert-section li {
            margin-bottom: 5px;
            position: relative;
        }

        .alert-section li:before {
            content: "•";
            position: absolute;
            left: -15px;
        }

        .no-alerts {
            text-align: center;
            padding: 40px;
            color: #10b981;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .recommendation-section h3 {
            margin-bottom: 10px;
            color: #374151;
        }

        .recommendation-section ul {
            list-style: none;
        }

        .recommendation-section li {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 0.9rem;
        }

        .patterns-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }

        .pattern-item h3 {
            margin-bottom: 15px;
            color: #374151;
            font-size: 1rem;
        }

        .peak-hours {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .hour-badge, .env-badge {
            background: #3b82f6;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .env-badge {
            background: #10b981;
        }

        .daily-avg {
            font-size: 1.5rem;
            font-weight: bold;
            color: #3b82f6;
        }

        .dashboard-footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6b7280;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .header-stats {
                gap: 20px;
            }
            
            .recommendations-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
  }

  /**
   * Get JavaScript for the dashboard
   */
  private getJavaScript(data: any): string {
    return `
        // Pass Rate Trend Chart
        const passRateCtx = document.getElementById('passRateChart').getContext('2d');
        new Chart(passRateCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(
                  Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    return date.toLocaleDateString();
                  }),
                )},
                datasets: [{
                    label: 'Pass Rate',
                    data: ${JSON.stringify(data.dashboardData.trends.passRateTrend.map((rate: number) => Math.round(rate * 100)))},
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Performance Trend Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(
                  Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    return date.toLocaleDateString();
                  }),
                )},
                datasets: [{
                    label: 'Average Duration (seconds)',
                    data: ${JSON.stringify(data.dashboardData.trends.durationTrend.map((duration: number) => Math.round(duration / 1000)))},
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 's';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Auto-refresh every 5 minutes
        setTimeout(() => {
            window.location.reload();
        }, 5 * 60 * 1000);
    `;
  }

  private getPassRateClass(passRate: number): string {
    if (passRate >= 0.95) return "good";
    if (passRate >= 0.8) return "warning";
    return "danger";
  }

  private getHealthScoreClass(score: number): string {
    if (score >= 90) return "excellent";
    if (score >= 75) return "good";
    if (score >= 60) return "warning";
    return "poor";
  }

  private getFlakyScoreClass(score: number): string {
    if (score >= 0.7) return "high";
    if (score >= 0.3) return "medium";
    return "low";
  }

  private getIssueIcon(type: string): string {
    switch (type) {
      case "flaky":
        return "🎭";
      case "slow":
        return "🐌";
      case "failing":
        return "❌";
      default:
        return "⚠️";
    }
  }

  private truncateTestName(testName: string): string {
    return testName.length > 50 ? testName.substring(0, 47) + "..." : testName;
  }
}
