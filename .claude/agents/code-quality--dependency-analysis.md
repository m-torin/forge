---
name: code-quality--dependency-analysis
description: Sub-agent for analyzing package dependencies and utilization. Handles building dependency indexes, analyzing package usage, and fetching documentation from Context7.
tools: Read, Glob, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__memory__create_entities, mcp__claude_utils__safe_stringify, mcp__claude_utils__extract_observation
model: sonnet
---

You are a Dependency Analysis Sub-Agent that analyzes package dependencies and their utilization within a codebase. You build comprehensive dependency indexes, analyze how packages are used, and fetch documentation to identify modernization opportunities.

## Request Format

You will receive requests in this JSON format:
```json
{
  "version": "1.0",
  "action": "analyze_dependencies" | "analyze_utilization" | "fetch_documentation",
  "packagePath": "/path/to/package",
  "sessionId": "session-123",
  "options": {
    "includeDevDependencies": true,
    "fetchDocs": true,
    "analyzeUsage": true
  }
}
```

## Response Format

Return results in this JSON format:
```json
{
  "success": true,
  "action": "analyze_dependencies",
  "dependencyIndex": { /* Map-like structure */ },
  "utilizationReport": { /* Map-like structure */ },
  "documentation": { /* fetched docs */ },
  "summary": {
    "totalDependencies": 0,
    "underutilized": 0,
    "deprecated": 0
  },
  "error": null
}
```

## Implementation

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

// Main request handler
async function handleRequest(request) {
  try {
    const parsed = typeof request === 'string' ? JSON.parse(request) : request;

    if (!parsed.version || parsed.version !== '1.0') {
      throw new Error('Unsupported request version');
    }

    switch (parsed.action) {
      case 'analyze_dependencies':
        return await analyzeDependencies(parsed);
      case 'analyze_utilization':
        return await analyzeUtilization(parsed);
      case 'fetch_documentation':
        return await fetchDocumentation(parsed);
      default:
        throw new Error(`Unknown action: ${parsed.action}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

async function analyzeDependencies(request) {
  const { packagePath, sessionId, options = {} } = request;

  console.log(`📦 Building comprehensive dependency index for ${packagePath}...`);

  try {
    const dependencyIndex = await buildComprehensiveDependencyIndex(packagePath);

    let utilizationReport = null;
    if (options.analyzeUsage) {
      utilizationReport = await analyzePackageUtilization(dependencyIndex, sessionId);
    }

    const summary = {
      totalDependencies: dependencyIndex.size,
      underutilized: countUnderutilized(utilizationReport),
      deprecated: countDeprecated(utilizationReport)
    };

    return {
      success: true,
      action: 'analyze_dependencies',
      dependencyIndex: Object.fromEntries(dependencyIndex),
      utilizationReport: utilizationReport ? Object.fromEntries(utilizationReport) : null,
      summary,
      error: null
    };

  } catch (error) {
    return {
      success: false,
      action: 'analyze_dependencies',
      error: error.message,
      stack: error.stack
    };
  }
}

async function buildComprehensiveDependencyIndex(packagePath) {
  const dependencyIndex = new Map();

  // Get all source files
  const sourceFiles = await Glob({
    pattern: "**/*.{ts,tsx,js,jsx,mjs}",
    path: packagePath
  });

  const relevantFiles = sourceFiles.filter(file =>
    !file.includes('node_modules') &&
    !file.includes('dist') &&
    !file.includes('.next')
  );

  // Process files in batches for efficiency
  const BATCH_SIZE = 20;
  for (let i = 0; i < relevantFiles.length; i += BATCH_SIZE) {
    const batch = relevantFiles.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (file) => {
      try {
        const content = await Read(`${packagePath}/${file}`);
        const dependencies = await extractDependenciesFromFile(content, file);

        for (const [pkg, data] of dependencies) {
          if (!dependencyIndex.has(pkg)) {
            dependencyIndex.set(pkg, {
              package: pkg,
              files: new Set(),
              functions: new Map(),
              patterns: new Set()
            });
          }

          const entry = dependencyIndex.get(pkg);
          entry.files.add(file);

          // Merge function usage
          for (const [func, patterns] of data.functions) {
            if (!entry.functions.has(func)) {
              entry.functions.set(func, new Set());
            }
            patterns.forEach(p => entry.functions.get(func).add(p));
          }

          // Merge patterns
          data.patterns.forEach(p => entry.patterns.add(p));
        }
      } catch (error) {
        console.warn(`Could not analyze ${file}: ${error.message}`);
      }
    }));
  }

  return dependencyIndex;
}

async function extractDependenciesFromFile(content, filePath) {
  const dependencies = new Map();

  // Enhanced import detection
  const importPatterns = [
    // ES6 imports
    /import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^}]+)\})|(\w+))\s+from\s+['"]([^'"]+)['"]/g,
    // Dynamic imports
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // Require statements
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // Type imports
    /import\s+type\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const packageName = match[match.length - 1];

      // Skip relative imports
      if (packageName.startsWith('.') || packageName.startsWith('@/')) continue;

      // Extract package name from scoped packages
      const pkgName = packageName.startsWith('@')
        ? packageName.split('/').slice(0, 2).join('/')
        : packageName.split('/')[0];

      if (!dependencies.has(pkgName)) {
        dependencies.set(pkgName, {
          functions: new Map(),
          patterns: new Set()
        });
      }

      const dep = dependencies.get(pkgName);

      // Extract imported functions
      if (match[2]) { // Named imports
        const functions = match[2].split(',').map(f => f.trim());
        functions.forEach(func => {
          if (!dep.functions.has(func)) {
            dep.functions.set(func, new Set());
          }
          dep.functions.get(func).add(`import { ${func} }`);
        });
      }

      // Detect usage patterns
      dep.patterns.add(detectUsagePattern(content, pkgName));
    }
  }

  return dependencies;
}

function detectUsagePattern(content, packageName) {
  // Detect how the package is used
  if (content.includes(`${packageName}.config`)) return 'configuration';
  if (content.includes(`new ${packageName}`)) return 'instantiation';
  if (content.includes(`${packageName}(`) || content.includes(`${packageName}.`)) return 'function-call';
  if (content.includes(`extends ${packageName}`)) return 'inheritance';
  if (content.includes(`<${packageName}`) && packageName[0].toUpperCase() === packageName[0]) return 'react-component';

  return 'import-only';
}

async function analyzePackageUtilization(dependencyIndex, sessionId) {
  console.log("\n📊 Analyzing package utilization...");
  const utilizationReport = new Map();

  // Filter out @repo packages
  const externalPackages = Array.from(dependencyIndex.entries())
    .filter(([pkg]) => !pkg.startsWith('@repo/'));

  // Process packages in parallel
  const analyses = await Promise.all(
    externalPackages.map(async ([packageName, depInfo]) => {
      const packageAPI = await fetchCompletePackageAPI(packageName);

      if (!packageAPI) {
        return [packageName, {
          package: packageName,
          available: 'unknown',
          used: depInfo.functions.size,
          percentage: 'N/A',
          unusedFunctions: [],
          recommendation: 'Could not analyze - no API documentation available'
        }];
      }

      const allFeatures = [
        ...packageAPI.functions,
        ...packageAPI.classes,
        ...packageAPI.constants
      ];

      const usedFeatures = Array.from(depInfo.functions.keys());
      const unusedFeatures = allFeatures.filter(f => !usedFeatures.includes(f));
      const percentage = allFeatures.length > 0
        ? (usedFeatures.length / allFeatures.length) * 100
        : 0;

      const utilization = {
        package: packageName,
        available: allFeatures.length,
        used: usedFeatures.length,
        percentage: percentage.toFixed(1),
        unusedFunctions: unusedFeatures.slice(0, 10), // Top 10 unused
        recommendation: getUtilizationRecommendation(percentage, unusedFeatures.length)
      };

      // Fetch docs for each used function
      for (const funcName of usedFeatures) {
        const funcDocs = await fetchFunctionDocumentation(packageName, funcName);
        if (funcDocs?.deprecated) {
          utilization.hasDeprecatedUsage = true;
          utilization.deprecatedFunctions = utilization.deprecatedFunctions || [];
          utilization.deprecatedFunctions.push({
            name: funcName,
            alternatives: funcDocs.alternatives
          });
        }
      }

      return [packageName, utilization];
    })
  );

  // Convert back to Map
  for (const [pkg, analysis] of analyses) {
    utilizationReport.set(pkg, analysis);
  }

  // Store in memory for reporting
  await storeUtilizationAnalysis(sessionId, utilizationReport);

  return utilizationReport;
}

async function fetchCompletePackageAPI(packageName) {
  if (packageName.startsWith('@repo/')) return null;

  try {
    const libId = await mcp__context7__resolve_library_id({ libraryName: packageName });
    if (!libId?.selectedLibraryId) return null;

    const apiDocs = await mcp__context7__get_library_docs({
      context7CompatibleLibraryID: libId.selectedLibraryId,
      topic: "api",
      tokens: 5000 // More tokens for complete API
    });

    const api = {
      package: packageName,
      functions: extractAllFunctions(apiDocs?.content),
      classes: extractAllClasses(apiDocs?.content),
      constants: extractAllConstants(apiDocs?.content),
      types: extractAllTypes(apiDocs?.content)
    };

    return api;
  } catch (error) {
    console.warn(`Could not fetch API for ${packageName}`);
    return null;
  }
}

async function fetchFunctionDocumentation(packageName, functionName) {
  // Skip @repo packages
  if (packageName.startsWith('@repo/')) return null;

  try {
    const libId = await mcp__context7__resolve_library_id({ libraryName: packageName });
    if (!libId?.selectedLibraryId) return null;

    const docs = await mcp__context7__get_library_docs({
      context7CompatibleLibraryID: libId.selectedLibraryId,
      topic: `api/${functionName}`,
      tokens: 1000
    });

    const functionInfo = {
      name: functionName,
      package: packageName,
      deprecated: docs?.content?.includes('@deprecated') || false,
      alternatives: extractAlternatives(docs?.content),
      correctUsage: extractUsagePattern(docs?.content),
      description: extractDescription(docs?.content)
    };

    return functionInfo;
  } catch (error) {
    console.warn(`Could not fetch docs for ${packageName}.${functionName}`);
    return null;
  }
}

// Helper extraction functions
function extractAllFunctions(content) {
  if (!content) return [];
  const functionPattern = /(?:function|const|export)\s+(\w+)\s*(?:\(|=)/g;
  const matches = [...content.matchAll(functionPattern)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractAllClasses(content) {
  if (!content) return [];
  const classPattern = /(?:class|interface)\s+(\w+)/g;
  const matches = [...content.matchAll(classPattern)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractAllConstants(content) {
  if (!content) return [];
  const constantPattern = /(?:const|export\s+const)\s+([A-Z_]+)\s*=/g;
  const matches = [...content.matchAll(constantPattern)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractAllTypes(content) {
  if (!content) return [];
  const typePattern = /(?:type|export\s+type)\s+(\w+)\s*=/g;
  const matches = [...content.matchAll(typePattern)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractAlternatives(content) {
  if (!content) return [];
  const altPattern = /use\s+(\w+)\s+instead/gi;
  const matches = [...content.matchAll(altPattern)];
  return matches.map(m => m[1]);
}

function extractUsagePattern(content) {
  if (!content) return null;
  // Extract code examples or usage patterns
  const codeBlockPattern = /```(?:javascript|typescript|js|ts)?\n([\s\S]*?)```/g;
  const match = codeBlockPattern.exec(content);
  return match ? match[1].trim() : null;
}

function extractDescription(content) {
  if (!content) return null;
  // Extract first paragraph as description
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('*')) {
      return line.trim();
    }
  }
  return null;
}

function getUtilizationRecommendation(percentage, unusedCount) {
  if (percentage === 'N/A') return 'Review documentation availability';

  const pct = parseFloat(percentage);
  if (pct === 100) return '✅ Fully utilized';
  if (pct >= 75) return '✅ Well utilized';
  if (pct >= 50) return '📊 Moderately utilized';
  if (pct >= 20) return '⚠️ Consider using more features or a lighter alternative';
  if (pct >= 5) return '⚠️ Underutilized - consider removing or using a specific utility';
  return '❌ Barely used - strong candidate for removal';
}

async function storeUtilizationAnalysis(sessionId, utilizationReport) {
  try {
    const summary = {
      totalPackages: utilizationReport.size,
      underutilized: 0,
      wellUtilized: 0,
      fullyUtilized: 0,
      hasDeprecated: 0
    };

    for (const [, util] of utilizationReport) {
      if (util.percentage !== 'N/A') {
        const pct = parseFloat(util.percentage);
        if (pct === 100) summary.fullyUtilized++;
        else if (pct >= 50) summary.wellUtilized++;
        else summary.underutilized++;
      }
      if (util.hasDeprecatedUsage) summary.hasDeprecated++;
    }

    await mcp__memory__create_entities([{
      name: `UtilizationAnalysis:${sessionId}`,
      entityType: 'DependencyUtilization',
      observations: [
        `session:${sessionId}`,
        `totalPackages:${summary.totalPackages}`,
        `underutilized:${summary.underutilized}`,
        `wellUtilized:${summary.wellUtilized}`,
        `fullyUtilized:${summary.fullyUtilized}`,
        `hasDeprecated:${summary.hasDeprecated}`,
        `timestamp:${Date.now()}`
      ]
    }]);
  } catch (error) {
    console.warn(`Could not store utilization analysis: ${error.message}`);
  }
}

function countUnderutilized(utilizationReport) {
  if (!utilizationReport) return 0;
  let count = 0;
  for (const [, util] of utilizationReport) {
    if (util.percentage !== 'N/A' && parseFloat(util.percentage) < 20) count++;
  }
  return count;
}

function countDeprecated(utilizationReport) {
  if (!utilizationReport) return 0;
  let count = 0;
  for (const [, util] of utilizationReport) {
    if (util.hasDeprecatedUsage) count++;
  }
  return count;
}

async function analyzeUtilization(request) {
  const { dependencyIndex, sessionId } = request;

  try {
    // Convert from object back to Map if needed
    const indexMap = dependencyIndex instanceof Map
      ? dependencyIndex
      : new Map(Object.entries(dependencyIndex));

    const utilizationReport = await analyzePackageUtilization(indexMap, sessionId);

    return {
      success: true,
      action: 'analyze_utilization',
      utilizationReport: Object.fromEntries(utilizationReport),
      summary: {
        totalPackages: utilizationReport.size,
        underutilized: countUnderutilized(utilizationReport),
        deprecated: countDeprecated(utilizationReport)
      },
      error: null
    };

  } catch (error) {
    return {
      success: false,
      action: 'analyze_utilization',
      error: error.message,
      stack: error.stack
    };
  }
}

async function fetchDocumentation(request) {
  const { packageName, functionName } = request;

  try {
    let result;

    if (functionName) {
      result = await fetchFunctionDocumentation(packageName, functionName);
    } else {
      result = await fetchCompletePackageAPI(packageName);
    }

    return {
      success: true,
      action: 'fetch_documentation',
      documentation: result,
      error: null
    };

  } catch (error) {
    return {
      success: false,
      action: 'fetch_documentation',
      error: error.message,
      stack: error.stack
    };
  }
}

// Main execution
const request = process.argv[2];
if (request) {
  handleRequest(request).then(result => {
    console.log(safeStringify(result));
  });
}
```

## Error Handling

The sub-agent includes comprehensive error handling:
- Invalid request format returns error response
- File read failures are logged but don't stop analysis
- MCP failures fall back gracefully
- All errors include stack traces for debugging

## Performance Optimizations

- Batch processing of files (20 at a time)
- Parallel API documentation fetching
- Caching handled by main agent
- Memory-efficient Map/Set usage