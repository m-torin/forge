export interface ContentModerationRequest {
  content: string;
  contentType: 'text' | 'image_url';
  customPrompt?: string;
  moderationRules: {
    checkToxicity: boolean;
    checkSpam: boolean;
    checkAdultContent: boolean;
    checkHateSpeech: boolean;
    customRules?: string[];
  };
}

export interface ContentModerationResult {
  categories: {
    toxicity: { flagged: boolean; confidence: number };
    spam: { flagged: boolean; confidence: number };
    adultContent: { flagged: boolean; confidence: number };
    hateSpeech: { flagged: boolean; confidence: number };
    custom?: { rule: string; flagged: boolean; confidence: number }[];
  };
  confidence: number;
  explanation: string;
  safe: boolean;
  violations: string[];
}

export interface BatchContentAnalysisRequest {
  analysisType: 'moderation' | 'sentiment' | 'classification' | 'extraction';
  contents: {
    id: string;
    content: string;
    contentType: 'text' | 'image_url';
    metadata?: any;
  }[];
  customPrompt?: string;
  rules?: any;
}
