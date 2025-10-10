/**
 * Package Adoption Tracker
 *
 * Automated tracking system to monitor Node 22+ pattern adoption across
 * all packages in the monorepo. Provides real-time visibility into
 * implementation progress, consistency scores, and migration status.
 *
 * ## Key Features:
 * - **Real-time Monitoring**: Track pattern adoption as it happens
 * - **Consistency Scoring**: Automated scoring of pattern implementation quality
 * - **Migration Progress**: Visual progress tracking for package modernization
 * - **Compliance Reporting**: Automated compliance reports for stakeholders
 * - **Recommendation Engine**: Automated suggestions for improvement
 * - **Integration Metrics**: Cross-package integration health monitoring
 *
 * @module PackageAdoptionTracker
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { performance } from 'perf_hooks';

/**
 * Package adoption status levels
 */
type AdoptionStatus = 'not-started' | 'in-progress' | 'partial' | 'complete' | 'validated';

/**
 * Pattern implementation quality levels
 */
type QualityLevel = 'poor' | 'fair' | 'good' | 'excellent';

/**
 * Node 22+ feature categories
 */
type FeatureCategory =
  | 'promise-management'
  | 'cancellation-patterns'
  | 'data-safety'
  | 'memory-management'
  | 'timing-precision'
  | 'resource-cleanup';

/**
 * Package analysis result
 */
interface PackageAnalysis {
  readonly packageName: string;
  readonly version: string;
  readonly adoptionStatus: AdoptionStatus;
  readonly overallScore: number; // 0-100
  readonly featureScores: Record<
    FeatureCategory,
    {
      score: number;
      quality: QualityLevel;
      implementationCount: number;
      issues: string[];
      recommendations: string[];
    }
  >;
  readonly filesAnalyzed: number;
  readonly lastAnalyzed: string;
  readonly migrationProgress: {
    totalFeatures: number;
    implementedFeatures: number;
    validatedFeatures: number;
    percentComplete: number;
  };
  readonly dependencies: {
    internal: string[]; // Other packages in monorepo
    external: string[]; // NPM dependencies
    node22Compatible: boolean;
  };
  readonly testCoverage: {
    node22Features: number;
    integration: number;
    overall: number;
  };
}

/**
 * Adoption timeline entry
 */
interface AdoptionTimelineEntry {
  readonly timestamp: string;
  readonly packageName: string;
  readonly event: 'started' | 'feature-added' | 'feature-completed' | 'validated' | 'reverted';
  readonly details: {
    feature?: FeatureCategory;
    scoreChange?: number;
    notes?: string;
  };
}

/**
 * Cross-package integration health
 */
interface IntegrationHealth {
  readonly packageA: string;
  readonly packageB: string;
  readonly healthScore: number; // 0-100
  readonly lastTested: string;
  readonly issues: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  readonly dataFlowCompatibility: boolean;
  readonly errorHandlingConsistency: boolean;
  readonly performanceImpact: number; // milliseconds
}

/**
 * Adoption dashboard data
 */
interface AdoptionDashboard {
  readonly summary: {
    totalPackages: number;
    packagesStarted: number;
    packagesComplete: number;
    overallProgress: number;
    averageScore: number;
    lastUpdated: string;
  };
  readonly packages: PackageAnalysis[];
  readonly timeline: AdoptionTimelineEntry[];
  readonly integrations: IntegrationHealth[];
  readonly recommendations: Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    affectedPackages: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
    action: string;
  }>;
  readonly trends: {
    adoptionVelocity: number; // packages per week
    qualityTrend: 'improving' | 'stable' | 'declining';
    riskLevel: 'low' | 'medium' | 'high';
  };
}

/**
 * Feature detection patterns for static analysis
 */
const FEATURE_DETECTION_PATTERNS = {
  'promise-management': {
    patterns: [
      /Promise\.withResolvers\s*\(/g,
      /const\s+\{\s*promise,\s*resolve,\s*reject\s*\}\s*=/g,
    ],
    qualityChecks: [
      { pattern: /Promise\.withResolvers\s*<[^>]+>/g, weight: 20, description: 'Type safety' },
      { pattern: /onTimeout\s*:\s*\(/g, weight: 15, description: 'Timeout handling' },
      { pattern: /onCancel\s*:\s*\(/g, weight: 15, description: 'Cancellation handling' },
    ],
  },
  'cancellation-patterns': {
    patterns: [
      /AbortSignal\.timeout\s*\(/g,
      /AbortSignal\.any\s*\(/g,
      /signal\.addEventListener\s*\(\s*['"`]abort['"`]/g,
    ],
    qualityChecks: [
      { pattern: /withCancellation\s*\(/g, weight: 25, description: 'Standardized cancellation' },
      { pattern: /cleanup\s*\(\s*\)/g, weight: 20, description: 'Proper cleanup' },
      { pattern: /signal\.aborted/g, weight: 15, description: 'Abort checking' },
    ],
  },
  'data-safety': {
    patterns: [/structuredClone\s*\(/g, /cloneForSharing\s*\(/g, /safeClone\s*\(/g],
    qualityChecks: [
      { pattern: /validatedClone\s*\(/g, weight: 30, description: 'Validated cloning' },
      { pattern: /transfer\s*:\s*\[/g, weight: 20, description: 'Transfer support' },
      { pattern: /removePrivateFields/g, weight: 15, description: 'Privacy protection' },
    ],
  },
  'memory-management': {
    patterns: [
      /new\s+WeakMap\s*\(/g,
      /new\s+WeakSet\s*\(/g,
      /ObjectTracker/g,
      /MemoryEfficientCache/g,
    ],
    qualityChecks: [
      {
        pattern: /CrossPackageMemoryMonitor/g,
        weight: 35,
        description: 'Cross-package monitoring',
      },
      { pattern: /finalizationRegistry/g, weight: 25, description: 'Automatic cleanup' },
      { pattern: /memoryUsage\(\)/g, weight: 20, description: 'Memory tracking' },
    ],
  },
  'timing-precision': {
    patterns: [/process\.hrtime\.bigint\s*\(\)/g, /HighResolutionTimer/g, /timeOperation\s*\(/g],
    qualityChecks: [
      { pattern: /benchmark\s*\(/g, weight: 30, description: 'Performance benchmarking' },
      { pattern: /checkpoint\s*\(/g, weight: 25, description: 'Timing checkpoints' },
      { pattern: /1_?000_?000/g, weight: 20, description: 'Proper time conversion' },
    ],
  },
  'resource-cleanup': {
    patterns: [
      /new\s+FinalizationRegistry/g,
      /ResourceCleanupManager/g,
      /register\s*\(\s*\w+,\s*\w+/g,
    ],
    qualityChecks: [
      {
        pattern: /CrossPackageCleanupCoordinator/g,
        weight: 35,
        description: 'Cross-package coordination',
      },
      { pattern: /manualCleanup\s*\(/g, weight: 25, description: 'Manual cleanup support' },
      { pattern: /performCleanup\s*\(/g, weight: 20, description: 'Proper cleanup logic' },
    ],
  },
} as const;

/**
 * Package Adoption Tracker
 */
export class PackageAdoptionTracker {
  private readonly monorepoRoot: string;
  private readonly analysisCache = new Map<string, PackageAnalysis>();
  private readonly timeline: AdoptionTimelineEntry[] = [];
  private readonly integrationHealthCache = new Map<string, IntegrationHealth>();

  constructor(monorepoRoot: string = join(process.cwd(), '../../')) {
    this.monorepoRoot = monorepoRoot;
  }

  /**
   * Generate comprehensive adoption dashboard
   */
  async generateDashboard(): Promise<AdoptionDashboard> {
    const startTime = performance.now();

    // Discover and analyze all packages
    const packageNames = await this.discoverPackages();
    const packageAnalyses: PackageAnalysis[] = [];

    for (const packageName of packageNames) {
      try {
        const analysis = await this.analyzePackage(packageName);
        packageAnalyses.push(analysis);
        this.analysisCache.set(packageName, analysis);
      } catch (error) {
        console.warn(`Failed to analyze package ${packageName}:`, error);
      }
    }

    // Analyze cross-package integrations
    const integrations = await this.analyzeIntegrations(packageAnalyses);

    // Generate recommendations
    const recommendations = this.generateRecommendations(packageAnalyses, integrations);

    // Calculate trends
    const trends = this.calculateTrends(packageAnalyses);

    const endTime = performance.now();

    return {
      summary: {
        totalPackages: packageAnalyses.length,
        packagesStarted: packageAnalyses.filter(p => p.adoptionStatus !== 'not-started').length,
        packagesComplete: packageAnalyses.filter(p => p.adoptionStatus === 'complete').length,
        overallProgress: this.calculateOverallProgress(packageAnalyses),
        averageScore: this.calculateAverageScore(packageAnalyses),
        lastUpdated: new Date().toISOString(),
      },
      packages: packageAnalyses,
      timeline: [...this.timeline].slice(-50), // Last 50 events
      integrations,
      recommendations,
      trends,
    };
  }

  /**
   * Analyze a single package for Node 22+ adoption
   */
  async analyzePackage(packageName: string): Promise<PackageAnalysis> {
    const packagePath = join(this.monorepoRoot, 'packages', packageName);
    const packageJsonPath = join(packagePath, 'package.json');

    let packageVersion = '0.0.0';
    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      packageVersion = packageJson.version || '0.0.0';
    } catch {
      // Package.json might not exist or be malformed
    }

    const srcPath = join(packagePath, 'src');
    const files = await this.getAllSourceFiles(srcPath);

    let totalScore = 0;
    const featureScores: PackageAnalysis['featureScores'] = {} as any;
    let implementedFeatures = 0;
    let validatedFeatures = 0;

    // Analyze each feature category
    for (const [category, config] of Object.entries(FEATURE_DETECTION_PATTERNS)) {
      const categoryScore = await this.analyzeFeatureCategory(
        files,
        category as FeatureCategory,
        config,
      );

      featureScores[category as FeatureCategory] = categoryScore;
      totalScore += categoryScore.score;

      if (categoryScore.implementationCount > 0) {
        implementedFeatures++;
        if (categoryScore.quality === 'excellent' || categoryScore.quality === 'good') {
          validatedFeatures++;
        }
      }
    }

    const overallScore = totalScore / Object.keys(FEATURE_DETECTION_PATTERNS).length;
    const adoptionStatus = this.determineAdoptionStatus(
      overallScore,
      implementedFeatures,
      validatedFeatures,
    );

    // Analyze dependencies
    const dependencies = await this.analyzeDependencies(packagePath);

    // Analyze test coverage (simplified)
    const testCoverage = await this.analyzeTestCoverage(packagePath);

    const analysis: PackageAnalysis = {
      packageName,
      version: packageVersion,
      adoptionStatus,
      overallScore: Math.round(overallScore * 10) / 10,
      featureScores,
      filesAnalyzed: files.length,
      lastAnalyzed: new Date().toISOString(),
      migrationProgress: {
        totalFeatures: Object.keys(FEATURE_DETECTION_PATTERNS).length,
        implementedFeatures,
        validatedFeatures,
        percentComplete: Math.round(
          (implementedFeatures / Object.keys(FEATURE_DETECTION_PATTERNS).length) * 100,
        ),
      },
      dependencies,
      testCoverage,
    };

    // Add to timeline if significant change
    this.addToTimeline(packageName, analysis);

    return analysis;
  }

  /**
   * Analyze feature category implementation
   */
  private async analyzeFeatureCategory(
    files: string[],
    category: FeatureCategory,
    config: (typeof FEATURE_DETECTION_PATTERNS)[FeatureCategory],
  ): Promise<PackageAnalysis['featureScores'][FeatureCategory]> {
    let implementationCount = 0;
    let qualityScore = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf-8');

        // Count basic pattern matches
        config.patterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            implementationCount += matches.length;
          }
        });

        // Analyze quality
        config.qualityChecks.forEach(check => {
          const matches = content.match(check.pattern);
          if (matches) {
            qualityScore += check.weight * matches.length;
          } else if (implementationCount > 0) {
            issues.push(`Missing ${check.description} in ${relative(this.monorepoRoot, filePath)}`);
            recommendations.push(`Implement ${check.description} for better ${category} patterns`);
          }
        });
      } catch (error) {
        issues.push(`Failed to analyze ${filePath}: ${error}`);
      }
    }

    // Calculate normalized score (0-100)
    const maxPossibleScore =
      implementationCount * config.qualityChecks.reduce((sum, check) => sum + check.weight, 0);
    const normalizedScore =
      maxPossibleScore > 0 ? Math.min(100, (qualityScore / maxPossibleScore) * 100) : 0;

    // Determine quality level
    let quality: QualityLevel;
    if (normalizedScore >= 80) quality = 'excellent';
    else if (normalizedScore >= 60) quality = 'good';
    else if (normalizedScore >= 40) quality = 'fair';
    else quality = 'poor';

    return {
      score: Math.round(normalizedScore * 10) / 10,
      quality,
      implementationCount,
      issues: issues.slice(0, 5), // Limit to top 5 issues
      recommendations: [...new Set(recommendations)].slice(0, 3), // Unique, top 3 recommendations
    };
  }

  /**
   * Determine package adoption status
   */
  private determineAdoptionStatus(
    overallScore: number,
    implementedFeatures: number,
    validatedFeatures: number,
  ): AdoptionStatus {
    if (implementedFeatures === 0) return 'not-started';
    if (validatedFeatures === implementedFeatures && overallScore >= 80) return 'validated';
    if (implementedFeatures >= 4) return 'complete';
    if (implementedFeatures >= 2) return 'partial';
    return 'in-progress';
  }

  /**
   * Analyze package dependencies
   */
  private async analyzeDependencies(packagePath: string): Promise<PackageAnalysis['dependencies']> {
    const packageJsonPath = join(packagePath, 'package.json');
    const internal: string[] = [];
    const external: string[] = [];
    let node22Compatible = false;

    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
      };

      Object.keys(allDeps).forEach(dep => {
        if (dep.startsWith('@repo/')) {
          internal.push(dep.replace('@repo/', ''));
        } else {
          external.push(dep);
        }
      });

      // Check Node.js version compatibility
      const engines = packageJson.engines;
      if (engines?.node) {
        const nodeVersion = engines.node;
        node22Compatible =
          nodeVersion.includes('22') || nodeVersion.includes('>=22') || nodeVersion.includes('*');
      }
    } catch (error) {
      // Package.json might not exist or be malformed
    }

    return { internal, external, node22Compatible };
  }

  /**
   * Analyze test coverage (simplified implementation)
   */
  private async analyzeTestCoverage(packagePath: string): Promise<PackageAnalysis['testCoverage']> {
    const testDir = join(packagePath, '__tests__');
    let node22Features = 0;
    let integration = 0;
    let overall = 50; // Default assumption

    try {
      const testFiles = await this.getAllSourceFiles(testDir);

      for (const testFile of testFiles) {
        const content = await readFile(testFile, 'utf-8');

        // Count Node 22+ feature tests
        if (
          content.includes('Promise.withResolvers') ||
          content.includes('AbortSignal.timeout') ||
          content.includes('structuredClone') ||
          content.includes('WeakMap') ||
          content.includes('process.hrtime.bigint') ||
          content.includes('FinalizationRegistry')
        ) {
          node22Features += 10;
        }

        // Count integration tests
        if (
          content.includes('integration') ||
          content.includes('cross-package') ||
          content.includes('@repo/')
        ) {
          integration += 15;
        }
      }

      // Estimate overall coverage based on test file count
      overall = Math.min(90, testFiles.length * 10);
    } catch {
      // Test directory might not exist
    }

    return {
      node22Features: Math.min(100, node22Features),
      integration: Math.min(100, integration),
      overall: Math.min(100, overall),
    };
  }

  /**
   * Analyze cross-package integrations
   */
  private async analyzeIntegrations(packages: PackageAnalysis[]): Promise<IntegrationHealth[]> {
    const integrations: IntegrationHealth[] = [];

    // Find packages with internal dependencies
    for (const packageA of packages) {
      for (const depName of packageA.dependencies.internal) {
        const packageB = packages.find(p => p.packageName === depName);
        if (!packageB) continue;

        const integrationKey = `${packageA.packageName}-${packageB.packageName}`;
        const cached = this.integrationHealthCache.get(integrationKey);

        if (cached && this.isCacheValid(cached.lastTested)) {
          integrations.push(cached);
          continue;
        }

        const health = await this.analyzeIntegrationHealth(packageA, packageB);
        this.integrationHealthCache.set(integrationKey, health);
        integrations.push(health);
      }
    }

    return integrations;
  }

  /**
   * Analyze health of integration between two packages
   */
  private async analyzeIntegrationHealth(
    packageA: PackageAnalysis,
    packageB: PackageAnalysis,
  ): Promise<IntegrationHealth> {
    const issues: IntegrationHealth['issues'] = [];
    let healthScore = 100;

    // Check adoption status compatibility
    if (packageA.adoptionStatus === 'complete' && packageB.adoptionStatus === 'not-started') {
      healthScore -= 30;
      issues.push({
        severity: 'high',
        description: `${packageA.packageName} is fully adopted but ${packageB.packageName} hasn't started`,
        recommendation: `Begin Node 22+ migration in ${packageB.packageName}`,
      });
    }

    // Check feature consistency
    Object.keys(packageA.featureScores).forEach(feature => {
      const featureKey = feature as FeatureCategory;
      const scoreA = packageA.featureScores[featureKey].score;
      const scoreB = packageB.featureScores[featureKey].score;
      const scoreDiff = Math.abs(scoreA - scoreB);

      if (scoreDiff > 40) {
        healthScore -= 15;
        issues.push({
          severity: 'medium',
          description: `Significant ${feature} implementation difference (${scoreDiff.toFixed(1)} points)`,
          recommendation: `Standardize ${feature} patterns between packages`,
        });
      }
    });

    // Simulate performance impact (would be actual measurement in real implementation)
    const performanceImpact = Math.random() * 50; // 0-50ms

    return {
      packageA: packageA.packageName,
      packageB: packageB.packageName,
      healthScore: Math.max(0, healthScore),
      lastTested: new Date().toISOString(),
      issues,
      dataFlowCompatibility: issues.filter(i => i.severity === 'high').length === 0,
      errorHandlingConsistency: issues.length < 2,
      performanceImpact,
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    packages: PackageAnalysis[],
    integrations: IntegrationHealth[],
  ): AdoptionDashboard['recommendations'] {
    const recommendations: AdoptionDashboard['recommendations'] = [];

    // Package-specific recommendations
    packages.forEach(pkg => {
      if (pkg.adoptionStatus === 'not-started') {
        recommendations.push({
          priority: 'high',
          category: 'Migration Start',
          description: `Begin Node 22+ migration for ${pkg.packageName}`,
          affectedPackages: [pkg.packageName],
          estimatedEffort: 'medium',
          action: `Start with Promise.withResolvers() patterns and basic memory management`,
        });
      }

      // Feature-specific recommendations
      Object.entries(pkg.featureScores).forEach(([feature, score]) => {
        if (score.quality === 'poor' && score.implementationCount > 0) {
          recommendations.push({
            priority: 'medium',
            category: 'Quality Improvement',
            description: `Improve ${feature} implementation quality in ${pkg.packageName}`,
            affectedPackages: [pkg.packageName],
            estimatedEffort: 'low',
            action: score.recommendations[0] || `Review and enhance ${feature} patterns`,
          });
        }
      });
    });

    // Integration-specific recommendations
    integrations.forEach(integration => {
      integration.issues.forEach(issue => {
        if (issue.severity === 'high') {
          recommendations.push({
            priority: 'critical',
            category: 'Integration Health',
            description: issue.description,
            affectedPackages: [integration.packageA, integration.packageB],
            estimatedEffort: 'medium',
            action: issue.recommendation,
          });
        }
      });
    });

    // Sort by priority and limit
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 10);
  }

  /**
   * Calculate adoption trends
   */
  private calculateTrends(packages: PackageAnalysis[]): AdoptionDashboard['trends'] {
    // Simple trend calculation (would use historical data in real implementation)
    const completedPackages = packages.filter(p => p.adoptionStatus === 'complete').length;
    const totalPackages = packages.length;
    const averageScore = packages.reduce((sum, pkg) => sum + pkg.overallScore, 0) / packages.length;

    return {
      adoptionVelocity: completedPackages / 4, // Assumes 4 weeks of work
      qualityTrend: averageScore >= 80 ? 'improving' : averageScore >= 60 ? 'stable' : 'declining',
      riskLevel: averageScore < 50 ? 'high' : averageScore < 70 ? 'medium' : 'low',
    };
  }

  /**
   * Helper methods
   */
  private async discoverPackages(): Promise<string[]> {
    const packagesDir = join(this.monorepoRoot, 'packages');
    try {
      const entries = await readdir(packagesDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name)
        .sort();
    } catch {
      return [];
    }
  }

  private async getAllSourceFiles(directory: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.getAllSourceFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory might not exist
    }

    return files;
  }

  private calculateOverallProgress(packages: PackageAnalysis[]): number {
    const totalScore = packages.reduce(
      (sum, pkg) => sum + pkg.migrationProgress.percentComplete,
      0,
    );
    return packages.length > 0 ? Math.round(totalScore / packages.length) : 0;
  }

  private calculateAverageScore(packages: PackageAnalysis[]): number {
    const totalScore = packages.reduce((sum, pkg) => sum + pkg.overallScore, 0);
    return packages.length > 0 ? Math.round((totalScore / packages.length) * 10) / 10 : 0;
  }

  private addToTimeline(packageName: string, analysis: PackageAnalysis): void {
    const lastEntry = this.timeline.filter(entry => entry.packageName === packageName).pop();

    if (!lastEntry || this.hasSignificantChange(lastEntry, analysis)) {
      this.timeline.push({
        timestamp: new Date().toISOString(),
        packageName,
        event: this.determineTimelineEvent(analysis),
        details: {
          scoreChange: lastEntry
            ? analysis.overallScore - (lastEntry.details as any).score
            : analysis.overallScore,
          notes: `Score: ${analysis.overallScore}, Status: ${analysis.adoptionStatus}`,
        },
      });
    }
  }

  private hasSignificantChange(
    lastEntry: AdoptionTimelineEntry,
    analysis: PackageAnalysis,
  ): boolean {
    const lastScore = (lastEntry.details as any).score || 0;
    const scoreDiff = Math.abs(analysis.overallScore - lastScore);
    return scoreDiff >= 10; // 10 point threshold
  }

  private determineTimelineEvent(analysis: PackageAnalysis): AdoptionTimelineEntry['event'] {
    switch (analysis.adoptionStatus) {
      case 'validated':
        return 'validated';
      case 'complete':
        return 'feature-completed';
      case 'partial':
      case 'in-progress':
        return 'feature-added';
      default:
        return 'started';
    }
  }

  private isCacheValid(lastTested: string): boolean {
    const testTime = new Date(lastTested).getTime();
    const now = Date.now();
    const hoursSinceTest = (now - testTime) / (1000 * 60 * 60);
    return hoursSinceTest < 24; // Cache valid for 24 hours
  }

  /**
   * Export dashboard data to JSON
   */
  async exportDashboard(outputPath: string): Promise<void> {
    const dashboard = await this.generateDashboard();
    await writeFile(outputPath, JSON.stringify(dashboard, null, 2));
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(dashboard: AdoptionDashboard): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Node 22+ Adoption Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .package { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .score { font-weight: bold; color: #007acc; }
    .status-complete { color: #28a745; }
    .status-partial { color: #ffc107; }
    .status-not-started { color: #dc3545; }
    .recommendations { margin-top: 30px; }
    .recommendation { padding: 10px; margin: 5px 0; border-left: 4px solid #007acc; }
    .priority-critical { border-left-color: #dc3545; }
    .priority-high { border-left-color: #fd7e14; }
  </style>
</head>
<body>
  <h1>Node 22+ Adoption Dashboard</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Overall Progress:</strong> ${dashboard.summary.overallProgress}%</p>
    <p><strong>Packages Complete:</strong> ${dashboard.summary.packagesComplete}/${dashboard.summary.totalPackages}</p>
    <p><strong>Average Score:</strong> ${dashboard.summary.averageScore}/100</p>
    <p><strong>Last Updated:</strong> ${dashboard.summary.lastUpdated}</p>
  </div>

  <h2>Package Status</h2>
  ${dashboard.packages
    .map(
      pkg => `
    <div class="package">
      <h3>${pkg.packageName} <span class="score">${pkg.overallScore}/100</span></h3>
      <p><strong>Status:</strong> <span class="status-${pkg.adoptionStatus}">${pkg.adoptionStatus}</span></p>
      <p><strong>Progress:</strong> ${pkg.migrationProgress.percentComplete}% (${pkg.migrationProgress.implementedFeatures}/${pkg.migrationProgress.totalFeatures} features)</p>
      <p><strong>Test Coverage:</strong> Node 22+ ${pkg.testCoverage.node22Features}%, Integration ${pkg.testCoverage.integration}%</p>
    </div>
  `,
    )
    .join('')}

  <div class="recommendations">
    <h2>Recommendations</h2>
    ${dashboard.recommendations
      .map(
        rec => `
      <div class="recommendation priority-${rec.priority}">
        <h4>${rec.category} (${rec.priority} priority)</h4>
        <p>${rec.description}</p>
        <p><strong>Action:</strong> ${rec.action}</p>
        <p><strong>Affected Packages:</strong> ${rec.affectedPackages.join(', ')}</p>
      </div>
    `,
      )
      .join('')}
  </div>
</body>
</html>`;
  }
}

/**
 * CLI function to run adoption tracking
 */
export async function trackPackageAdoption(
  monorepoRoot?: string,
  outputPath?: string,
): Promise<void> {
  const tracker = new PackageAdoptionTracker(monorepoRoot);

  console.log('📊 Analyzing Node 22+ adoption across packages...');

  const dashboard = await tracker.generateDashboard();

  console.log(`\n📈 Adoption Summary:`);
  console.log(`  Overall Progress: ${dashboard.summary.overallProgress}%`);
  console.log(
    `  Packages Complete: ${dashboard.summary.packagesComplete}/${dashboard.summary.totalPackages}`,
  );
  console.log(`  Average Score: ${dashboard.summary.averageScore}/100`);

  if (outputPath) {
    await tracker.exportDashboard(outputPath);
    console.log(`\n💾 Dashboard exported to: ${outputPath}`);

    const htmlPath = outputPath.replace('.json', '.html');
    const htmlContent = tracker.generateHtmlReport(dashboard);
    await writeFile(htmlPath, htmlContent);
    console.log(`📄 HTML report generated: ${htmlPath}`);
  }

  console.log(`\n🎯 Top Recommendations:`);
  dashboard.recommendations.slice(0, 5).forEach((rec, i) => {
    console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
    console.log(`     Action: ${rec.action}`);
  });
}

// Run if called directly
if (require.main === module) {
  const outputPath = process.argv[2] || './adoption-dashboard.json';
  trackPackageAdoption(undefined, outputPath).catch(console.error);
}
