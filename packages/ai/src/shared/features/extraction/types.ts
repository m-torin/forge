export interface EntityExtractionService {
  batchExtractEntities(
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
  >;

  extractEntities(
    text: string,
    customPrompt?: string,
  ): Promise<{
    entities: {
      confidence: number;
      type: string;
      value: string;
    }[];
  }>;
}
