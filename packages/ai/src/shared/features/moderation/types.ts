export interface ModerationService {
  analyzeSentiment(text: string): Promise<{
    confidence: number;
    reasoning: string;
    sentiment: 'negative' | 'neutral' | 'positive';
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
      confidence: number;
      type: string;
      value: string;
    }[];
  }>;

  moderateContent(request: {
    content: string;
    contentType: 'image_url' | 'text';
    moderationRules?: {
      checkAdultContent?: boolean;
      checkHateSpeech?: boolean;
      checkSpam?: boolean;
      checkToxicity?: boolean;
    };
  }): Promise<{
    categories: {
      adultContent: { confidence: number; flagged: boolean };
      hateSpeech: { confidence: number; flagged: boolean };
      spam: { confidence: number; flagged: boolean };
      toxicity: { confidence: number; flagged: boolean };
    };
    confidence: number;
    explanation: string;
    safe: boolean;
    violations: string[];
  }>;
}
