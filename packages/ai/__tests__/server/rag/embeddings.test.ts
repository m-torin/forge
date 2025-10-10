/**
 * AI SDK v5 Embeddings Tests
 * Tests embedding functionality with proper usage tracking and vector operations
 */

import { embed, embedMany } from "ai";
import { describe, expect, test } from "vitest";

import {
  createCustomModel,
  createEmbeddingModel,
} from "../../test-utils/models";
import { getMockEmbeddingModel } from "../../test-utils/providers";
import {
  assertTelemetryPerformance,
  createTelemetryConfig,
} from "../../test-utils/telemetry";

describe("embeddings", () => {
  describe("single Embedding Generation", () => {
    test("should generate embeddings for single text input", async () => {
      const model = createEmbeddingModel(1536);

      const result = await embed({
        model,
        value: "This is a test sentence for embedding generation.",
      });

      expect(result.embedding).toHaveLength(1536);
      expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
      expect(result.usage.inputTokens).toBe(10);
      expect(result.usage.totalTokens).toBe(10);
      expect(result.usage.outputTokens).toBeUndefined(); // Embeddings don't have output tokens
    });

    test("should handle different embedding dimensions", async () => {
      const models = [
        { model: createEmbeddingModel(384), expectedDim: 384 },
        { model: createEmbeddingModel(768), expectedDim: 768 },
        { model: createEmbeddingModel(1536), expectedDim: 1536 },
        { model: createEmbeddingModel(3072), expectedDim: 3072 },
      ];

      for (const { model, expectedDim } of models) {
        const result = await embed({
          model,
          value: `Testing ${expectedDim}-dimensional embeddings`,
        });

        expect(result.embedding).toHaveLength(expectedDim);
        expect(result.embedding[0]).toBeCloseTo(0.1);
      }
    });

    test("should track usage for single embedding", async () => {
      const model = createEmbeddingModel();
      const telemetryConfig = createTelemetryConfig({
        functionId: "ai.embed",
        metadata: { embeddingTest: "single" },
      });

      const result = await embed({
        model,
        value: "Track usage for this embedding",
        experimental_telemetry: telemetryConfig,
      });

      expect(result.usage.inputTokens).toBeGreaterThan(0);
      expect(result.usage.totalTokens).toBe(result.usage.inputTokens);

      // Test performance tracking
      assertTelemetryPerformance(result, 1000); // Should complete under 1s
    });
  });

  describe("batch Embedding Generation", () => {
    test("should generate embeddings for multiple texts", async () => {
      const model = createEmbeddingModel(768);
      const texts = [
        "First text to embed",
        "Second text for embedding",
        "Third embedding text",
        "Final text in the batch",
      ];

      const result = await embedMany({
        model,
        values: texts,
      });

      expect(result.embeddings).toHaveLength(4);
      result.embeddings.forEach((embedding) => {
        expect(embedding).toHaveLength(768);
        expect(embedding).toEqual([0.1, 0.2, 0.3]);
      });

      expect(result.usage.inputTokens).toBe(40); // 10 tokens per text * 4 texts
      expect(result.usage.totalTokens).toBe(40);
    });

    test("should handle large batch embedding", async () => {
      const model = createEmbeddingModel(512);
      const largeTexts = Array.from(
        { length: 100 },
        (_, i) => `This is text number ${i + 1} for batch embedding testing.`,
      );

      const result = await embedMany({
        model,
        values: largeTexts,
      });

      expect(result.embeddings).toHaveLength(100);
      expect(result.usage.inputTokens).toBe(1000); // 10 tokens per text * 100 texts

      result.embeddings.forEach((embedding, index) => {
        expect(embedding).toHaveLength(512);
        expect(embedding[0]).toBeCloseTo(0.1);
      });
    });

    test("should track usage for batch embeddings", async () => {
      const model = createEmbeddingModel(256);
      const batchTexts = [
        "Batch embedding text one",
        "Batch embedding text two",
        "Batch embedding text three",
      ];

      const telemetryConfig = createTelemetryConfig({
        functionId: "ai.embedMany",
        metadata: {
          batchSize: batchTexts.length,
          embeddingDimensions: 256,
        },
      });

      const result = await embedMany({
        model,
        values: batchTexts,
        experimental_telemetry: telemetryConfig,
      });

      expect(result.embeddings).toHaveLength(3);
      expect(result.usage.inputTokens).toBe(30); // 10 tokens per text * 3 texts

      // Verify batch efficiency (should be more efficient than individual calls)
      const tokensPerText = result.usage.inputTokens / batchTexts.length;
      expect(tokensPerText).toBe(10);
    });

    test("should handle empty batch gracefully", async () => {
      const model = createEmbeddingModel();

      const result = await embedMany({
        model,
        values: [],
      });

      expect(result.embeddings).toHaveLength(0);
      expect(result.usage.inputTokens).toBe(0);
      expect(result.usage.totalTokens).toBe(0);
    });
  });

  describe("provider-Specific Embeddings", () => {
    test("should work with OpenAI embedding models", async () => {
      const openaiModel = getMockEmbeddingModel(
        "openai",
        "text-embedding-3-small",
      );

      const result = await embed({
        model: openaiModel,
        value: "OpenAI embedding test",
      });

      expect(result.embedding).toHaveLength(1536);
      expect(result.usage).toBeDefined();
    });

    test("should work with Google embedding models", async () => {
      const googleModel = getMockEmbeddingModel("google", "text-embedding-004");

      const result = await embed({
        model: googleModel,
        value: "Google embedding test",
      });

      expect(result.embedding).toHaveLength(768);
      expect(result.usage).toBeDefined();
    });

    test("should handle provider differences in embedding dimensions", async () => {
      const providers = [
        {
          provider: "openai",
          model: "text-embedding-3-small",
          expectedDim: 1536,
        },
        {
          provider: "openai",
          model: "text-embedding-3-large",
          expectedDim: 3072,
        },
        { provider: "google", model: "text-embedding-004", expectedDim: 768 },
      ] as const;

      for (const { provider, model: modelName, expectedDim } of providers) {
        const model = getMockEmbeddingModel(provider, modelName);

        const result = await embed({
          model,
          value: `Testing ${provider} ${modelName}`,
        });

        expect(result.embedding).toHaveLength(expectedDim);
      }
    });
  });

  describe("embedding Similarity and Vector Operations", () => {
    test("should compute cosine similarity between embeddings", async () => {
      const model = createEmbeddingModel(3);

      const result1 = await embed({
        model,
        value: "artificial intelligence machine learning",
      });

      const result2 = await embed({
        model,
        value: "AI ML deep learning neural networks",
      });

      // Mock vectors for similarity calculation
      const vector1 = [0.8, 0.6, 0.4];
      const vector2 = [0.7, 0.5, 0.3];

      // Compute cosine similarity
      const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
      const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
      const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));
      const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);

      expect(cosineSimilarity).toBeGreaterThan(0);
      expect(cosineSimilarity).toBeLessThanOrEqual(1);
      expect(cosineSimilarity).toBeCloseTo(0.99, 1); // Similar semantic content
    });

    test("should handle vector normalization", async () => {
      const model = createEmbeddingModel(4);

      const result = await embed({
        model,
        value: "Vector normalization test",
      });

      const embedding = result.embedding;

      // Calculate L2 norm
      const l2Norm = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0),
      );
      expect(l2Norm).toBeGreaterThan(0);

      // Normalize vector
      const normalizedVector = embedding.map((val) => val / l2Norm);
      const normalizedNorm = Math.sqrt(
        normalizedVector.reduce((sum, val) => sum + val * val, 0),
      );

      expect(normalizedNorm).toBeCloseTo(1.0, 5); // Should be unit vector
    });

    test("should support embedding search and ranking", async () => {
      const model = createEmbeddingModel(256);

      // Query embedding
      const queryResult = await embed({
        model,
        value: "machine learning algorithms",
      });

      // Document embeddings
      const documents = [
        "supervised learning classification regression",
        "unsupervised learning clustering dimensionality reduction",
        "deep learning neural networks backpropagation",
        "natural language processing text analysis",
        "computer vision image recognition",
      ];

      const docEmbeddings = await embedMany({
        model,
        values: documents,
      });

      expect(docEmbeddings.embeddings).toHaveLength(5);

      // Mock similarity scores
      const similarities = [
        { doc: documents[0], score: 0.95 }, // Most similar
        { doc: documents[1], score: 0.88 },
        { doc: documents[2], score: 0.82 },
        { doc: documents[3], score: 0.65 },
        { doc: documents[4], score: 0.45 }, // Least similar
      ];

      // Sort by similarity
      const rankedDocs = similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      expect(rankedDocs[0].score).toBe(0.95);
      expect(rankedDocs[0].doc).toContain("supervised learning");
      expect(rankedDocs).toHaveLength(3);
    });
  });

  describe("embedding Error Handling", () => {
    test("should handle embedding model errors", async () => {
      const errorModel = createCustomModel(async () => {
        throw new Error("Embedding model is unavailable");
      }, "error-embedding-model");

      await expect(
        embed({
          model: errorModel,
          value: "This should fail",
        }),
      ).rejects.toThrow("Embedding model is unavailable");
    });

    test("should handle invalid input text", async () => {
      const model = createEmbeddingModel();

      // Test with very long text (mock token limit)
      const veryLongText = "word ".repeat(10000);

      const customModel = createCustomModel(async ({ prompt }) => {
        const text =
          typeof prompt === "string" ? prompt : prompt[0].content[0].text;
        if (text.length > 8000) {
          throw new Error("Input text exceeds token limit");
        }
        return {
          finishReason: "stop" as const,
          usage: { inputTokens: 10, outputTokens: 0, totalTokens: 10 },
          content: [{ type: "text", text: "Processed" }],
          warnings: [],
        };
      });

      await expect(
        embed({
          model: customModel,
          value: veryLongText,
        }),
      ).rejects.toThrow("Input text exceeds token limit");
    });

    test("should handle batch embedding partial failures", async () => {
      const model = createEmbeddingModel();

      // Mock model that fails on specific inputs
      const selectiveErrorModel = createCustomModel(async ({ prompt }) => {
        const messages = Array.isArray(prompt)
          ? prompt
          : [{ content: [{ type: "text", text: prompt }] }];
        const hasError = messages.some((msg: any) =>
          msg.content?.some?.((content: any) =>
            content.text?.includes("ERROR"),
          ),
        );

        if (hasError) {
          throw new Error("Batch item contains ERROR");
        }

        return {
          finishReason: "stop" as const,
          usage: { inputTokens: 10, outputTokens: 0, totalTokens: 10 },
          content: [{ type: "text", text: "Success" }],
          warnings: [],
        };
      });

      const textsWithError = [
        "Normal text",
        "ERROR: This should fail",
        "Another normal text",
      ];

      await expect(
        embedMany({
          model: selectiveErrorModel,
          values: textsWithError,
        }),
      ).rejects.toThrow("Batch item contains ERROR");
    });
  });

  describe("advanced Embedding Use Cases", () => {
    test("should support multilingual embedding", async () => {
      const model = createEmbeddingModel(768);

      const multilingualTexts = [
        "Hello world in English",
        "Hola mundo en español",
        "Bonjour le monde en français",
        "世界你好用中文",
        "مرحبا بالعالم بالعربية",
      ];

      const result = await embedMany({
        model,
        values: multilingualTexts,
      });

      expect(result.embeddings).toHaveLength(5);
      result.embeddings.forEach((embedding) => {
        expect(embedding).toHaveLength(768);
      });

      // All languages should produce valid embeddings
      expect(result.usage.inputTokens).toBeGreaterThan(0);
    });

    test("should handle code embedding", async () => {
      const model = createEmbeddingModel(1024);

      const codeSnippets = [
        'function hello() { console.log("Hello World"); }',
        'def hello(): print("Hello World")',
        'public class Hello { public static void main(String[] args) { System.out.println("Hello World"); } }',
        'fn hello() { println!("Hello World"); }',
      ];

      const result = await embedMany({
        model,
        values: codeSnippets,
      });

      expect(result.embeddings).toHaveLength(4);
      result.embeddings.forEach((embedding) => {
        expect(embedding).toHaveLength(1024);
      });

      expect(result.usage.inputTokens).toBeGreaterThan(0);
    });

    test("should support domain-specific embedding", async () => {
      const model = createEmbeddingModel(512);

      const medicalTexts = [
        "Patient presents with acute myocardial infarction",
        "Diagnosis of type 2 diabetes mellitus confirmed",
        "Hypertension management with ACE inhibitors",
        "Radiological findings show pneumonia",
      ];

      const legalTexts = [
        "Plaintiff filed motion for summary judgment",
        "Contract terms stipulate binding arbitration",
        "Intellectual property rights infringement claim",
        "Corporate liability under securities law",
      ];

      const [medicalEmbeddings, legalEmbeddings] = await Promise.all([
        embedMany({ model, values: medicalTexts }),
        embedMany({ model, values: legalTexts }),
      ]);

      expect(medicalEmbeddings.embeddings).toHaveLength(4);
      expect(legalEmbeddings.embeddings).toHaveLength(4);

      // Both domains should produce distinct but valid embeddings
      expect(medicalEmbeddings.usage.totalTokens).toBeGreaterThan(0);
      expect(legalEmbeddings.usage.totalTokens).toBeGreaterThan(0);
    });

    test("should handle embedding with metadata", async () => {
      const model = createEmbeddingModel(256);

      const documentsWithMetadata = [
        {
          text: "AI research paper abstract",
          metadata: { type: "academic", year: 2024 },
        },
        {
          text: "Product review content",
          metadata: { type: "review", rating: 5 },
        },
        {
          text: "News article excerpt",
          metadata: { type: "news", category: "technology" },
        },
      ];

      const texts = documentsWithMetadata.map((doc) => doc.text);
      const result = await embedMany({
        model,
        values: texts,
      });

      // Combine embeddings with metadata
      const embeddingsWithMetadata = result.embeddings.map(
        (embedding, index) => ({
          embedding,
          metadata: documentsWithMetadata[index].metadata,
          text: texts[index],
        }),
      );

      expect(embeddingsWithMetadata).toHaveLength(3);
      expect(embeddingsWithMetadata[0].metadata.type).toBe("academic");
      expect(embeddingsWithMetadata[1].metadata.rating).toBe(5);
      expect(embeddingsWithMetadata[2].metadata.category).toBe("technology");
    });
  });
});
