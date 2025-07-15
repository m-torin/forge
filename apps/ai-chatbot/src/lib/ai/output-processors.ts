/**
 * Experimental Output Processors
 * Advanced processing capabilities for AI responses
 */

// JSON repair processor
export function repairJSON(malformedJson: string): {
  success: boolean;
  data?: any;
  error?: string;
} {
  try {
    // First try to parse as-is
    const parsed = JSON.parse(malformedJson);
    return { success: true, data: parsed };
  } catch (_error) {
    // Try common fixes
    let repaired = malformedJson
      .trim()
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Fix unquoted keys
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      // Fix trailing comma before closing
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    try {
      const parsed = JSON.parse(repaired);
      return { success: true, data: parsed };
    } catch (secondError) {
      return {
        success: false,
        error: `JSON repair failed: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`,
      };
    }
  }
}

// Sentiment analysis processor
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
} {
  const positiveWords = [
    'good',
    'great',
    'excellent',
    'amazing',
    'wonderful',
    'fantastic',
    'love',
    'like',
    'happy',
    'pleased',
    'satisfied',
    'perfect',
    'awesome',
    'brilliant',
    'outstanding',
    'impressive',
    'successful',
    'effective',
    'helpful',
    'useful',
    'valuable',
  ];

  const negativeWords = [
    'bad',
    'terrible',
    'awful',
    'horrible',
    'hate',
    'dislike',
    'angry',
    'frustrated',
    'disappointed',
    'unsatisfied',
    'poor',
    'worse',
    'worst',
    'failed',
    'broken',
    'useless',
    'ineffective',
    'problematic',
    'difficult',
    'confusing',
    'annoying',
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  const foundKeywords: string[] = [];

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
      foundKeywords.push(cleanWord);
    } else if (negativeWords.includes(cleanWord)) {
      negativeCount++;
      foundKeywords.push(cleanWord);
    }
  });

  const totalSentimentWords = positiveCount + negativeCount;
  const confidence =
    totalSentimentWords > 0 ? Math.min((totalSentimentWords / words.length) * 10, 1) : 0;

  let sentiment: 'positive' | 'negative' | 'neutral';
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    keywords: [...new Set(foundKeywords)],
  };
}

// Entity extraction processor
export function extractEntities(text: string): {
  people: string[];
  organizations: string[];
  locations: string[];
  dates: string[];
  urls: string[];
  emails: string[];
  phoneNumbers: string[];
} {
  // Simple regex-based entity extraction
  const entities = {
    people: [] as string[],
    organizations: [] as string[],
    locations: [] as string[],
    dates: [] as string[],
    urls: [] as string[],
    emails: [] as string[],
    phoneNumbers: [] as string[],
  };

  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  entities.emails = [...(text.match(emailRegex) || [])];

  // Extract URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  entities.urls = [...(text.match(urlRegex) || [])];

  // Extract phone numbers (simple patterns)
  // eslint-disable-next-line security/detect-unsafe-regex
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
  entities.phoneNumbers = [...(text.match(phoneRegex) || [])];

  // Extract dates (simple patterns)
  const dateRegex =
    /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;
  entities.dates = [...(text.match(dateRegex) || [])];

  // Extract potential proper nouns (capitalized words that might be names/organizations/locations)
  // eslint-disable-next-line security/detect-unsafe-regex
  const properNounRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const properNouns = [...(text.match(properNounRegex) || [])];

  // Simple heuristics to categorize proper nouns
  const commonWords = [
    'The',
    'This',
    'That',
    'And',
    'Or',
    'But',
    'In',
    'On',
    'At',
    'To',
    'For',
    'Of',
    'With',
    'By',
  ];
  const locationWords = [
    'City',
    'State',
    'Country',
    'Street',
    'Avenue',
    'Road',
    'Drive',
    'Lane',
    'County',
    'Province',
  ];
  const organizationWords = [
    'Inc',
    'Corp',
    'LLC',
    'Ltd',
    'Company',
    'Corporation',
    'University',
    'College',
    'School',
    'Hospital',
  ];

  properNouns.forEach(noun => {
    if (commonWords.includes(noun)) return;

    if (organizationWords.some(word => noun.includes(word))) {
      entities.organizations.push(noun);
    } else if (locationWords.some(word => noun.includes(word))) {
      entities.locations.push(noun);
    } else if (noun.split(' ').length <= 3) {
      // Assume shorter proper nouns are more likely to be people
      entities.people.push(noun);
    } else {
      // Longer proper nouns might be organizations
      entities.organizations.push(noun);
    }
  });

  // Remove duplicates
  Object.keys(entities).forEach(key => {
    entities[key as keyof typeof entities] = [...new Set(entities[key as keyof typeof entities])];
  });

  return entities;
}

// Text summarization processor
export function summarizeText(
  text: string,
  maxLength: number = 150,
): {
  summary: string;
  keyPhrases: string[];
  wordCount: number;
  originalLength: number;
} {
  const originalLength = text.length;
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // If text is already short, return as-is
  if (text.length <= maxLength) {
    return {
      summary: text,
      keyPhrases: [],
      wordCount,
      originalLength,
    };
  }

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

  if (sentences.length <= 1) {
    return {
      summary: text.substring(0, maxLength) + '...',
      keyPhrases: [],
      wordCount,
      originalLength,
    };
  }

  // Score sentences based on word frequency and position
  const wordFreq: { [key: string]: number } = {};
  const cleanWords = text
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\w]/g, ''))
    .filter(
      w =>
        w.length > 3 &&
        !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'were', 'said'].includes(
          w,
        ),
    );

  cleanWords.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = sentenceWords.reduce((sum, word) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      return sum + (wordFreq[cleanWord] || 0);
    }, 0);

    // Boost score for early sentences
    const positionBoost = index < 2 ? 1.5 : 1;

    return { sentence: sentence.trim(), score: score * positionBoost, index };
  });

  // Select top sentences up to max length
  sentenceScores.sort((a, b) => b.score - a.score);

  let summary = '';
  let selectedSentences: typeof sentenceScores = [];

  for (const sentenceObj of sentenceScores) {
    if (summary.length + sentenceObj.sentence.length + 2 <= maxLength) {
      selectedSentences.push(sentenceObj);
      summary += sentenceObj.sentence + '. ';
    }
  }

  // Sort selected sentences by original order
  selectedSentences.sort((a, b) => a.index - b.index);
  summary = selectedSentences
    .map(s => s.sentence)
    .join('. ')
    .trim();

  // Extract key phrases (most frequent multi-word combinations)
  const phrases: { [key: string]: number } = {};
  const bigramRegex = /\b\w+\s+\w+\b/g;
  const triggramRegex = /\b\w+\s+\w+\s+\w+\b/g;

  [...(text.match(bigramRegex) || []), ...(text.match(triggramRegex) || [])].forEach(phrase => {
    const cleanPhrase = phrase.toLowerCase();
    phrases[cleanPhrase] = (phrases[cleanPhrase] || 0) + 1;
  });

  const keyPhrases = Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([phrase]) => phrase);

  return {
    summary: summary || text.substring(0, maxLength) + '...',
    keyPhrases,
    wordCount,
    originalLength,
  };
}

// Language detection processor
export function detectLanguage(text: string): {
  language: string;
  confidence: number;
  script: string;
} {
  // Simple language detection based on character patterns and common words
  const patterns = {
    english: {
      chars: /[a-zA-Z]/,
      words: [
        'the',
        'and',
        'is',
        'in',
        'to',
        'of',
        'a',
        'that',
        'it',
        'with',
        'for',
        'as',
        'was',
        'on',
        'are',
      ],
      script: 'Latin',
    },
    spanish: {
      chars: /[a-zA-ZñáéíóúüÑÁÉÍÓÚÜ]/,
      words: [
        'el',
        'la',
        'de',
        'que',
        'y',
        'en',
        'un',
        'es',
        'se',
        'no',
        'te',
        'lo',
        'le',
        'da',
        'su',
      ],
      script: 'Latin',
    },
    french: {
      chars: /[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/,
      words: [
        'le',
        'de',
        'et',
        'à',
        'un',
        'il',
        'être',
        'et',
        'en',
        'avoir',
        'que',
        'pour',
        'dans',
        'ce',
        'son',
      ],
      script: 'Latin',
    },
    german: {
      chars: /[a-zA-ZäöüßÄÖÜ]/,
      words: [
        'der',
        'die',
        'und',
        'in',
        'den',
        'von',
        'zu',
        'das',
        'mit',
        'sich',
        'des',
        'auf',
        'für',
        'ist',
        'im',
      ],
      script: 'Latin',
    },
  };

  const words = text.toLowerCase().split(/\s+/).slice(0, 50); // Check first 50 words
  const scores: { [key: string]: number } = {};

  Object.entries(patterns).forEach(([lang, pattern]) => {
    let score = 0;

    // Check character pattern
    const charMatches = text.match(pattern.chars);
    if (charMatches) {
      score += Math.min(charMatches.length / text.length, 1) * 0.3;
    }

    // Check common words
    const wordMatches = words.filter(word => pattern.words.includes(word.replace(/[^\w]/g, '')));
    score += (wordMatches.length / Math.min(words.length, 20)) * 0.7;

    scores[lang] = score;
  });

  const bestMatch = Object.entries(scores).reduce(
    (best, [lang, score]) => (score > best.score ? { language: lang, score } : best),
    { language: 'english', score: 0 },
  );

  const pattern = patterns[bestMatch.language as keyof typeof patterns] || patterns.english;

  return {
    language: bestMatch.language,
    confidence: Math.round(Math.min(bestMatch.score, 1) * 100) / 100,
    script: pattern.script,
  };
}

// Output processor registry
export interface ProcessorResult {
  type: string;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: any;
}

export class OutputProcessorRegistry {
  private processors: Map<string, (input: any, options?: any) => ProcessorResult> = new Map();

  constructor() {
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors() {
    this.register('json-repair', (input: string) => {
      const result = repairJSON(input);
      return {
        type: 'json-repair',
        success: result.success,
        data: result.data,
        error: result.error,
      };
    });

    this.register('sentiment-analysis', (input: string) => {
      const result = analyzeSentiment(input);
      return {
        type: 'sentiment-analysis',
        success: true,
        data: result,
      };
    });

    this.register('entity-extraction', (input: string) => {
      const result = extractEntities(input);
      return {
        type: 'entity-extraction',
        success: true,
        data: result,
      };
    });

    this.register('text-summarization', (input: string, options?: { maxLength?: number }) => {
      const result = summarizeText(input, options?.maxLength);
      return {
        type: 'text-summarization',
        success: true,
        data: result,
      };
    });

    this.register('language-detection', (input: string) => {
      const result = detectLanguage(input);
      return {
        type: 'language-detection',
        success: true,
        data: result,
      };
    });
  }

  register(name: string, processor: (input: any, options?: any) => ProcessorResult) {
    this.processors.set(name, processor);
  }

  process(name: string, input: any, options?: any): ProcessorResult {
    const processor = this.processors.get(name);
    if (!processor) {
      return {
        type: name,
        success: false,
        error: `Processor '${name}' not found`,
      };
    }

    try {
      return processor(input, options);
    } catch (_error) {
      return {
        type: name,
        success: false,
        error: 'Processing failed',
      };
    }
  }

  getAvailableProcessors(): string[] {
    return Array.from(this.processors.keys());
  }
}

// Global processor registry instance
export const outputProcessors = new OutputProcessorRegistry();
