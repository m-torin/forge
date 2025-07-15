import { SentimentAnalyzer } from '@/shared/features/sentiment/sentiment-analyzer';
import type { AIProvider } from '@/shared/types/provider';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock provider
const createMockProvider = (overrides: Partial<AIProvider> = {}): AIProvider => ({
  name: 'test-sentiment-provider',
  type: 'custom',
  capabilities: new Set(['sentiment']),
  analyzeSentiment: vi.fn().mockResolvedValue({
    sentiment: 'positive',
    confidence: 0.95,
    score: 0.8,
  }),
  complete: vi.fn(),
  stream: vi.fn(),
  ...overrides,
});

describe('sentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;
  let mockProvider: AIProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProvider = createMockProvider();
    analyzer = new SentimentAnalyzer(mockProvider);
  });

  describe('constructor', () => {
    test('should create analyzer with provider', () => {
      expect(analyzer).toBeInstanceOf(SentimentAnalyzer);
    });

    test('should throw error if provider lacks sentiment capability', () => {
      const invalidProvider = createMockProvider({
        capabilities: new Set(['complete']),
      });

      expect(() => new SentimentAnalyzer(invalidProvider)).toThrow(
        'Provider does not support sentiment analysis',
      );
    });
  });

  describe('analyze', () => {
    test('should analyze positive sentiment', async () => {
      const text = 'I love this product! It works great.';
      const result = await analyzer.analyze(text);

      expect(mockProvider.analyzeSentiment).toHaveBeenCalledWith(text);
      expect(result).toStrictEqual({
        sentiment: 'positive',
        confidence: 0.95,
        score: 0.8,
      });
    });

    test('should analyze negative sentiment', async () => {
      const mockNegativeProvider = createMockProvider({
        analyzeSentiment: vi.fn().mockResolvedValue({
          sentiment: 'negative',
          confidence: 0.88,
          score: -0.6,
        }),
      });

      analyzer = new SentimentAnalyzer(mockNegativeProvider);
      const text = 'This product is terrible and broken.';
      const result = await analyzer.analyze(text);

      expect(result).toStrictEqual({
        sentiment: 'negative',
        confidence: 0.88,
        score: -0.6,
      });
    });

    test('should analyze neutral sentiment', async () => {
      const mockNeutralProvider = createMockProvider({
        analyzeSentiment: vi.fn().mockResolvedValue({
          sentiment: 'neutral',
          confidence: 0.92,
          score: 0.1,
        }),
      });

      analyzer = new SentimentAnalyzer(mockNeutralProvider);
      const text = 'This is a description of the product features.';
      const result = await analyzer.analyze(text);

      expect(result).toStrictEqual({
        sentiment: 'neutral',
        confidence: 0.92,
        score: 0.1,
      });
    });

    test('should handle empty text', async () => {
      await expect(analyzer.analyze('')).rejects.toThrow('Text cannot be empty');
    });

    test('should handle provider errors', async () => {
      const errorProvider = createMockProvider({
        analyzeSentiment: vi.fn().mockRejectedValue(new Error('API error')),
      });

      analyzer = new SentimentAnalyzer(errorProvider);

      await expect(analyzer.analyze('test text')).rejects.toThrow('API error');
    });
  });

  describe('analyzeBatch', () => {
    test('should analyze multiple texts', async () => {
      const texts = ['I love this!', 'This is okay.', 'I hate this!'];

      const mockBatchProvider = createMockProvider({
        analyzeSentiment: vi
          .fn()
          .mockResolvedValueOnce({ sentiment: 'positive', confidence: 0.9, score: 0.8 })
          .mockResolvedValueOnce({ sentiment: 'neutral', confidence: 0.7, score: 0.1 })
          .mockResolvedValueOnce({ sentiment: 'negative', confidence: 0.85, score: -0.7 }),
      });

      analyzer = new SentimentAnalyzer(mockBatchProvider);
      const results = await analyzer.analyzeBatch(texts);

      expect(results).toHaveLength(3);
      expect(results[0].sentiment).toBe('positive');
      expect(results[1].sentiment).toBe('neutral');
      expect(results[2].sentiment).toBe('negative');
    });

    test('should handle empty batch', async () => {
      const results = await analyzer.analyzeBatch([]);
      expect(results).toStrictEqual([]);
    });

    test('should handle partial failures in batch', async () => {
      const texts = ['Good text', 'Bad text'];

      const mockBatchProvider = createMockProvider({
        analyzeSentiment: vi
          .fn()
          .mockResolvedValueOnce({ sentiment: 'positive', confidence: 0.9, score: 0.8 })
          .mockRejectedValueOnce(new Error('Analysis failed')),
      });

      analyzer = new SentimentAnalyzer(mockBatchProvider);

      await expect(analyzer.analyzeBatch(texts)).rejects.toThrow('Analysis failed');
    });
  });

  describe('getSentimentLabel', () => {
    test('should return correct labels for scores', () => {
      expect(analyzer.getSentimentLabel(0.8)).toBe('positive');
      expect(analyzer.getSentimentLabel(0.1)).toBe('neutral');
      expect(analyzer.getSentimentLabel(-0.6)).toBe('negative');
    });

    test('should handle edge cases', () => {
      expect(analyzer.getSentimentLabel(0.3)).toBe('neutral');
      expect(analyzer.getSentimentLabel(-0.3)).toBe('neutral');
      expect(analyzer.getSentimentLabel(1.0)).toBe('positive');
      expect(analyzer.getSentimentLabel(-1.0)).toBe('negative');
    });
  });

  describe('getConfidenceLevel', () => {
    test('should return correct confidence levels', () => {
      expect(analyzer.getConfidenceLevel(0.95)).toBe('high');
      expect(analyzer.getConfidenceLevel(0.75)).toBe('medium');
      expect(analyzer.getConfidenceLevel(0.45)).toBe('low');
    });

    test('should handle edge cases', () => {
      expect(analyzer.getConfidenceLevel(1.0)).toBe('high');
      expect(analyzer.getConfidenceLevel(0.0)).toBe('low');
      expect(analyzer.getConfidenceLevel(0.7)).toBe('medium');
    });
  });
});
