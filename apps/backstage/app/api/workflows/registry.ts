/**
 * Workflow Registry
 * Central registry for all workflow definitions
 */

import { productClassificationWorkflow } from './product-classification';
import { dataSyncWorkflow } from './data-sync';
import { emailCampaignWorkflow } from './email-campaign';
import { imageProcessingWorkflow } from './image-processing';
import { userOnboardingWorkflow } from './user-onboarding';
import { analyticsPipelineWorkflow } from './analytics-pipeline';
import { orderProcessingWorkflow } from './order-processing';
import { imageDeduplicationWorkflow } from './image-deduplication';
import { distributedComputationWorkflow } from './distributed-computation';
import { analyticsVectorizationWorkflow } from './analytics-vectorization';
import { sitemapParserWorkflow } from './sitemap-parser';
import { universalRegistryWorkflow } from './universal-registry';

export interface WorkflowRegistryEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  workflow: any; // The actual workflow definition
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

class WorkflowRegistry {
  private workflows: Map<string, WorkflowRegistryEntry> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // Register all built-in workflows
    this.register({
      workflow: productClassificationWorkflow,
      category: 'ai',
      tags: ['ai', 'classification', 'products', 'machine-learning'],
    });

    this.register({
      workflow: dataSyncWorkflow,
      category: 'integration',
      tags: ['sync', 'data', 'etl', 'batch', 'integration'],
    });

    this.register({
      workflow: emailCampaignWorkflow,
      category: 'marketing',
      tags: ['email', 'campaign', 'marketing', 'batch', 'personalization'],
    });

    this.register({
      workflow: imageProcessingWorkflow,
      category: 'media',
      tags: ['image', 'media', 'cdn', 'optimization', 'processing'],
    });

    this.register({
      workflow: userOnboardingWorkflow,
      category: 'user',
      tags: ['user', 'onboarding', 'lifecycle', 'conditional'],
    });

    this.register({
      workflow: analyticsPipelineWorkflow,
      category: 'analytics',
      tags: ['analytics', 'etl', 'pipeline', 'aggregation', 'insights'],
    });

    this.register({
      workflow: orderProcessingWorkflow,
      category: 'ecommerce',
      tags: ['order', 'payment', 'fulfillment', 'ecommerce', 'transaction'],
    });

    this.register({
      workflow: imageDeduplicationWorkflow,
      category: 'media',
      tags: ['image', 'deduplication', 'hashing', 'perceptual', 'streaming'],
    });

    this.register({
      workflow: distributedComputationWorkflow,
      category: 'compute',
      tags: ['distributed', 'map-reduce', 'parallel', 'computation', 'dynamic'],
    });

    this.register({
      workflow: analyticsVectorizationWorkflow,
      category: 'ml',
      tags: ['analytics', 'vectorization', 'ml', 'embeddings', 'recommendation'],
    });

    this.register({
      workflow: sitemapParserWorkflow,
      category: 'data',
      tags: ['sitemap', 'parser', 'crawler', 'seo', 'tracking'],
    });

    this.register({
      workflow: universalRegistryWorkflow,
      category: 'catalog',
      tags: ['registry', 'catalog', 'product', 'normalization', 'universal'],
    });
  }

  register(options: {
    workflow: any;
    category: string;
    tags: string[];
    enabled?: boolean;
  }) {
    const { workflow, category, tags, enabled = true } = options;
    
    const entry: WorkflowRegistryEntry = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      category,
      tags,
      workflow,
      enabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(workflow.id, entry);
  }

  get(id: string): WorkflowRegistryEntry | undefined {
    return this.workflows.get(id);
  }

  getAll(): WorkflowRegistryEntry[] {
    return Array.from(this.workflows.values());
  }

  getByCategory(category: string): WorkflowRegistryEntry[] {
    return this.getAll().filter(w => w.category === category);
  }

  getByTag(tag: string): WorkflowRegistryEntry[] {
    return this.getAll().filter(w => w.tags.includes(tag));
  }

  search(query: string): WorkflowRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(w => 
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  getCategories(): string[] {
    return [...new Set(this.getAll().map(w => w.category))];
  }

  getTags(): string[] {
    const allTags = this.getAll().flatMap(w => w.tags);
    return [...new Set(allTags)];
  }

  getStats() {
    const workflows = this.getAll();
    const categories = this.getCategories();
    const tags = this.getTags();

    return {
      totalWorkflows: workflows.length,
      enabledWorkflows: workflows.filter(w => w.enabled).length,
      categories: categories.length,
      tags: tags.length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = this.getByCategory(cat).length;
        return acc;
      }, {} as Record<string, number>),
      popularTags: tags
        .map(tag => ({
          tag,
          count: this.getByTag(tag).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  export(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workflows: this.getAll(),
    };
    return JSON.stringify(data, null, 2);
  }

  import(data: string): void {
    const parsed = JSON.parse(data);
    if (parsed.version !== '1.0.0') {
      throw new Error('Unsupported registry version');
    }

    parsed.workflows.forEach((entry: WorkflowRegistryEntry) => {
      this.workflows.set(entry.id, {
        ...entry,
        updatedAt: new Date().toISOString(),
      });
    });
  }
}

// Export singleton instance
export const workflowRegistry = new WorkflowRegistry();

// Export convenience functions
export const getWorkflow = (id: string) => workflowRegistry.get(id);
export const getAllWorkflows = () => workflowRegistry.getAll();
export const searchWorkflows = (query: string) => workflowRegistry.search(query);
export const getWorkflowStats = () => workflowRegistry.getStats();