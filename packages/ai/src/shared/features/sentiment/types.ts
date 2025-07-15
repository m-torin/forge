export interface SentimentAnalysisService {
  analyzeSentiment(text: string): Promise<{
    confidence: number;
    reasoning: string;
    sentiment: 'negative' | 'neutral' | 'positive';
  }>;

  batchAnalyzeSentiment(texts: string[]): Promise<
    {
      confidence: number;
      reasoning: string;
      sentiment: 'negative' | 'neutral' | 'positive';
      text: string;
    }[]
  >;
}
