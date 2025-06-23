/**
 * Workflow Registry
 * Central registry for all workflow definitions
 */

import { affiliateProductSyncWorkflow } from './affiliate-product-sync';
import { analyticsPipelineWorkflow } from './analytics-pipeline';
import { analyticsVectorizationWorkflow } from './analytics-vectorization';
import { dataSyncWorkflow } from './data-sync';
import { distributedComputationWorkflow } from './distributed-computation';
import { emailCampaignWorkflow } from './email-campaign';
import { imageDeduplicationWorkflow } from './image-deduplication';
import { imageProcessingWorkflow } from './image-processing';
import { orderProcessingWorkflow } from './order-processing';
import { priceMonitoringWorkflow } from './price-monitoring';
import { productClassificationWorkflow } from './product-classification';
import { sitemapParserWorkflow } from './sitemap-parser';
import { universalRegistryWorkflow } from './universal-registry';
import { userOnboardingWorkflow } from './user-onboarding';

export interface WorkflowRegistryEntry {
  category: string;
  createdAt: string;
  description: string;
  enabled: boolean;
  id: string;
  name: string;
  tags: string[];
  updatedAt: string;
  version: string;
  workflow: any; // The actual workflow definition
}

class WorkflowRegistry {
  private workflows = new Map<string, WorkflowRegistryEntry>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // Register all built-in workflows
    this.register({
      category: 'ai',
      tags: ['ai', 'classification', 'products', 'machine-learning'],
      workflow: productClassificationWorkflow,
    });

    this.register({
      category: 'integration',
      tags: ['sync', 'data', 'etl', 'batch', 'integration'],
      workflow: dataSyncWorkflow,
    });

    this.register({
      category: 'marketing',
      tags: ['email', 'campaign', 'marketing', 'batch', 'personalization'],
      workflow: emailCampaignWorkflow,
    });

    this.register({
      category: 'media',
      tags: ['image', 'media', 'cdn', 'optimization', 'processing'],
      workflow: imageProcessingWorkflow,
    });

    this.register({
      category: 'user',
      tags: ['user', 'onboarding', 'lifecycle', 'conditional'],
      workflow: userOnboardingWorkflow,
    });

    this.register({
      category: 'analytics',
      tags: ['analytics', 'etl', 'pipeline', 'aggregation', 'insights'],
      workflow: analyticsPipelineWorkflow,
    });

    this.register({
      category: 'ecommerce',
      tags: ['order', 'payment', 'fulfillment', 'ecommerce', 'transaction'],
      workflow: orderProcessingWorkflow,
    });

    this.register({
      category: 'media',
      tags: ['image', 'deduplication', 'hashing', 'perceptual', 'streaming'],
      workflow: imageDeduplicationWorkflow,
    });

    this.register({
      category: 'compute',
      tags: ['distributed', 'map-reduce', 'parallel', 'computation', 'dynamic'],
      workflow: distributedComputationWorkflow,
    });

    this.register({
      category: 'ml',
      tags: ['analytics', 'vectorization', 'ml', 'embeddings', 'recommendation'],
      workflow: analyticsVectorizationWorkflow,
    });

    this.register({
      category: 'data',
      tags: ['sitemap', 'parser', 'crawler', 'seo', 'tracking'],
      workflow: sitemapParserWorkflow,
    });

    this.register({
      category: 'catalog',
      tags: ['registry', 'catalog', 'product', 'normalization', 'universal'],
      workflow: universalRegistryWorkflow,
    });

    this.register({
      category: 'ecommerce',
      tags: ['affiliate', 'sync', 'product', 'marketplace', 'integration', 'multi-network'],
      workflow: affiliateProductSyncWorkflow,
    });

    this.register({
      category: 'ecommerce',
      tags: ['price', 'monitoring', 'alerts', 'tracking', 'affiliate', 'real-time'],
      workflow: priceMonitoringWorkflow,
    });
  }

  register(options: { workflow: any; category: string; tags: string[]; enabled?: boolean }) {
    const { category, enabled = true, tags, workflow } = options;

    const entry: WorkflowRegistryEntry = {
      id: workflow.id,
      name: workflow.name,
      category,
      createdAt: new Date().toISOString(),
      description: workflow.description,
      enabled,
      tags,
      updatedAt: new Date().toISOString(),
      version: workflow.version,
      workflow,
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
    return this.getAll().filter((w) => w.category === category);
  }

  getByTag(tag: string): WorkflowRegistryEntry[] {
    return this.getAll().filter((w) => w.tags.includes(tag));
  }

  search(query: string): WorkflowRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (w) =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery) ||
        w.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
    );
  }

  getCategories(): string[] {
    return [...new Set(this.getAll().map((w) => w.category))];
  }

  getTags(): string[] {
    const allTags = this.getAll().flatMap((w) => w.tags);
    return [...new Set(allTags)];
  }

  getStats() {
    const workflows = this.getAll();
    const categories = this.getCategories();
    const tags = this.getTags();

    return {
      byCategory: categories.reduce(
        (acc, cat) => {
          acc[cat] = this.getByCategory(cat).length;
          return acc;
        },
        {} as Record<string, number>,
      ),
      categories: categories.length,
      enabledWorkflows: workflows.filter((w) => w.enabled).length,
      popularTags: tags
        .map((tag) => ({
          count: this.getByTag(tag).length,
          tag,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10),
      tags: tags.length,
      totalWorkflows: workflows.length,
    };
  }

  export(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
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
