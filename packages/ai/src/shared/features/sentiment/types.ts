export interface SentimentAnalysisService {
  analyzeSentiment(text: string): Promise<{
    confidence: number;
    reasoningText: string;
    sentiment: 'negative' | 'neutral' | 'positive';
  }>;

  batchAnalyzeSentiment(texts: string[]): Promise<
    {
      confidence: number;
      reasoningText: string;
      sentiment: 'negative' | 'neutral' | 'positive';
      text: string;
    }[]
  >;
}
