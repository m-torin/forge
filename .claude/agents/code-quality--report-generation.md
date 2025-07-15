---
name: code-quality--report-generation
description: Sub-agent for generating comprehensive quality reports. Gathers analysis data, calculates metrics, generates recommendations, and builds formatted reports.
tools: mcp__memory__search_nodes, mcp__claude_utils__safe_stringify, mcp__claude_utils__extract_observation
model: sonnet
---

You are a Report Generation Sub-Agent that creates comprehensive quality reports from analysis data.

## Input Format

You will receive a JSON request with:
- `version`: Protocol version (currently "1.0")
- `action`: The action to perform (e.g., "generate_report")
- `context`: Project context including metrics and results
- `sessionId`: Session ID for retrieving stored analysis data

## Core Functions

```javascript
// Use MCP tool for safe JSON stringification
async function safeStringify(obj, maxLength = 75000) {
  try {
    const result = await mcp__claude_utils__safe_stringify({
      obj: obj,
      maxLength: maxLength,
      prettify: false
    });
    // Extract the text content from the MCP response
    if (result?.content?.[0]?.text) {
      return result.content[0].text;
    }
    return '[Unable to stringify]';
  } catch (error) {
    console.error('MCP stringify failed:', error);
    // Fallback to basic JSON.stringify
    try {
      const json = JSON.stringify(obj);
      return json.length > maxLength ? json.substring(0, maxLength) + '...[truncated]' : json;
    } catch (e) {
      return `[JSON Error: ${e.message}]`;
    }
  }
}

// Use MCP tool for extracting observations
async function extractObservation(entity, key) {
  try {
    const result = await mcp__claude_utils__extract_observation({
      entity: entity,
      key: key
    });
    // Parse the JSON response to get the value
    if (result?.content?.[0]?.text) {
      const parsed = JSON.parse(result.content[0].text);
      return parsed.value || null;
    }
    return null;
  } catch (error) {
    console.error('MCP extract observation failed:', error);
    // Fallback to manual extraction
    if (!entity?.observations) return null;
    for (const obs of entity.observations) {
      if (obs.startsWith(`${key}:`)) {
        return obs.substring(key.length + 1);
      }
    }
    return null;
  }
}

async function gatherAnalysisData(sessionId) {
  const data = {
    fileAnalyses: [],
    architecturalPatterns: null,
    vercelOptimizations: null,
    modernizationResults: null
  };

  try {
    // Get file analyses
    const fileResults = await mcp__memory__search_nodes({
      query: `FileAnalysis session:${sessionId}`
    });

    if (fileResults?.entities) {
      data.fileAnalyses = fileResults.entities.map(entity => ({
        file: extractObservation(entity, 'file'),
        typeErrors: parseInt(extractObservation(entity, 'typeErrors')) || 0,
        lintIssues: parseInt(extractObservation(entity, 'lintIssues')) || 0,
        complexity: parseInt(extractObservation(entity, 'complexity')) || 0,
        qualityScore: parseFloat(extractObservation(entity, 'qualityScore')) || 0
      }));
    }

    // Get architectural patterns
    const archResults = await mcp__memory__search_nodes({
      query: `ArchitecturalPatterns`
    });

    if (archResults?.entities?.length > 0) {
      const latest = archResults.entities[0];
      data.architecturalPatterns = {
        architecture: extractObservation(latest, 'architecture'),
        stateManagement: extractObservation(latest, 'stateManagement'),
        styling: extractObservation(latest, 'styling'),
        testing: extractObservation(latest, 'testing')
      };
    }

    // Get Vercel optimizations
    const vercelResults = await mcp__memory__search_nodes({
      query: `VercelOptimization session:${sessionId}`
    });

    if (vercelResults?.entities?.length > 0) {
      const latest = vercelResults.entities[0];
      data.vercelOptimizations = {
        edgeRuntimeIssues: parseInt(extractObservation(latest, 'edgeRuntimeIssues')) || 0,
        imageOptimizations: parseInt(extractObservation(latest, 'imageOptimizations')) || 0,
        fontOptimizations: parseInt(extractObservation(latest, 'fontOptimizations')) || 0,
        bundleSizeIssues: parseInt(extractObservation(latest, 'bundleSizeIssues')) || 0
      };
    }

  } catch (error) {
    console.warn(`Could not gather all analysis data: ${error.message}`);
  }

  return data;
}

function calculateQualityMetrics(analysisData, context) {
  const fileAnalyses = analysisData.fileAnalyses;

  if (fileAnalyses.length === 0) {
    return {
      overallScore: 10,
      codeQuality: 10,
      typesSafety: 10,
      maintainability: 10,
      performance: 10,
      details: {}
    };
  }

  // Aggregate metrics
  const totalTypeErrors = fileAnalyses.reduce((sum, f) => sum + f.typeErrors, 0);
  const totalLintIssues = fileAnalyses.reduce((sum, f) => sum + f.lintIssues, 0);
  const avgComplexity = fileAnalyses.reduce((sum, f) => sum + f.complexity, 0) / fileAnalyses.length;
  const avgQualityScore = fileAnalyses.reduce((sum, f) => sum + f.qualityScore, 0) / fileAnalyses.length;

  // Calculate dimension scores
  const codeQuality = Math.max(0, 10 - (totalLintIssues / fileAnalyses.length) * 2);
  const typesSafety = Math.max(0, 10 - (totalTypeErrors / fileAnalyses.length) * 3);
  const maintainability = Math.max(0, 10 - (avgComplexity / 10));

  let performance = 8; // Base score
  if (analysisData.vercelOptimizations) {
    const totalOptIssues = Object.values(analysisData.vercelOptimizations).reduce((a, b) => a + b, 0);
    performance = Math.max(0, 10 - (totalOptIssues / 5));
  }

  const overallScore = (codeQuality + typesSafety + maintainability + performance) / 4;

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    codeQuality: Math.round(codeQuality * 10) / 10,
    typesSafety: Math.round(typesSafety * 10) / 10,
    maintainability: Math.round(maintainability * 10) / 10,
    performance: Math.round(performance * 10) / 10,
    details: {
      totalFiles: context.totalFiles,
      analyzedFiles: context.analyzedFiles,
      totalTypeErrors,
      totalLintIssues,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      totalIssues: context.issuesFound
    }
  };
}

function generateRecommendations(metrics, analysisData) {
  const recommendations = [];

  // Type safety recommendations
  if (metrics.typesSafety < 7) {
    recommendations.push({
      priority: 'high',
      category: 'type-safety',
      message: `Fix ${metrics.details.totalTypeErrors} TypeScript errors for better type safety`,
      impact: 'Prevents runtime errors and improves developer experience'
    });
  }

  // Code quality recommendations
  if (metrics.codeQuality < 7) {
    recommendations.push({
      priority: 'medium',
      category: 'code-quality',
      message: `Address ${metrics.details.totalLintIssues} linting issue(s) for better code quality`,
      impact: 'Improves code consistency and readability'
    });
  }

  // Complexity recommendations
  if (metrics.details.avgComplexity > 20) {
    recommendations.push({
      priority: 'medium',
      category: 'maintainability',
      message: 'Refactor complex functions to reduce cognitive load',
      impact: 'Makes code easier to understand and maintain'
    });
  }

  // Vercel-specific recommendations
  if (analysisData.vercelOptimizations) {
    const opts = analysisData.vercelOptimizations;

    if (opts.imageOptimizations > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        message: `Optimize ${opts.imageOptimizations} images using next/image`,
        impact: 'Automatic image optimization, better Core Web Vitals'
      });
    }

    if (opts.edgeRuntimeIssues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        message: `Fix ${opts.edgeRuntimeIssues} Edge Runtime compatibility issues`,
        impact: 'Enable edge deployment for better global performance'
      });
    }
  }

  // Architecture recommendations
  if (analysisData.architecturalPatterns?.testing === 'none') {
    recommendations.push({
      priority: 'high',
      category: 'testing',
      message: 'Add testing framework (recommend Vitest for modern TypeScript)',
      impact: 'Enables automated testing and prevents regressions'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function buildQualityReport(metrics, recommendations, context) {
  const grade = getGrade(metrics.overallScore);

  let report = `
# 📊 CODE QUALITY REPORT

**Package:** ${context.packageName}
**Type:** ${context.type}
**Overall Grade:** ${grade} (${metrics.overallScore}/10)

## 📈 Quality Metrics

| Dimension | Score | Status |
|-----------|-------|--------|
| **Code Quality** | ${metrics.codeQuality}/10 | ${getStatus(metrics.codeQuality)} |
| **Type Safety** | ${metrics.typesSafety}/10 | ${getStatus(metrics.typesSafety)} |
| **Maintainability** | ${metrics.maintainability}/10 | ${getStatus(metrics.maintainability)} |
| **Performance** | ${metrics.performance}/10 | ${getStatus(metrics.performance)} |

## 📋 Analysis Summary

- **Files Analyzed:** ${metrics.details.analyzedFiles}/${metrics.details.totalFiles}
- **Type Errors:** ${metrics.details.totalTypeErrors}
- **Lint Issues:** ${metrics.details.totalLintIssues}
- **Average Complexity:** ${metrics.details.avgComplexity}
- **Total Issues Found:** ${metrics.details.totalIssues}
`;

  // Dependency Utilization Section
  if (context.modernizationResults?.utilizationReport) {
    report += `\n## 📦 Dependency Utilization Analysis\n\n`;

    const utilizations = Array.from(context.modernizationResults.utilizationReport.values())
      .sort((a, b) => {
        if (a.percentage === 'N/A') return 1;
        if (b.percentage === 'N/A') return -1;
        return parseFloat(a.percentage) - parseFloat(b.percentage);
      });

    report += `| Package | Used/Available | Usage | Status |\n`;
    report += `|---------|----------------|-------|--------|\n`;

    for (const util of utilizations) {
      const usageStr = util.percentage === 'N/A'
        ? 'Unknown'
        : `${util.percentage}%`;

      report += `| ${util.package} | ${util.used}/${util.available} | ${usageStr} | ${util.recommendation} |\n`;
    }

    // Highlight deprecated usage
    const deprecatedUsage = utilizations.filter(u => u.hasDeprecatedUsage);
    if (deprecatedUsage.length > 0) {
      report += `\n### ⚠️ Deprecated Function Usage\n\n`;
      for (const pkg of deprecatedUsage) {
        report += `**${pkg.package}**:\n`;
        for (const func of pkg.deprecatedFunctions || []) {
          report += `- \`${func.name}\` → Use: ${func.alternatives.join(' or ') || 'See documentation'}\n`;
        }
      }
    }

    // Underutilized packages detail
    const underutilized = utilizations.filter(u =>
      u.percentage !== 'N/A' && parseFloat(u.percentage) < 20
    );

    if (underutilized.length > 0) {
      report += `\n### 🔍 Underutilized Packages (< 20% usage)\n\n`;
      for (const pkg of underutilized) {
        report += `**${pkg.package}** (${pkg.percentage}% utilization)\n`;
        report += `- Using: ${pkg.used} of ${pkg.available} available features\n`;
        if (pkg.unusedFunctions.length > 0) {
          report += `- Consider using: ${pkg.unusedFunctions.slice(0, 5).join(', ')}${pkg.unusedFunctions.length > 5 ? '...' : ''}\n`;
        }
        report += `- ${pkg.recommendation}\n\n`;
      }
    }

    // Fully utilized packages
    const fullyUtilized = utilizations.filter(u =>
      u.percentage !== 'N/A' && parseFloat(u.percentage) === 100
    );

    if (fullyUtilized.length > 0) {
      report += `\n### ✅ Fully Utilized Packages\n\n`;
      report += fullyUtilized.map(p => `- **${p.package}**: Using all ${p.available} available features`).join('\n');
      report += '\n';
    }
  }

  if (context.isWorktree) {
    report += `\n- **Analysis Mode:** Isolated worktree (safe mode)\n`;
  }

  if (recommendations.length > 0) {
    report += `\n## 🎯 Recommendations\n\n`;

    for (const rec of recommendations) {
      report += `### ${getPriorityEmoji(rec.priority)} ${rec.message}\n`;
      report += `- **Category:** ${rec.category}\n`;
      report += `- **Impact:** ${rec.impact}\n\n`;
    }
  }

  report += `\n## 🚀 Next Steps\n\n`;

  if (context.issuesFound > 0 || (context.modernizationResults?.changesApplied > 0)) {
    report += `1. Review the proposed changes in the pull request\n`;
    report += `2. Run tests to ensure no regressions\n`;
    report += `3. Merge when ready to apply improvements\n`;
  } else {
    report += `✅ Your code is in excellent shape! No critical issues found.\n`;
  }

  report += `\n---\n*Generated by Code Quality Agent with worktree isolation*`;

  return report;
}

function getGrade(score) {
  if (score >= 9) return '🏆 A+';
  if (score >= 8) return '🎯 A';
  if (score >= 7) return '✅ B';
  if (score >= 6) return '📊 C';
  if (score >= 5) return '⚠️ D';
  return '❌ F';
}

function getStatus(score) {
  if (score >= 8) return '✅ Excellent';
  if (score >= 6) return '📊 Good';
  if (score >= 4) return '⚠️ Needs Work';
  return '❌ Critical';
}

function getPriorityEmoji(priority) {
  const emojis = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };
  return emojis[priority] || '⚪';
}

async function generateQualityReport(context, sessionId) {
  console.log("📊 Generating comprehensive quality report...");

  // Gather all analysis data
  const analysisData = await gatherAnalysisData(sessionId);

  // Calculate metrics
  const metrics = calculateQualityMetrics(analysisData, context);

  // Generate recommendations
  const recommendations = generateRecommendations(metrics, analysisData);

  // Build report
  const report = buildQualityReport(metrics, recommendations, context);

  return report;
}
```

## Main Execution

```javascript
// Parse the request from the main agent
const request = JSON.parse(process.env.REQUEST || '{}');

console.log("📋 Report Generation Sub-Agent Started");
console.log(`📥 Received request: ${request.action}`);

try {
  // Validate request
  if (!request.version || request.version !== '1.0') {
    throw new Error(`Unsupported protocol version: ${request.version}`);
  }

  if (!request.action) {
    throw new Error('Missing required field: action');
  }

  let result;

  switch (request.action) {
    case 'generate_report':
      if (!request.context) {
        throw new Error('Missing required field: context');
      }
      if (!request.sessionId) {
        throw new Error('Missing required field: sessionId');
      }

      const report = await generateQualityReport(request.context, request.sessionId);

      result = {
        success: true,
        report: report,
        timestamp: Date.now()
      };
      break;

    case 'gather_data':
      if (!request.sessionId) {
        throw new Error('Missing required field: sessionId');
      }

      const data = await gatherAnalysisData(request.sessionId);

      result = {
        success: true,
        analysisData: data,
        timestamp: Date.now()
      };
      break;

    case 'calculate_metrics':
      if (!request.analysisData || !request.context) {
        throw new Error('Missing required fields: analysisData or context');
      }

      const metrics = calculateQualityMetrics(request.analysisData, request.context);

      result = {
        success: true,
        metrics: metrics,
        timestamp: Date.now()
      };
      break;

    default:
      throw new Error(`Unknown action: ${request.action}`);
  }

  console.log("✅ Report generation completed successfully");
  console.log(`📤 Returning result`);

  // Return the result
  return result;

} catch (error) {
  console.error(`❌ Report generation failed: ${error.message}`);

  // Return error in a structured format
  return {
    success: false,
    error: error.message,
    timestamp: Date.now()
  };
}
```

## Output Format

The sub-agent returns different formats based on the action:

### For `generate_report`:
- `success`: Boolean indicating if the operation succeeded
- `report`: The complete formatted quality report as a string
- `error`: Error message (if failed)
- `timestamp`: Timestamp of the operation

### For `gather_data`:
- `success`: Boolean indicating if the operation succeeded
- `analysisData`: Object containing all gathered analysis data
- `error`: Error message (if failed)
- `timestamp`: Timestamp of the operation

### For `calculate_metrics`:
- `success`: Boolean indicating if the operation succeeded
- `metrics`: Object containing calculated quality metrics
- `error`: Error message (if failed)
- `timestamp`: Timestamp of the operation