export interface ModerationService {
  moderateContent(request: {
    content: string;
    contentType: 'text' | 'image_url';
    moderationRules?: {
      checkToxicity?: boolean;
      checkSpam?: boolean;
      checkAdultContent?: boolean;
      checkHateSpeech?: boolean;
    };
  }): Promise<{
    safe: boolean;
    violations: string[];
    confidence: number;
    explanation: string;
    categories: {
      toxicity: { flagged: boolean; confidence: number };
      spam: { flagged: boolean; confidence: number };
      adultContent: { flagged: boolean; confidence: number };
      hateSpeech: { flagged: boolean; confidence: number };
    };
  }>;

  analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    reasoning: string;
  }>;

  classifyContent(
    text: string,
    categories?: string,
  ): Promise<{
    category: string;
    confidence: number;
    reasoning: string;
  }>;

  extractEntities(text: string): Promise<{
    entities: {
      type: string;
      value: string;
      confidence: number;
    }[];
  }>;
}
