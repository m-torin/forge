"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import {
  findManyWorkflowConfigs as findManyWorkflows,
  findFirstWorkflowConfig as findFirstWorkflow,
  createWorkflowConfig as createWorkflow,
  updateWorkflowConfig as updateWorkflow,
  findManyWorkflowExecutions,
  createWorkflowExecution,
  updateWorkflowExecution,
  countWorkflowExecutions,
} from "../orm/workflows";

// Get all workflows for an organization
export async function getOrganizationWorkflows(organizationId: string) {
  "use server";
  
  const cached = unstable_cache(
    async () => {
      return findManyWorkflows({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              executions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`org-workflows-${organizationId}`],
    {
      revalidate: 600, // 10 minutes
      tags: [`org-${organizationId}-workflows`, "workflows"],
    }
  );
  
  return cached();
}

// Get workflow with execution history
export async function getWorkflowWithExecutions(
  workflowId: string,
  limit = 20,
) {
  "use server";
  
  const cached = unstable_cache(
    async () => {
      const workflow = await findFirstWorkflow({
        where: {
          id: workflowId,
          deletedAt: null,
        },
        include: {
          executions: {
            take: limit,
            orderBy: { createdAt: "desc" },
          },
        },
      });
      
      return workflow;
    },
    [`workflow-${workflowId}-executions`],
    {
      revalidate: 60, // 1 minute
      tags: [`workflow-${workflowId}`, "workflows"],
    }
  );
  
  return cached();
}

// Create workflow execution
export async function createExecution(
  workflowId: string,
  data: {
    status: string;
    input?: any;
    output?: any;
    error?: any;
  },
) {
  "use server";
  
  const execution = await createWorkflowExecution({
    data: {
      workflowRunId: workflowId, // Changed from workflowId to workflowRunId
      status: data.status,
      input: data.input || {},
      startedAt: new Date(),
    },
  });
  
  // Revalidate cache
  revalidateTag(`workflow-${workflowId}`);
  
  return execution;
}

// Update execution status
export async function updateExecutionStatus(
  executionId: string,
  status: string,
  data?: {
    output?: any;
    error?: any;
  },
) {
  "use server";
  
  const execution = await updateWorkflowExecution({
    where: { id: executionId },
    data: {
      status,
      // output and error fields don't exist in WorkflowExecution schema
      // They are stored in the 'logs' field or separate log entries
      completedAt: ["completed", "failed"].includes(status) 
        ? new Date() 
        : undefined,
    },
  });
  
  return execution;
}