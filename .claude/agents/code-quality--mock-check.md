---
name: code-quality--mock-check
description: Sub-agent for checking duplicate mocks that should be centralized. Identifies mocks that appear in multiple test files and suggests centralization.
tools: Grep, Glob, Read, mcp__memory__create_entities, mcp__claude_utils__safe_stringify
model: sonnet
---

You are a Mock Check Sub-Agent that identifies duplicate mocks in test files that should be centralized.

## Input Format

You will receive a JSON request with:
- `version`: Protocol version (currently "1.0")
- `action`: The action to perform (e.g., "check_mocks")
- `packagePath`: Path to the package to analyze
- `sessionId`: Session ID for tracking

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

async function checkAndCentralizeMocks(packagePath, sessionId) {
  console.log("🔍 Checking for duplicate mocks that should be centralized...");

  const results = {
    duplicateMocks: [],
    localOnlyMocks: [],
    warnings: [],
    requiresQaBuild: false
  };

  try {
    // Search for vi.mock calls in test files
    const mockCalls = await Grep({
      pattern: 'vi\\.mock\\(|vi\\.doMock\\(|vi\\.spyOn\\(',
      path: packagePath,
      glob: '**/*.{test,spec}.{ts,tsx,js,jsx}',
      output_mode: 'content',
      '-n': true
    });

    if (!mockCalls) {
      console.log("✅ No vi.mock calls found in test files");
      return results;
    }

    // Parse mock calls to identify what's being mocked
    const mockedModules = new Set();
    const mockLocations = new Map();

    const lines = mockCalls.split('\n');
    for (const line of lines) {
      // Extract module being mocked (e.g., vi.mock('posthog-js'))
      const mockMatch = line.match(/vi\.(mock|doMock)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (mockMatch) {
        const moduleName = mockMatch[2];
        const fileMatch = line.match(/^([^:]+):/);
        if (fileMatch) {
          const file = fileMatch[1];
          mockedModules.add(moduleName);

          if (!mockLocations.has(moduleName)) {
            mockLocations.set(moduleName, []);
          }
          mockLocations.get(moduleName).push(file);
        }
      }
    }

    // Common modules that should be centralized in @repo/qa
    const centralizedModules = [
      'posthog-js',
      'posthog-node',
      '@repo/observability',
      '@repo/analytics',
      'server-only',
      'next/navigation',
      'next/headers',
      '@upstash/redis',
      '@upstash/ratelimit',
      '@sentry/nextjs',
      'stripe',
      '@better-auth/client'
    ];

    // Check for duplicates that should be centralized
    for (const [module, locations] of mockLocations) {
      if (locations.length > 1 || centralizedModules.includes(module)) {
        // Check if already centralized in @repo/qa
        const qaMockCheck = await Grep({
          pattern: `vi\\.mock\\(['"\`]${module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`,
          path: `${packagePath}/../../qa/src/vitest/mocks`,
          output_mode: 'count'
        });

        const isCentralized = qaMockCheck && parseInt(qaMockCheck) > 0;

        if (!isCentralized && (locations.length > 1 || centralizedModules.includes(module))) {
          results.duplicateMocks.push({
            module,
            locations,
            count: locations.length,
            shouldCentralize: true,
            reason: locations.length > 1 ? 'Duplicate mock found' : 'Common module should be centralized'
          });
        } else if (isCentralized && locations.length > 0) {
          results.warnings.push({
            module,
            message: `Mock for '${module}' exists in both @repo/qa and local tests. Consider removing local mock.`,
            locations
          });
        }
      } else {
        // Single use, test-specific mock - this is OK
        results.localOnlyMocks.push({
          module,
          location: locations[0],
          shouldCentralize: false
        });
      }
    }

    // Check if the test setup imports centralized mocks
    const setupFiles = await Glob({
      pattern: '**/test-setup.{ts,js}',
      path: packagePath
    });

    let usesCentralizedMocks = false;
    for (const setupFile of setupFiles.matches || []) {
      const content = await Read({ file_path: setupFile });
      if (content.includes('@repo/qa/vitest/setup')) {
        usesCentralizedMocks = true;
        break;
      }
    }

    if (!usesCentralizedMocks && results.duplicateMocks.length > 0) {
      results.warnings.push({
        type: 'setup',
        message: 'Test setup does not import @repo/qa centralized mocks. Consider using centralized setup.'
      });
    }

    // Report findings
    if (results.duplicateMocks.length > 0) {
      console.log(`\n⚠️ Found ${results.duplicateMocks.length} mocks that should be centralized:`);

      for (const mock of results.duplicateMocks) {
        console.log(`\n   📦 ${mock.module}`);
        console.log(`      Reason: ${mock.reason}`);
        console.log(`      Found in ${mock.count} location(s):`);
        mock.locations.forEach(loc => console.log(`      - ${loc}`));
      }

      console.log('\n💡 Recommendation: Use the mock-centralizer agent to move these mocks to @repo/qa');

      // If critical mocks are duplicated, we need to rebuild @repo/qa after centralizing
      results.requiresQaBuild = true;
    } else {
      console.log("✅ No duplicate mocks found that need centralization");
    }

    if (results.warnings.length > 0) {
      console.log(`\n⚠️ Warnings:`);
      for (const warning of results.warnings) {
        if (warning.type === 'setup') {
          console.log(`   - ${warning.message}`);
        } else {
          console.log(`   - ${warning.message}`);
          warning.locations.forEach(loc => console.log(`     ${loc}`));
        }
      }
    }

    // Store results in memory for reporting
    try {
      await mcp__memory__create_entities([{
        name: `MockAnalysis:${sessionId}`,
        entityType: 'MockAnalysis',
        observations: [
          `session:${sessionId}`,
          `duplicateMocks:${results.duplicateMocks.length}`,
          `localMocks:${results.localOnlyMocks.length}`,
          `warnings:${results.warnings.length}`,
          `requiresQaBuild:${results.requiresQaBuild}`,
          `timestamp:${Date.now()}`
        ]
      }]);
    } catch (error) {
      // Ignore storage errors
    }

    // Don't fail the build for mock issues, but warn strongly
    if (results.duplicateMocks.length > 5) {
      console.warn('\n⚠️ IMPORTANT: Too many duplicate mocks detected. This may cause test failures.');
      console.warn('   Consider running the mock-centralizer agent before proceeding.');
    }

  } catch (error) {
    console.error(`❌ Error checking mock centralization: ${error.message}`);
    results.warnings.push({
      type: 'error',
      message: `Failed to analyze mocks: ${error.message}`
    });
  } finally {
    // Cleanup local Maps/Sets to prevent memory leaks
    if (typeof mockedModules !== 'undefined') {
      mockedModules.clear();
    }
    if (typeof mockLocations !== 'undefined') {
      mockLocations.clear();
    }
  }

  return results;
}
```

## Main Execution

```javascript
// Parse the request from the main agent
const request = JSON.parse(process.env.REQUEST || '{}');

console.log("🔍 Mock Check Sub-Agent Started");
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
    case 'check_mocks':
      if (!request.packagePath) {
        throw new Error('Missing required field: packagePath');
      }
      if (!request.sessionId) {
        throw new Error('Missing required field: sessionId');
      }

      const mockResults = await checkAndCentralizeMocks(
        request.packagePath,
        request.sessionId
      );

      result = {
        success: true,
        ...mockResults,
        timestamp: Date.now()
      };
      break;

    default:
      throw new Error(`Unknown action: ${request.action}`);
  }

  console.log("✅ Mock check completed successfully");
  console.log(`📤 Returning result`);

  // Return the result
  return result;

} catch (error) {
  console.error(`❌ Mock check failed: ${error.message}`);

  // Return error in a structured format
  return {
    success: false,
    error: error.message,
    timestamp: Date.now()
  };
}
```

## Output Format

The sub-agent returns:
- `success`: Boolean indicating if the operation succeeded
- `duplicateMocks`: Array of mocks that should be centralized
- `localOnlyMocks`: Array of mocks that are fine to stay local
- `warnings`: Array of warnings about mock setup
- `requiresQaBuild`: Boolean indicating if @repo/qa needs rebuilding
- `error`: Error message (if failed)
- `timestamp`: Timestamp of the operation