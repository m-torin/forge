import { readdirSync, statSync } from 'fs';
import { basename, extname, join } from 'path';

import { type WorkflowDefinition } from '@/types';

interface WorkflowModule {
  default: {
    id: string;
    name: string;
    description: string;
    version?: string;
    tags?: string[];
    category?: string;
    author?: string;
    timeout?: number;
    retries?: number;
    concurrency?: number;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
    handler: (input: any) => Promise<any>;
  };
}

export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();
  private watchers = new Set<(workflows: WorkflowDefinition[]) => void>();
  private isWatching = false;

  constructor(private workflowsDir = './workflows') {}

  async initialize(): Promise<void> {
    await this.scanWorkflows();
    if (process.env.NODE_ENV === 'development') {
      this.startWatching();
    }
  }

  private async scanWorkflows(): Promise<void> {
    try {
      const workflowPath = join(process.cwd(), this.workflowsDir);

      if (!this.directoryExists(workflowPath)) {
        console.warn(`Workflows directory not found: ${workflowPath}`);
        return;
      }

      const files = this.getWorkflowFiles(workflowPath);

      for (const file of files) {
        await this.loadWorkflow(file);
      }

      console.log(`Loaded ${this.workflows.size} workflows`);
    } catch (error) {
      console.error('Failed to scan workflows:', error);
    }
  }

  private directoryExists(path: string): boolean {
    try {
      return statSync(path).isDirectory();
    } catch {
      return false;
    }
  }

  private getWorkflowFiles(dir: string): string[] {
    const files: string[] = [];

    const scanDirectory = (currentDir: string) => {
      const entries = readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (this.isWorkflowFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(dir);
    return files;
  }

  private isWorkflowFile(filename: string): boolean {
    const ext = extname(filename);
    const base = basename(filename, ext);
    return (
      (ext === '.ts' || ext === '.js') &&
      (base === 'workflow' || base === 'definition' || base === 'index')
    );
  }

  private async loadWorkflow(filePath: string): Promise<void> {
    try {
      // Clear module cache in development
      if (process.env.NODE_ENV === 'development') {
        delete require.cache[require.resolve(filePath)];
      }

      const module = (await import(filePath)) as WorkflowModule;
      const workflow = module.default;

      if (!workflow || typeof workflow.handler !== 'function') {
        console.warn(`Invalid workflow in ${filePath}: missing handler function`);
        return;
      }

      const definition: WorkflowDefinition = {
        id: workflow.id || this.generateIdFromPath(filePath),
        name: workflow.name || this.generateNameFromPath(filePath),
        author: workflow.author || 'unknown',
        category: workflow.category || 'general',
        concurrency: workflow.concurrency || 1,
        createdAt: new Date(),
        description: workflow.description || 'No description provided',
        filePath,
        inputSchema: workflow.inputSchema,
        lastModified: statSync(filePath).mtime,
        outputSchema: workflow.outputSchema,
        retries: workflow.retries || 3,
        tags: workflow.tags || [],
        timeout: workflow.timeout || 300000, // 5 minutes default
        updatedAt: new Date(),
        version: workflow.version || '1.0.0',
      };

      this.workflows.set(definition.id, definition);
      this.notifyWatchers();

      console.log(`✓ Loaded workflow: ${definition.name} (${definition.id})`);
    } catch (error) {
      console.error(`Failed to load workflow from ${filePath}:`, error);
    }
  }

  private generateIdFromPath(filePath: string): string {
    return filePath
      .replace(process.cwd(), '')
      .replace(/^\/workflows\//, '')
      .replace(/\/(workflow|definition|index)\.(ts|js)$/, '')
      .replace(/\//g, '-')
      .toLowerCase();
  }

  private generateNameFromPath(filePath: string): string {
    const id = this.generateIdFromPath(filePath);
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private startWatching(): void {
    if (this.isWatching) return;

    this.isWatching = true;

    // Simple file watching - in production you'd use chokidar
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const workflowPath = join(process.cwd(), this.workflowsDir);

      if (this.directoryExists(workflowPath)) {
        fs.watch(workflowPath, { recursive: true }, (eventType: string, filename: string) => {
          if (filename && this.isWorkflowFile(filename)) {
            console.log(`Workflow file ${eventType}: ${filename}`);
            // Debounce reloads
            setTimeout(() => this.scanWorkflows(), 1000);
          }
        });
      }
    }
  }

  private notifyWatchers(): void {
    const workflows = Array.from(this.workflows.values());
    this.watchers.forEach((watcher) => watcher(workflows));
  }

  // Public API
  getWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  getWorkflowsByCategory(category: string): WorkflowDefinition[] {
    return this.getWorkflows().filter((w) => w.category === category);
  }

  getWorkflowsByTag(tag: string): WorkflowDefinition[] {
    return this.getWorkflows().filter((w) => w.tags?.includes(tag));
  }

  searchWorkflows(query: string): WorkflowDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getWorkflows().filter(
      (w) =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery) ||
        w.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }

  subscribe(callback: (workflows: WorkflowDefinition[]) => void): () => void {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  async executeWorkflow(id: string, input: Record<string, any>): Promise<any> {
    const workflow = this.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    try {
      const module = (await import(workflow.filePath)) as WorkflowModule;
      return await module.default.handler(input);
    } catch (error) {
      console.error(`Failed to execute workflow ${id}:`, error);
      throw error;
    }
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.getWorkflows().forEach((w) => {
      if (w.category) categories.add(w.category);
    });
    return Array.from(categories).sort();
  }

  getTags(): string[] {
    const tags = new Set<string>();
    this.getWorkflows().forEach((w) => {
      w.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  getStats() {
    const workflows = this.getWorkflows();
    return {
      byCategory: workflows.reduce(
        (acc, w) => {
          const cat = w.category || 'uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      categories: this.getCategories().length,
      tags: this.getTags().length,
      total: workflows.length,
    };
  }

  // Register a workflow programmatically
  async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    this.workflows.set(workflow.id, workflow);
    console.log(`Registered workflow: ${workflow.id}`);
    this.notifyWatchers();
  }
}

// Singleton instance
export const workflowRegistry = new WorkflowRegistry();
