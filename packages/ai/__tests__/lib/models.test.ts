import { beforeEach, describe, expect, it, vi } from "vitest";

import { models } from "../../lib/models.ts";

// Mock the keys module
vi.mock("../../keys.ts", () => ({
  keys: () => ({
    OPENAI_API_KEY: "sk-test-key",
  }),
}));

// The OpenAI implementation is mocked in setup.ts

describe("AI Models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports chat model", () => {
    expect(models.chat).toBeDefined();
    expect(models.chat).toHaveProperty("model", "gpt-4o-mini");
  });

  it("exports embeddings model", () => {
    expect(models.embeddings).toBeDefined();
    expect(models.embeddings).toHaveProperty("model", "text-embedding-3-small");
  });

  it("has the correct model structure", () => {
    expect(Object.keys(models)).toHaveLength(2);
    expect(Object.keys(models)).toContain("chat");
    expect(Object.keys(models)).toContain("embeddings");
  });
});
