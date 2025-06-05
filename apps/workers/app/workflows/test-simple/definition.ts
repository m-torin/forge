interface WorkflowDefinition {
  defaultPayload: any;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    features: string[];
    tags: string[];
    color?: string;
  };
  workflow: (context: any) => Promise<any>;
}

// Simple test workflow that just logs and completes
const testSimpleDefinition: WorkflowDefinition = {
  defaultPayload: {
    message: 'Hello from test workflow',
  },
  metadata: {
    id: 'test-simple',
    color: 'green',
    description: 'Minimal test workflow to verify the system is working',
    difficulty: 'beginner',
    estimatedTime: '1-2 seconds',
    features: [
      'Simple logging',
      'No complex logic',
      'Quick completion',
    ],
    tags: ['test', 'debug'],
    title: 'Test Simple',
  },
  workflow: async (context: any) => {
    // All console.log and non-deterministic code must be inside context.run
    const initResult = await context.run('init', async () => {
      console.log('[TEST-SIMPLE] Workflow started');
      console.log('[TEST-SIMPLE] Context workflowRunId:', context.workflowRunId);
      return { initialized: true };
    });
    
    // Step 1: Log the payload
    const payload = await context.run('log-payload', async () => {
      console.log('[TEST-SIMPLE] Inside log-payload step');
      return { logged: true, result: 'success' };
    });
    
    // Step 2: Complete workflow
    const finalResult = await context.run('complete', async () => {
      console.log('[TEST-SIMPLE] Completing workflow');
      return { 
        success: true, 
        payload,
        initResult,
        timestamp: new Date().toISOString()
      };
    });
    
    return finalResult;
  },
};

export default testSimpleDefinition;