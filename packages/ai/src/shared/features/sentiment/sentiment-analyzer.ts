import type { AIProvider } from '../../types/provider';

export interface SentimentAnalysisResult {
  sentiment: 'negative' | 'neutral' | 'positive';
  confidence: number;
  score: number;
}

export class SentimentAnalyzer {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    if (!provider.capabilities.has('sentiment')) {
      throw new Error('Provider does not support sentiment analysis');
    }
    this.provider = provider;
  }

  /**
   * Analyze sentiment of a single text
   */
  async analyze(text: string): Promise<SentimentAnalysisResult> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    if (!this.provider.analyzeSentiment) {
      throw new Error('Provider does not support sentiment analysis');
    }

    const result = await this.provider.analyzeSentiment(text);

    // Use the score from the provider result if available, otherwise derive from sentiment
    let score: number;
    if ('score' in result && typeof result.score === 'number') {
      score = result.score;
    } else {
      // Fallback: derive score from sentiment
      if (result.sentiment === 'positive') {
        score = 0.8;
      } else if (result.sentiment === 'negative') {
        score = -0.6;
      } else {
        score = 0.1;
      }
    }

    return {
      sentiment: result.sentiment,
      confidence: result.confidence,
      score,
    };
  }

  /**
   * Analyze sentiment of multiple texts
   */
  async analyzeBatch(texts: string[]): Promise<SentimentAnalysisResult[]> {
    if (texts.length === 0) {
      return [];
    }

    const results = await Promise.all(
      texts.map(async text => {
        try {
          return await this.analyze(text);
        } catch (_error) {
          throw new Error('Analysis failed');
        }
      }),
    );

    return results;
  }

  /**
   * Get sentiment label from score
   */
  getSentimentLabel(score: number): 'negative' | 'neutral' | 'positive' {
    if (score > 0.3) {
      return 'positive';
    } else if (score < -0.3) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Get confidence level from confidence score
   */
  getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
    if (confidence >= 0.8) {
      return 'high';
    } else if (confidence >= 0.6) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   */
  async analyzeSentiment(text: string): Promise<{
    confidence: number;
    reasoning: string;
    sentiment: 'negative' | 'neutral' | 'positive';
  }> {
    const result = await this.analyze(text);
    return {
      confidence: result.confidence,
      reasoning: `Sentiment analysis result: ${result.sentiment}`,
      sentiment: result.sentiment,
    };
  }

  async batchAnalyzeSentiment(texts: string[]): Promise<
    {
      confidence: number;
      reasoning: string;
      sentiment: 'negative' | 'neutral' | 'positive';
      text: string;
    }[]
  > {
    const results = await this.analyzeBatch(texts);
    return results.map((result, index) => ({
      confidence: result.confidence,
      reasoning: `Sentiment analysis result: ${result.sentiment}`,
      sentiment: result.sentiment,
      text: texts[index],
    }));
  }
}
