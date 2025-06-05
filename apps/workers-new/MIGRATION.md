# Workers-New Orchestration Migration

This document describes the migration of the workers-new application from direct QStash usage to the new `@repo/orchestration-new` package.

## Migration Summary

### What Was Changed

1. **Dependencies**:

   - Added `@repo/orchestration-new` package
   - Removed direct `@upstash/qstash` and `@upstash/workflow` dependencies

2. **Context Layer** (`contexts/WorkflowsContext.tsx`):

   - Added orchestration provider initialization
   - Integrated React hooks from orchestration-new
   - Maintains backward compatibility with existing workflow interface

3. **API Routes**:

   - `app/api/local-trigger/route.ts`: Now uses orchestration workflow engine
   - `app/api/workflow-logs/route.ts`: Updated to use orchestration status
   - `app/api/workflows/cancel/route.ts`: Uses orchestration cancellation methods

4. **Components**:

   - `components/WorkflowMonitor.tsx`: Added orchestration metrics support
   - `components/WorkflowTrigger.tsx`: Shows system status (Legacy vs Orchestration)

5. **Configuration** (`lib/workflow-config.ts`):
   - Added `getOrchestrationConfig()` function
   - Supports both legacy and orchestration configurations

## Environment Variables

The migration requires these environment variables:

### Required for All Modes:

- `WORKFLOW_MODE`: 'local' or 'cloud'

### For Local Development:

- `LOCAL_QSTASH_URL`: Default http://localhost:8080
- `LOCAL_QSTASH_TOKEN`: Default development token
- `LOCAL_WORKFLOW_URL`: Default http://localhost:3001

### For Cloud/Production:

- `CLOUD_QSTASH_TOKEN`: Your Upstash QStash token
- `CLOUD_WORKFLOW_URL`: Your deployed workflow URL
- `CLOUD_QSTASH_URL`: Default https://qstash.upstash.io

### Optional (for Redis state management):

- `UPSTASH_REDIS_REST_URL`: Redis URL for state persistence
- `UPSTASH_REDIS_REST_TOKEN`: Redis token

## Migration Features

### Dual System Support

The migration supports both the old and new systems simultaneously:

- Legacy system continues to work for existing workflows
- New orchestration system provides enhanced features
- UI shows which system is active

### Progressive Enhancement

- If orchestration provider is available, additional features are enabled
- Graceful fallback to legacy system if orchestration is unavailable
- No breaking changes to existing workflow definitions

### Enhanced Monitoring

- Real-time workflow execution status
- Better error handling and retry mechanisms
- Orchestration-level metrics and monitoring
- Circuit breaker patterns for resilience

## How to Test

### 1. Start the Application

```bash
cd apps/workers-new
pnpm dev
```

### 2. Verify Environment

- Check the UI for "Orchestration" badge indicating new system is active
- Verify configuration endpoint: GET `/api/config`

### 3. Test Workflow Execution

1. Navigate to any workflow page (e.g., `/sleep`, `/northStarSimple`)
2. Trigger a workflow with test payload
3. Monitor execution in real-time
4. Verify both legacy and orchestration systems work

### 4. Test Workflow Cancellation

1. Start a long-running workflow
2. Use the cancel functionality
3. Verify workflow is properly cancelled

### 5. Monitor Logs

- Check console for orchestration initialization messages
- Verify no errors during provider setup
- Monitor workflow execution logs

## Key Benefits

1. **Better Error Handling**: Circuit breakers and retry patterns
2. **Enhanced Monitoring**: Real-time metrics and status tracking
3. **Scalability**: Support for multiple workflow providers
4. **Resilience**: Automatic failover and recovery mechanisms
5. **Developer Experience**: Better debugging and monitoring tools

## Troubleshooting

### Orchestration Provider Not Initializing

- Check environment variables are set correctly
- Verify Redis connection (if using state persistence)
- Check QStash token validity

### Workflows Failing to Execute

- Verify workflow URL is accessible
- Check QStash configuration
- Monitor network connectivity

### UI Showing Legacy System

- Orchestration provider failed to initialize
- Check browser console for errors
- Verify configuration API response

## Next Steps

1. **Production Deployment**: Deploy with proper environment variables
2. **Monitoring Setup**: Configure alerts and dashboards
3. **Documentation**: Update team documentation
4. **Training**: Train team on new orchestration features

## Rollback Plan

If needed, the migration can be rolled back by:

1. Remove `@repo/orchestration-new` dependency
2. Restore original package.json dependencies
3. Revert API route changes
4. Remove orchestration-specific code from components

The application maintains backward compatibility during the transition period.
