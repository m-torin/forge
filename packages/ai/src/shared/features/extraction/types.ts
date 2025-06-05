export interface EntityExtractionService {
  extractEntities(
    text: string,
    customPrompt?: string,
  ): Promise<{
    entities: {
      type: string;
      value: string;
      confidence: number;
    }[];
  }>;

  batchExtractEntities(
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
  >;
}
