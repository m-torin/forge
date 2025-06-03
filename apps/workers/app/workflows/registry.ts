import { promises as fs } from 'fs';
import path from 'path';

import type { WorkflowDefinition } from './types';

export interface WorkflowMetadata {
  color?: string;
  defaultPayload?: any;
  description: string;
  difficulty: string;
  estimatedTime: string;
  features: string[];
  icon?: string;
  id: string;
  tags: string[];
  title: string;
}

export async function discoverWorkflows(
  baseDir?: string,
): Promise<Record<string, WorkflowDefinition>> {
  try {
    const workflowsDir = baseDir || path.join(__dirname);
    const entries = await fs.readdir(workflowsDir, { withFileTypes: true });
    const workflows: Record<string, WorkflowDefinition> = {};

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        try {
          const definitionPath = path.join(workflowsDir, entry.name, 'definition.ts');
          await fs.access(definitionPath);

          // Try to import the workflow definition
          const workflowModule = await import(`./${entry.name}/definition`);
          const definition = workflowModule.default || workflowModule;

          if (definition && definition.metadata) {
            workflows[entry.name] = definition;
          } else {
            console.warn(`Skipping ${entry.name}: no valid definition found`);
          }
        } catch {
          console.warn(`Skipping ${entry.name}: no definition.ts found`);
        }
      }
    }

    return workflows;
  } catch (error) {
    console.error('Error discovering workflows:', error);
    return {};
  }
}

export function getWorkflowMetadata(
  workflows: Record<string, WorkflowDefinition>,
): Record<string, WorkflowMetadata> {
  const metadata: Record<string, WorkflowMetadata> = {};

  for (const [name, workflow] of Object.entries(workflows)) {
    if (workflow.metadata) {
      metadata[name] = {
        id: workflow.metadata.id,
        color: workflow.metadata.color,
        defaultPayload: workflow.defaultPayload,
        description: workflow.metadata.description,
        difficulty: workflow.metadata.difficulty || '',
        estimatedTime: workflow.metadata.estimatedTime || '',
        features: workflow.metadata.features || [],
        tags: workflow.metadata.tags || [],
        title: workflow.metadata.title,
        ...(workflow.metadata.color && { color: workflow.metadata.color }),
      };
    }
  }

  return metadata;
}
