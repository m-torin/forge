export interface BatchContentAnalysisRequest {
  analysisType: 'classification' | 'extraction' | 'moderation' | 'sentiment';
  contents: {
    content: string;
    contentType: 'image_url' | 'text';
    id: string;
    metadata?: any;
  }[];
  customPrompt?: string;
  rules?: any;
}

export interface ContentModerationRequest {
  content: string;
  contentType: 'image_url' | 'text';
  customPrompt?: string;
  moderationRules: {
    checkAdultContent: boolean;
    checkHateSpeech: boolean;
    checkSpam: boolean;
    checkToxicity: boolean;
    customRules?: string[];
  };
}

export interface ContentModerationResult {
  categories: {
    adultContent: { confidence: number; flagged: boolean };
    custom?: { confidence: number; flagged: boolean; rule: string }[];
    hateSpeech: { confidence: number; flagged: boolean };
    spam: { confidence: number; flagged: boolean };
    toxicity: { confidence: number; flagged: boolean };
  };
  confidence: number;
  explanation: string;
  safe: boolean;
  violations: string[];
}
