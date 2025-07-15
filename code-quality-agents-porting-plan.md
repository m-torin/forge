# Code Quality Agents Porting Plan

## 📋 Audit Summary

### Current State

- **14 specialized agents** in `.claude/agents/` using Task-based communication
- **Worktree-based isolation** for safe code analysis
- **MCP memory integration** for data persistence
- **Complex orchestration** via main agent + subagents

### Key Findings

1. **AI SDK v5 provides native multi-step execution** - No need for custom Task
   orchestration
2. **`activeTools` enables progressive unlocking** - Perfect for our phased
   workflow
3. **`stopWhen` replaces `maxSteps`** - More flexible control flow
4. **Multi-modal results support** - Can return analysis + visualizations
5. **Built-in streaming callbacks** - Real-time progress updates

### Technical Gaps

- Tool property naming changed (`args`→`input`, `result`→`output`)
- Need to convert from Task communication to tool definitions
- Memory persistence requires MCP client integration
- Worktree management needs to be a tool, not implicit

## 🚀 Development Plan

### Phase 1: Foundation (Week 1)

**Goal**: Create core infrastructure and tool definitions

#### 1.1 Create Tool Registry Structure

```bash
packages/ai/src/server/tools/code-quality/
├── index.ts # Main exports and workflow
├── tools/
│ ├── worktree.ts          # Git worktree management
│ ├── file-discovery.ts    # File finding and prioritization
│ ├── pattern-detection.ts # Architecture analysis
│ ├── analysis.ts          # Code quality checks
│ ├── optimization.ts      # Vercel-specific optimizations
│ └── report-generation.ts # Report creation
└── workflows/
└── full-analysis.ts # Complete workflow orchestration
```

#### 1.2 Implement Core Tools

- [ ] Convert `code-quality--worktree` → `worktreeTool`
- [ ] Convert `code-quality--file-discovery` → `fileDiscoveryTool`
- [ ] Convert `code-quality--pattern-detection` → `patternDetectionTool`
- [ ] Add MCP memory integration to each tool
- [ ] Implement `experimental_toToolResultContent` for rich outputs

#### 1.3 Setup MCP Integration

- [ ] Create MCP client wrapper for AI package
- [ ] Add memory persistence utilities
- [ ] Implement session management

### Phase 2: Workflow Orchestration (Week 2)

**Goal**: Implement multi-step workflow with progressive tool unlocking

#### 2.1 Create Workflow Controller

- [ ] Implement `codeQualityWorkflow` with all tools
- [ ] Add `stopWhen` conditions for each phase
- [ ] Create `experimental_prepareStep` for tool progression
- [ ] Add error handling and retry logic

#### 2.2 Implement Tool Progression Logic

```typescript
// Progressive phases:
// 1. Worktree creation (isolation)
// 2. File discovery (scope definition)
// 3. Analysis (parallel: patterns, quality, optimizations)
// 4. Report generation (aggregation)
// 5. PR creation (completion)
```

#### 2.3 Add Streaming Callbacks

- [ ] Implement `onStepFinish` for progress tracking
- [ ] Add `onToolRepair` for error recovery
- [ ] Create progress event emitters

### Phase 3: Integration (Week 3)

**Goal**: Integrate with ai-chatbot app

#### 3.1 Create API Routes

- [ ] Add `/api/code-quality/analyze` endpoint
- [ ] Implement streaming response handling
- [ ] Add progress SSE endpoint

#### 3.2 Frontend Integration

- [ ] Create CodeQualityAnalysis component
- [ ] Add real-time progress display
- [ ] Implement multi-modal result rendering

#### 3.3 Testing & Validation

- [ ] Unit tests for each tool
- [ ] Integration tests for workflow
- [ ] End-to-end tests with sample repos

### Phase 4: Enhancement (Week 4)

**Goal**: Add advanced features and optimizations

#### 4.1 Advanced Features

- [ ] Add visual report generation (charts, diagrams)
- [ ] Implement incremental analysis
- [ ] Add custom rule configuration
- [ ] Create analysis templates

#### 4.2 Performance Optimization

- [ ] Add caching for repeated analyses
- [ ] Implement parallel tool execution
- [ ] Optimize memory usage
- [ ] Add telemetry and monitoring

### Phase 5: Documentation & Deployment (Week 5)

**Goal**: Prepare for production use

#### 5.1 Documentation

- [ ] API documentation
- [ ] User guide for ai-chatbot integration
- [ ] Architecture diagrams
- [ ] Migration guide from Task-based agents

#### 5.2 Deployment

- [ ] Environment configuration
- [ ] Performance benchmarks
- [ ] Security review
- [ ] Gradual rollout plan

## 📊 Success Metrics

1. **Feature Parity**: All 14 agent capabilities available as tools
2. **Performance**: <5min for full codebase analysis
3. **Safety**: Zero unintended code modifications
4. **Usability**: Single API call for complete analysis
5. **Reliability**: 99% success rate with retry logic

## 🔧 Technical Decisions

1. **Use AI SDK v5 native features** instead of custom orchestration
2. **Preserve worktree isolation** for safety
3. **Leverage MCP for memory** instead of custom storage
4. **Progressive tool unlocking** for controlled execution
5. **Multi-modal results** for rich analysis output

## 🚦 Risk Mitigation

1. **Worktree conflicts**: Implement locking mechanism
2. **Memory limitations**: Add result pagination
3. **Timeout handling**: Use `stopWhen` with duration limits
4. **Error cascades**: Implement circuit breakers
5. **API rate limits**: Add request queuing

## 🔄 Migration Strategy

### From Task-based Agents to AI SDK v5 Tools

#### Current Architecture (Task-based)

```typescript
// .claude/agents/code-quality--pattern-detection.md
export async function handleTask(sessionId, request) {
  const patterns = await detectPatterns(request.paths);
  await persistToMemory(sessionId, patterns);
  return formatResponse(patterns);
}
```

#### New Architecture (AI SDK v5)

```typescript
// packages/ai/src/server/tools/code-quality/tools/pattern-detection.ts
export const patternDetectionTool = tool({
  description: "Detect architectural patterns in codebase",
  inputSchema: z.object({
    sessionId: z.string(),
    paths: z.array(z.string()).optional()
  }),
  execute: async ({ sessionId, paths }, { toolCallId }) => {
    const patterns = await detectPatterns(paths);
    await mcpClient.createEntities([
      {
        name: `PatternAnalysis:${sessionId}`,
        entityType: "CodeQualityResult",
        observations: [`patterns:${JSON.stringify(patterns)}`]
      }
    ]);
    return patterns;
  },
  experimental_toToolResultContent: (patterns) => [
    { type: "text", text: `Found ${patterns.length} patterns` }
  ]
});
```

## 📝 Implementation Notes

### Key AI SDK v5 Features to Leverage

1. **`activeTools`** - Control which tools are available at each step
2. **`stopWhen`** - Advanced stopping conditions beyond step count
3. **`experimental_prepareStep`** - Dynamic step configuration
4. **`experimental_toToolResultContent`** - Multi-modal outputs
5. **Tool streaming callbacks** - Real-time progress updates

### Memory Persistence Pattern

```typescript
// Consistent entity naming across all tools
const entityName = `${ToolName}:${sessionId}`;
const observations = [
  `timestamp:${Date.now()}`,
  `toolCallId:${toolCallId}`,
  `result:${JSON.stringify(result)}`
];
```

### Error Handling Strategy

```typescript
// Use AI SDK v5's built-in retry with custom repair
experimental_repairToolCall: async ({ toolCall, error }) => {
  if (error.message.includes("worktree locked")) {
    // Wait and retry
    await delay(1000);
    return toolCall;
  }
  return null; // Let it fail
};
```

This plan provides a clear path from our current Task-based agent system to a
fully integrated AI SDK v5 solution while maintaining all safety guarantees and
enhancing capabilities.
