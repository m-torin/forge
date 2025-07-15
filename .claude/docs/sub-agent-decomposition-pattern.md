# Sub-Agent Decomposition Pattern

## Overview

This document describes the pattern used to decompose the monolithic code-quality agent into smaller, focused sub-agents while maintaining full MCP support and functionality.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Agent (Orchestrator)                 │
│  - Session Management                                        │
│  - Workflow Coordination                                     │
│  - Error Handling & Fallback                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Task() Tool
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │                                                   │
    ▼                                                   ▼
┌─────────────────────┐                    ┌─────────────────────┐
│  File Discovery     │                    │  Code Analysis      │
│  Sub-Agent         │                    │  Sub-Agent          │
│                    │                    │                     │
│ - Git Status       │                    │ - TypeScript Check  │
│ - File Filtering   │                    │ - ESLint Analysis   │
│ - Cache Check      │                    │ - Complexity Calc   │
│ - Batch Creation   │                    │ - Pattern Detection │
└─────────────────────┘                    └─────────────────────┘
    │                                                   │
    ▼                                                   ▼
┌─────────────────────┐                    ┌─────────────────────┐
│  Pattern Detection  │                    │  Modernization      │
│  Sub-Agent         │                    │  Sub-Agent          │
│                    │                    │                     │
│ - Architecture     │                    │ - Dependency Index  │
│ - State Mgmt      │                    │ - Utilization       │
│ - Styling         │                    │ - Deprecation Check │
│ - Testing         │                    │ - Apply Fixes       │
└─────────────────────┘                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Report Generation  │
                    │  Sub-Agent          │
                    │                     │
                    │ - Gather Data       │
                    │ - Calculate Metrics│
                    │ - Generate Report  │
                    └─────────────────────┘
```

## Communication Protocol

### Request Format
```javascript
{
  version: "1.0",           // Protocol version
  action: "action_name",    // Specific action to perform
  // Action-specific parameters
  sessionId: "session-123", // For session-based operations
  options: {                // Optional configuration
    // Feature flags
  }
}
```

### Response Format
```javascript
{
  success: true/false,      // Operation status
  // Action-specific response data
  error: "error message",   // If success is false
  timestamp: Date.now()     // Operation timestamp
}
```

## Implementation Steps

### 1. Identify Functional Boundaries

Look for self-contained functionality that:
- Has clear inputs and outputs
- Performs a specific task
- Has minimal dependencies on other parts
- Can fail independently

Example boundaries identified:
- File discovery and prioritization
- Code analysis and quality scoring
- Pattern detection
- Dependency modernization
- Report generation

### 2. Extract Shared Utilities

Duplicate shared utilities in both agents initially:
```javascript
function safeStringify(obj, maxLength = 75000) { ... }
function extractObservation(entity, key) { ... }
```

This avoids complex dependency management while keeping agents independent.

### 3. Create Sub-Agent Structure

```markdown
---
name: code-quality--[function-name]
description: Sub-agent for [specific functionality]
tools: [required MCP tools]
model: sonnet
---

You are a [Function] Sub-Agent that [specific responsibility].

## Input Format
[Define expected JSON request structure]

## Core Functions
[Include necessary functions]

## Main Execution
[Parse request, execute logic, return structured response]

## Output Format
[Define response structure for each action]
```

### 4. Update Main Agent

Replace inline implementation with sub-agent delegation:

```javascript
async function originalFunction(params) {
  console.log("📞 Delegating to [function] sub-agent...");

  try {
    // Create structured request
    const request = {
      version: '1.0',
      action: 'action_name',
      // Map parameters to request structure
    };

    // Call sub-agent
    const result = await Task({
      subagent_type: 'code-quality--[function]',
      description: 'Description of task',
      prompt: `REQUEST_TYPE: ${safeStringify(request, 1000)}`
    });

    console.log("✅ [Function] sub-agent completed successfully");

    // Validate result
    if (!result || !result.requiredField) {
      throw new Error('Invalid sub-agent response');
    }

    return result;

  } catch (error) {
    console.error(`❌ [Function] sub-agent failed: ${error.message}`);
    console.warn("⚠️ Falling back to inline implementation...");

    // Original implementation as fallback
    // ... existing code ...
  }
}
```

## Best Practices

### 1. Error Handling

Always include fallback to inline implementation:
- Ensures reliability if sub-agent fails
- Allows gradual migration
- Provides debugging path

### 2. Data Validation

Validate both request and response:
```javascript
// Validate request
const requiredFields = ['field1', 'field2'];
const missingFields = requiredFields.filter(field => !request[field]);
if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Validate response
if (!result || typeof result !== 'object') {
  throw new Error('Invalid response format');
}
```

### 3. MCP Tool Usage

Sub-agents can use MCP tools directly:
```javascript
// In sub-agent
const gitStatus = await mcp__git__git_status();
const memoryResult = await mcp__memory__search_nodes({ query: 'search' });
```

### 4. Session Management

Pass session IDs for coordinated operations:
```javascript
// Store in memory with session ID
await mcp__memory__create_entities([{
  name: `EntityType:${sessionId}`,
  entityType: "Type",
  observations: [
    `session:${sessionId}`,
    `data:${value}`
  ]
}]);
```

### 5. Performance Considerations

- Keep request/response payloads reasonable (use `safeStringify`)
- Batch operations when possible
- Cache results in MCP memory
- Clean up resources in sub-agents

## Testing Strategy

### 1. Unit Testing
Test each sub-agent independently:
- Mock MCP tool responses
- Test error conditions
- Validate output format

### 2. Integration Testing
Test main agent with sub-agents:
- Verify delegation works
- Test fallback mechanisms
- Check data flow

### 3. End-to-End Testing
Run complete workflows:
- Create test repository
- Run full analysis
- Verify all phases complete

## Migration Checklist

When decomposing a new function:

- [ ] Identify clear functional boundary
- [ ] Define request/response protocol
- [ ] Extract shared utilities
- [ ] Create sub-agent with proper structure
- [ ] Implement core logic in sub-agent
- [ ] Add comprehensive error handling
- [ ] Update main agent to delegate
- [ ] Include fallback mechanism
- [ ] Test sub-agent independently
- [ ] Test integration with main agent
- [ ] Document any special considerations

## Benefits Achieved

1. **Modularity**: Each sub-agent focuses on one responsibility
2. **Maintainability**: Easier to update individual components
3. **Testability**: Can test each sub-agent in isolation
4. **Scalability**: Can add new sub-agents without modifying others
5. **Reliability**: Fallback mechanisms ensure continuity
6. **Reusability**: Sub-agents can be used by other agents

## Future Enhancements

1. **Centralized Utilities**: Create a shared utility sub-agent
2. **Configuration Management**: Centralized config sub-agent
3. **Caching Layer**: Dedicated caching sub-agent
4. **Parallel Execution**: Run independent sub-agents concurrently
5. **Dynamic Loading**: Load sub-agents based on requirements
6. **Version Management**: Support multiple protocol versions

## Example: Adding a New Sub-Agent

To add a new "Security Analysis" sub-agent:

1. Create `.claude/agents/code-quality--security.md`
2. Define security-specific analysis functions
3. Implement request handling for actions like:
   - `scan_vulnerabilities`
   - `check_dependencies`
   - `audit_permissions`
4. Update main agent to delegate security checks
5. Add fallback to basic security scanning
6. Test with known security issues

## Conclusion

This decomposition pattern provides a practical approach to breaking down monolithic agents while maintaining functionality and reliability. The key is gradual migration with robust fallback mechanisms, ensuring the system remains operational throughout the transition.