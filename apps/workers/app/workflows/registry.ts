import { promises as fs } from 'fs';
import path from 'path';

import type { WorkflowDefinition } from './types';

/**
 * Auto-discover all workflows in the workflows directory
 * This runs at build time to generate the workflow registry
 */
export async function discoverWorkflows(): Promise<Record<string, WorkflowDefinition>> {
  const workflows: Record<string, WorkflowDefinition> = {};
  const workflowsDir = path.join(process.cwd(), 'app', 'workflows');

  try {
    const entries = await fs.readdir(workflowsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const workflowPath = path.join(workflowsDir, entry.name);
        const definitionPath = path.join(workflowPath, 'definition.ts');

        try {
          // Check if definition.ts exists
          await fs.access(definitionPath);

          // Import the workflow definition
          const workflowModule = await import(`./${entry.name}/definition`);
          if (workflowModule.default && workflowModule.default.metadata) {
            workflows[entry.name] = workflowModule.default;
          }
        } catch {
          // Skip directories without definition.ts
          console.warn(`Skipping ${entry.name}: no definition.ts found`);
        }
      }
    }
  } catch (error) {
    console.error('Error discovering workflows:', error);
  }

  return workflows;
}

/**
 * Get all workflow metadata for the UI
 * This is a client-safe function that doesn't include the workflow implementation
 */
export function getWorkflowMetadata(workflows: Record<string, WorkflowDefinition>) {
  const metadata: Record<string, any> = {};

  for (const [id, definition] of Object.entries(workflows)) {
    metadata[id] = {
      ...definition.metadata,
      defaultPayload: definition.defaultPayload,
    };
  }

  return metadata;
}
