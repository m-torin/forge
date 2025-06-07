import { type NextRequest, NextResponse } from 'next/server';

interface WorkflowStep {
  id: string;
  name: string;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface WorkflowExecution {
  completedAt?: string;
  id: string;
  input: any;
  output?: any;
  startedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
}

// Simple in-memory storage for demo
const executions = new Map<string, WorkflowExecution>();

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    const executionId = `exec_${Date.now()}`;
    const execution: WorkflowExecution = {
      id: executionId,
      input,
      startedAt: new Date().toISOString(),
      status: 'running',
      steps: [
        { id: 'create-user-profile', name: 'Create Profile', status: 'pending' },
        { id: 'send-welcome-email', name: 'Welcome Email', status: 'pending' },
        { id: 'check-referral', name: 'Check Referral', status: 'pending' },
        { id: 'create-workspace', name: 'Setup Workspace', status: 'pending' },
        { id: 'finalize-onboarding', name: 'Complete Setup', status: 'pending' },
      ],
    };

    executions.set(executionId, execution);

    // Simulate async workflow execution
    executeWorkflow(executionId).catch(console.error);

    return NextResponse.json({
      executionId,
      message: 'Workflow execution started',
      status: 'started',
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json({ error: 'Failed to start workflow' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const executionId = url.searchParams.get('executionId');

  if (!executionId) {
    return NextResponse.json({ error: 'executionId parameter required' }, { status: 400 });
  }

  const execution = executions.get(executionId);
  if (!execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
  }

  return NextResponse.json(execution);
}

async function executeWorkflow(executionId: string) {
  const execution = executions.get(executionId);
  if (!execution) return;

  try {
    // Execute each step with simulation
    for (let i = 0; i < execution.steps.length; i++) {
      const step = execution.steps[i];

      // Update step to running
      step.status = 'running';
      executions.set(executionId, execution);

      // Simulate step execution time
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      // Simulate occasional failures (10% chance)
      if (Math.random() < 0.1) {
        step.status = 'failed';
        step.result = { error: 'Simulated failure for testing' };
        execution.status = 'failed';
        executions.set(executionId, execution);
        return;
      }

      // Complete step
      step.status = 'completed';
      step.result = await executeStep(step.id, execution.input);
      executions.set(executionId, execution);
    }

    // Complete workflow
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    execution.output = {
      completedSteps: execution.steps.length,
      onboardingComplete: true,
      profileCreated: true,
      referralProcessed: !!execution.input.referralCode,
      userId: execution.input.userId,
      welcomeEmailSent: true,
      workspaceCreated: true,
    };

    executions.set(executionId, execution);
  } catch (error) {
    execution.status = 'failed';
    execution.steps[execution.steps.findIndex((s) => s.status === 'running')].status = 'failed';
    executions.set(executionId, execution);
  }
}

async function executeStep(stepId: string, input: any): Promise<any> {
  switch (stepId) {
    case 'create-user-profile':
      return {
        createdAt: new Date().toISOString(),
        email: input.email,
        status: 'active',
        userId: input.userId,
      };

    case 'send-welcome-email':
      return {
        emailSent: true,
        recipient: input.email,
        sentAt: new Date().toISOString(),
        templateUsed: 'welcome-v2',
      };

    case 'check-referral':
      const hasReferral = !!input.referralCode;
      return {
        valid: hasReferral && input.referralCode.startsWith('REF'),
        hasReferral,
        referralCode: input.referralCode,
        rewards: hasReferral ? { newUserBonus: 25, referrerBonus: 50 } : null,
      };

    case 'create-workspace':
      return {
        name: `${input.email.split('@')[0]}'s Workspace`,
        createdAt: new Date().toISOString(),
        ownerId: input.userId,
        plan: 'free',
        workspaceId: `ws_${Date.now()}`,
      };

    case 'finalize-onboarding':
      return {
        completedAt: new Date().toISOString(),
        nextSteps: ['Complete profile setup', 'Invite team members', 'Create first project'],
        onboardingComplete: true,
      };

    default:
      return { completed: true };
  }
}
