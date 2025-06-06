export class EntityExtractor {
  // Placeholder implementation - can be enhanced with specific providers
  async extractEntities(
    _text: string,
    _customPrompt?: string,
  ): Promise<{
    entities: {
      type: string;
      value: string;
      confidence: number;
    }[];
  }> {
    // This would typically use a provider like Anthropic or OpenAI
    throw new Error('EntityExtractor not yet implemented - use provider-specific extractors');
  }

  async batchExtractEntities(
    texts: string[],
    customPrompt?: string,
  ): Promise<
    {
      text: string;
      entities: {
        type: string;
        value: string;
        confidence: number;
      }[];
    }[]
  > {
    const results = await Promise.all(
      texts.map(async (text) => {
        const result = await this.extractEntities(text, customPrompt);
        return { text, ...result };
      }),
    );
    return results;
  }
}
