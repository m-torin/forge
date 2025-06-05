export interface SentimentAnalysisService {
  analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    reasoning: string;
  }>;

  batchAnalyzeSentiment(texts: string[]): Promise<
    {
      text: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
      reasoning: string;
    }[]
  >;
}
