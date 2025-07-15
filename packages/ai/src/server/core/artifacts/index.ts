import type { UIMessageStreamWriter } from 'ai';

// AI SDK v5 compatibility adapter
interface DataStreamWriter extends UIMessageStreamWriter {
  writeData(data: any): void;
  writeMessageAnnotation?(data: any): void;
}

// Create adapter that adds missing methods to UIMessageStreamWriter
function _createCompatibleWriter(writer: UIMessageStreamWriter): DataStreamWriter {
  return {
    ...writer,
    writeData(data: any) {
      writer.write({
        type: 'data-custom' as any,
        data: data,
      } as any);
    },
    writeMessageAnnotation(data: any) {
      writer.write({
        type: 'metadata' as any,
        metadata: data,
      } as any);
    },
  };
}

/**
 * Generic artifact/output handling system for AI applications
 * Provides a framework for handling structured AI outputs (documents, code, images, etc.)
 */

/**
 * Base artifact types that can be extended
 */
export type BaseArtifactKind = 'text' | 'code' | 'image' | 'data' | 'custom';

/**
 * Artifact metadata
 */
export interface ArtifactMetadata {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
  updatedAt?: string;
  version?: number;
  tags?: string[];
  [key: string]: any;
}

/**
 * Artifact content with metadata
 */
export interface Artifact<T = any> {
  metadata: ArtifactMetadata;
  content: T;
}

/**
 * Artifact handler configuration
 */
export interface ArtifactHandlerConfig<
  TKind extends string = string,
  TContent = any,
  TContext = any,
> {
  /** The artifact kind this handler manages */
  kind: TKind;

  /** Handler name for logging */
  name?: string;

  /** Validate if this handler can process the given input */
  canHandle?: (input: any) => boolean;

  /** Transform input into artifact content */
  transform?: (input: any, context?: TContext) => TContent | Promise<TContent>;

  /** Validate artifact content */
  validate?: (content: TContent) => boolean | Promise<boolean>;

  /** Serialize artifact for storage */
  serialize?: (content: TContent) => string | Promise<string>;

  /** Deserialize artifact from storage */
  deserialize?: (data: string) => TContent | Promise<TContent>;

  /** Stream artifact creation updates */
  streamCreation?: (
    dataStream: DataStreamWriter,
    metadata: ArtifactMetadata,
    context?: TContext,
  ) => void | Promise<void>;

  /** Stream artifact updates */
  streamUpdate?: (
    dataStream: DataStreamWriter,
    artifact: Artifact<TContent>,
    changes: Partial<TContent>,
    context?: TContext,
  ) => void | Promise<void>;
}

/**
 * Artifact handler implementation
 */
export class ArtifactHandler<TKind extends string = string, TContent = any, TContext = any> {
  constructor(private config: ArtifactHandlerConfig<TKind, TContent, TContext>) {}

  get kind(): TKind {
    return this.config.kind;
  }

  get name(): string {
    return this.config.name || this.config.kind;
  }

  canHandle(input: any): boolean {
    if (this.config.canHandle) {
      return this.config.canHandle(input);
    }
    return true;
  }

  async transform(input: any, context?: TContext): Promise<TContent> {
    if (this.config.transform) {
      return await this.config.transform(input, context);
    }
    return input as TContent;
  }

  async validate(content: TContent): Promise<boolean> {
    if (this.config.validate) {
      return await this.config.validate(content);
    }
    return true;
  }

  async serialize(content: TContent): Promise<string> {
    if (this.config.serialize) {
      return await this.config.serialize(content);
    }
    return JSON.stringify(content);
  }

  async deserialize(data: string): Promise<TContent> {
    if (this.config.deserialize) {
      return await this.config.deserialize(data);
    }
    return JSON.parse(data);
  }

  async createArtifact(
    input: any,
    metadata: Omit<ArtifactMetadata, 'createdAt' | 'kind'>,
    context?: TContext,
  ): Promise<Artifact<TContent>> {
    const content = await this.transform(input, context);
    const isValid = await this.validate(content);

    if (!isValid) {
      throw new Error(`Invalid content for artifact kind: ${this.kind}`);
    }

    return {
      metadata: {
        id: metadata.id,
        title: metadata.title,
        ...metadata,
        kind: this.kind,
        createdAt: new Date().toISOString(),
      },
      content,
    };
  }

  async updateArtifact(
    artifact: Artifact<TContent>,
    changes: Partial<TContent>,
    _context?: TContext,
  ): Promise<Artifact<TContent>> {
    const updatedContent = { ...artifact.content, ...changes };
    const isValid = await this.validate(updatedContent);

    if (!isValid) {
      throw new Error(`Invalid content for artifact kind: ${this.kind}`);
    }

    return {
      metadata: {
        ...artifact.metadata,
        updatedAt: new Date().toISOString(),
        version: (artifact.metadata.version || 1) + 1,
      },
      content: updatedContent,
    };
  }

  async streamCreation(
    dataStream: DataStreamWriter,
    metadata: ArtifactMetadata,
    context?: TContext,
  ): Promise<void> {
    if (this.config.streamCreation) {
      await this.config.streamCreation(dataStream, metadata, context);
    }
  }

  async streamUpdate(
    dataStream: DataStreamWriter,
    artifact: Artifact<TContent>,
    changes: Partial<TContent>,
    context?: TContext,
  ): Promise<void> {
    if (this.config.streamUpdate) {
      await this.config.streamUpdate(dataStream, artifact, changes, context);
    }
  }
}

/**
 * Artifact registry for managing multiple handlers
 */
export class ArtifactRegistry {
  private handlers = new Map<string, ArtifactHandler>();

  register(handler: ArtifactHandler): void {
    this.handlers.set(handler.kind, handler);
  }

  unregister(kind: string): void {
    this.handlers.delete(kind);
  }

  get(kind: string): ArtifactHandler | undefined {
    return this.handlers.get(kind);
  }

  getAll(): ArtifactHandler[] {
    return Array.from(this.handlers.values());
  }

  findHandler(input: any): ArtifactHandler | undefined {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(input)) {
        return handler;
      }
    }
    return undefined;
  }

  getKinds(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Create a standard artifact handler
 */
export function createArtifactHandler<
  TKind extends string = string,
  TContent = any,
  TContext = any,
>(
  config: ArtifactHandlerConfig<TKind, TContent, TContext>,
): ArtifactHandler<TKind, TContent, TContext> {
  return new ArtifactHandler(config);
}

/**
 * Built-in artifact handlers
 */
export const textArtifactHandler = createArtifactHandler({
  kind: 'text' as const,
  name: 'Text Document',
  validate: (content: string) => typeof content === 'string',
  streamCreation: async (dataStream, metadata) => {
    dataStream.write({
      type: 'data-artifact' as any,
      data: {
        kind: 'text',
        title: metadata.title,
        id: metadata.id,
      },
    } as any);
  },
});

export const codeArtifactHandler = createArtifactHandler<
  'code',
  { language: string; code: string }
>({
  kind: 'code',
  name: 'Code Document',
  transform: input => {
    if (typeof input === 'string') {
      return { language: 'javascript', code: input };
    }
    return input;
  },
  validate: content => {
    return typeof content.code === 'string' && typeof content.language === 'string';
  },
  serialize: content => {
    return `\`\`\`${content.language}
${content.code}
\`\`\``;
  },
  streamCreation: async (dataStream, metadata) => {
    dataStream.write({
      type: 'data-artifact' as any,
      data: {
        kind: 'code',
        title: metadata.title,
        id: metadata.id,
      },
    } as any);
  },
});

export const imageArtifactHandler = createArtifactHandler<
  'image',
  { url?: string; base64?: string; alt?: string }
>({
  kind: 'image',
  name: 'Image',
  validate: content => {
    return Boolean(content.url || content.base64);
  },
  streamCreation: async (dataStream, metadata) => {
    dataStream.write({
      type: 'data-artifact' as any,
      data: {
        kind: 'image',
        title: metadata.title,
        id: metadata.id,
      },
    } as any);
  },
});

export const dataArtifactHandler = createArtifactHandler<'data', { format: string; data: any }>({
  kind: 'data',
  name: 'Data/Table',
  transform: input => {
    if (Array.isArray(input)) {
      return { format: 'json', data: input };
    }
    return input;
  },
  validate: content => {
    return ['json', 'csv', 'table'].includes(content.format);
  },
  serialize: async content => {
    if (content.format === 'csv' && Array.isArray(content.data)) {
      // Simple CSV serialization
      const headers = Object.keys(content.data[0] || {});
      const rows = content.data.map(row =>
        headers.map(h => JSON.stringify(row[h] || '')).join(','),
      );
      return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(content.data, null, 2);
  },
  streamCreation: async (dataStream, metadata) => {
    dataStream.write({
      type: 'data-artifact' as any,
      data: {
        kind: 'data',
        title: metadata.title,
        id: metadata.id,
      },
    } as any);
  },
});

/**
 * Default artifact registry with built-in handlers
 */
export const defaultArtifactRegistry = new ArtifactRegistry();
defaultArtifactRegistry.register(textArtifactHandler);
defaultArtifactRegistry.register(codeArtifactHandler);
defaultArtifactRegistry.register(imageArtifactHandler);
defaultArtifactRegistry.register(dataArtifactHandler);

/**
 * Artifact storage interface
 */
export interface ArtifactStorage {
  save(artifact: Artifact): Promise<void>;
  load(id: string): Promise<Artifact | null>;
  update(id: string, artifact: Artifact): Promise<void>;
  delete(id: string): Promise<void>;
  list(filter?: { kind?: string; userId?: string }): Promise<Artifact[]>;
}

/**
 * In-memory artifact storage (for testing/development)
 */
export class InMemoryArtifactStorage implements ArtifactStorage {
  private artifacts = new Map<string, Artifact>();

  async save(artifact: Artifact): Promise<void> {
    this.artifacts.set(artifact.metadata.id, artifact);
  }

  async load(id: string): Promise<Artifact | null> {
    return this.artifacts.get(id) || null;
  }

  async update(id: string, artifact: Artifact): Promise<void> {
    this.artifacts.set(id, artifact);
  }

  async delete(id: string): Promise<void> {
    this.artifacts.delete(id);
  }

  async list(filter?: { kind?: string; userId?: string }): Promise<Artifact[]> {
    let results = Array.from(this.artifacts.values());

    if (filter?.kind) {
      results = results.filter(a => a.metadata.kind === filter.kind);
    }

    if (filter?.userId) {
      results = results.filter(a => a.metadata.userId === filter.userId);
    }

    return results;
  }
}

/**
 * Artifact manager for complete artifact lifecycle
 */
export class ArtifactManager {
  constructor(
    private registry: ArtifactRegistry,
    private storage: ArtifactStorage,
  ) {}

  async create<T = any>(
    kind: string,
    input: any,
    metadata: Omit<ArtifactMetadata, 'createdAt' | 'kind'>,
    context?: any,
  ): Promise<Artifact<T>> {
    const handler = this.registry.get(kind);
    if (!handler) {
      throw new Error(`No handler registered for artifact kind: ${kind}`);
    }

    const artifact = await handler.createArtifact(input, metadata, context);
    await this.storage.save(artifact);

    return artifact as Artifact<T>;
  }

  async update<T = any>(id: string, changes: Partial<T>, context?: any): Promise<Artifact<T>> {
    const existing = await this.storage.load(id);
    if (!existing) {
      throw new Error(`Artifact not found: ${id}`);
    }

    const handler = this.registry.get(existing.metadata.kind);
    if (!handler) {
      throw new Error(`No handler registered for artifact kind: ${existing.metadata.kind}`);
    }

    const updated = await handler.updateArtifact(existing, changes, context);
    await this.storage.update(id, updated);

    return updated as Artifact<T>;
  }

  async get(id: string): Promise<Artifact | null> {
    return this.storage.load(id);
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async list(filter?: { kind?: string; userId?: string }): Promise<Artifact[]> {
    return this.storage.list(filter);
  }
}
