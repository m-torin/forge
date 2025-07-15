/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

describe('SimpleEditor Stories', () => {
  it('should import stories without throwing', async () => {
    // Test that the story file can be imported without syntax errors
    expect(async () => {
      await import('#/components/SimpleEditor/SimpleEditor.stories');
    }).not.toThrow();
  });

  it('should have required story exports', async () => {
    const stories = await import('#/components/SimpleEditor/SimpleEditor.stories');

    // Check that the required exports exist
    expect(stories.default).toBeDefined(); // Meta export
    expect(stories.Default).toBeDefined(); // Basic story
    expect(stories.Empty).toBeDefined(); // Empty story
    expect(stories.WithRichContent).toBeDefined(); // Rich content story
    expect(stories.CollaborativeDefault).toBeDefined(); // Collaborative story
  });

  it('should have proper story structure', async () => {
    const stories = await import('#/components/SimpleEditor/SimpleEditor.stories');

    // Verify meta structure
    const meta = stories.default;
    expect(meta.title).toBe('Editor/SimpleEditor');
    expect(meta.component).toBeDefined();
    expect(meta.parameters).toBeDefined();
    expect(meta.argTypes).toBeDefined();

    // Verify story structure
    const defaultStory = stories.Default;
    expect(defaultStory.args).toBeDefined();
    expect(defaultStory.play).toBeDefined();
  });
});
