export class EntityExtractor {
  async batchExtractEntities(
    texts: string[],
    customPrompt?: string,
  ): Promise<
    {
      entities: {
        confidence: number;
        type: string;
        value: string;
      }[];
      text: string;
    }[]
  > {
    const results = await Promise.all(
      texts.map(async (text: any) => {
        const result = await this.extractEntities(text, customPrompt);
        return { text, ...result };
      }),
    );
    return results;
  }

  // Placeholder implementation - can be enhanced with specific providers
  async extractEntities(
    _text: string,
    _customPrompt?: string,
  ): Promise<{
    entities: {
      confidence: number;
      type: string;
      value: string;
    }[];
  }> {
    // This would typically use a provider like Anthropic or OpenAI
    throw new Error('EntityExtractor not yet implemented - use provider-specific extractors');
  }
}
