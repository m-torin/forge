import { describe, expect, test, vi } from 'vitest';

// Mock AI SDK
vi.mock('ai', () => ({
  tool: vi.fn(),
  generateText: vi.fn(),
  generateObject: vi.fn(),
  streamText: vi.fn(),
}));

describe('artifacts', () => {
  test('should import artifacts successfully', async () => {
    const artifacts = await import('#/server/core/artifacts');
    expect(artifacts).toBeDefined();
  });

  test('should test artifact creation and management', async () => {
    const {
      ArtifactHandler,
      ArtifactRegistry,
      ArtifactManager,
      InMemoryArtifactStorage,
      createArtifactHandler,
      defaultArtifactRegistry,
      textArtifactHandler,
      codeArtifactHandler,
    } = await import('#/server/core/artifacts');

    // Test ArtifactHandler
    const handler = createArtifactHandler({
      kind: 'test' as const,
      name: 'Test Handler',
      validate: () => true,
    });
    expect(handler).toBeDefined();
    expect(handler.kind).toBe('test');

    // Test ArtifactRegistry
    const registry = new ArtifactRegistry();
    registry.register(handler);
    expect(registry.get('test')).toBeDefined();
    expect(registry.getKinds()).toContain('test');

    // Test ArtifactManager
    const storage = new InMemoryArtifactStorage();
    const manager = new ArtifactManager(registry, storage);

    const artifact = await manager.create('test', 'test content', {
      id: 'test-id',
      title: 'Test Artifact',
    });
    expect(artifact).toBeDefined();
    expect(artifact.metadata.id).toBe('test-id');
    expect(artifact.content).toBe('test content');

    // Test built-in handlers
    expect(textArtifactHandler.kind).toBe('text');
    expect(codeArtifactHandler.kind).toBe('code');
    expect(defaultArtifactRegistry.getKinds()).toContain('text');
    expect(defaultArtifactRegistry.getKinds()).toContain('code');
  });

  test('should test artifact types and validation', async () => {
    const { textArtifactHandler, codeArtifactHandler, imageArtifactHandler, dataArtifactHandler } =
      await import('#/server/core/artifacts');

    // Test text artifact handler
    expect(textArtifactHandler.kind).toBe('text');
    expect(await textArtifactHandler.validate('test text')).toBeTruthy();

    // Test code artifact handler
    expect(codeArtifactHandler.kind).toBe('code');
    expect(await codeArtifactHandler.validate({ code: 'test', language: 'js' })).toBeTruthy();

    // Test image artifact handler
    expect(imageArtifactHandler.kind).toBe('image');
    expect(
      await imageArtifactHandler.validate({ url: 'http://example.com/image.jpg' }),
    ).toBeTruthy();

    // Test data artifact handler
    expect(dataArtifactHandler.kind).toBe('data');
    expect(await dataArtifactHandler.validate({ format: 'json', data: [] })).toBeTruthy();
  });

  test('should test artifact storage and retrieval', async () => {
    const { InMemoryArtifactStorage } = await import('#/server/core/artifacts');

    const storage = new InMemoryArtifactStorage();
    const testArtifact = {
      metadata: {
        id: 'test-456',
        title: 'Test Artifact',
        kind: 'test',
        createdAt: new Date().toISOString(),
      },
      content: 'test content',
    };

    // Test save
    await storage.save(testArtifact);

    // Test load
    const retrieved = await storage.load('test-456');
    expect(retrieved).toBeDefined();
    expect(retrieved?.metadata.id).toBe('test-456');

    // Test list
    const artifacts = await storage.list();
    expect(artifacts).toBeDefined();
    expect(artifacts).toHaveLength(1);

    // Test delete
    await storage.delete('test-456');
    const afterDelete = await storage.load('test-456');
    expect(afterDelete).toBeNull();
  });

  test('should test artifact handler creation', async () => {
    const { createArtifactHandler } = await import('#/server/core/artifacts');

    const customHandler = createArtifactHandler({
      kind: 'custom',
      name: 'Custom Handler',
      validate: content => typeof content === 'string' && content.length > 0,
      transform: input => input.toUpperCase(),
    });

    expect(customHandler.kind).toBe('custom');
    expect(customHandler.name).toBe('Custom Handler');
    expect(await customHandler.validate('test')).toBeTruthy();
    expect(await customHandler.validate('')).toBeFalsy();
    expect(await customHandler.transform('hello')).toBe('HELLO');
  });

  test('should test artifact registry functionality', async () => {
    const { ArtifactRegistry, createArtifactHandler } = await import('#/server/core/artifacts');

    const registry = new ArtifactRegistry();
    const handler1 = createArtifactHandler({ kind: 'type1' });
    const handler2 = createArtifactHandler({ kind: 'type2' });

    // Test register
    registry.register(handler1);
    registry.register(handler2);

    // Test get
    expect(registry.get('type1')).toBe(handler1);
    expect(registry.get('type2')).toBe(handler2);

    // Test getKinds
    const kinds = registry.getKinds();
    expect(kinds).toContain('type1');
    expect(kinds).toContain('type2');

    // Test getAll
    const allHandlers = registry.getAll();
    expect(allHandlers).toHaveLength(2);

    // Test unregister
    registry.unregister('type1');
    expect(registry.get('type1')).toBeUndefined();
    expect(registry.getKinds()).not.toContain('type1');
  });

  test('should test artifact manager complete workflow', async () => {
    const { ArtifactManager, ArtifactRegistry, InMemoryArtifactStorage, createArtifactHandler } =
      await import('#/server/core/artifacts');

    const registry = new ArtifactRegistry();
    const storage = new InMemoryArtifactStorage();
    const manager = new ArtifactManager(registry, storage);

    // Register a handler
    const handler = createArtifactHandler({
      kind: 'test',
      validate: () => true,
    });
    registry.register(handler);

    // Create artifact
    const artifact = await manager.create('test', 'content', {
      id: 'test-123',
      title: 'Test Artifact',
    });

    expect(artifact.metadata.id).toBe('test-123');
    expect(artifact.content).toBe('content');

    // Get artifact
    const retrieved = await manager.get('test-123');
    expect(retrieved).toBeDefined();
    expect(retrieved?.metadata.id).toBe('test-123');

    // Update artifact
    const updated = await manager.update('test-123', { newProperty: 'value' });
    expect(updated.content).toMatchObject({ newProperty: 'value' });

    // List artifacts
    const artifacts = await manager.list();
    expect(artifacts).toHaveLength(1);

    // Delete artifact
    await manager.delete('test-123');
    const afterDelete = await manager.get('test-123');
    expect(afterDelete).toBeNull();
  });
});
