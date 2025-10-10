/**
 * Centralized mock executors - Maximum DRY
 * Eliminates repetition in tool execute functions
 */

/**
 * Create a search-style mock response
 */
export const searchMock =
  (queryField = 'query') =>
  async (input: any) => ({
    results: [
      {
        title: `Search result for: ${input[queryField]}`,
        url: `https://example.com/search?q=${encodeURIComponent(input[queryField])}`,
        snippet: `This is a mock search result for the query: ${input[queryField]}`,
      },
    ],
    [queryField]: input[queryField],
    count: 1,
    provider: 'mock',
  });

/**
 * Create an empty results mock response
 */
export const emptyResultsMock = (fields: string[]) => async (input: any) => ({
  ...Object.fromEntries(fields.map(f => [f, input[f]])),
  results: [],
  count: 0,
});

/**
 * Create a timestamped mock response
 */
export const timestampedMock = (idPrefix: string, fields: string[]) => async (input: any) => ({
  ...Object.fromEntries(fields.map(f => [f, input[f]])),
  [`${idPrefix}Id`]: `${idPrefix}_${Date.now()}`,
  status: 'sent',
});

/**
 * Create a simple echo mock response
 */
export const echoMock = (fields: string[]) => async (input: any) => ({
  ...Object.fromEntries(fields.map(f => [f, input[f]])),
  result: 'success',
});

/**
 * Create a generated content mock response
 */
export const generatedMock =
  (promptField = 'prompt') =>
  async (input: any) => ({
    text: `Generated text for: ${input[promptField]}`,
    usage: { totalTokens: 100 },
    ...Object.fromEntries(Object.entries(input).filter(([k]) => k !== promptField)),
  });

/**
 * Create a classification mock response
 */
export const classificationMock = () => async (input: any) => ({
  category: input.categories?.[0] || 'unknown',
  confidence: 0.9,
  allScores: input.categories?.map((cat: string) => ({ category: cat, score: 0.5 })) || [],
  contentLength: input.content?.length || 0,
});

/**
 * Create an extraction mock response
 */
export const extractionMock = () => async (input: any) => ({
  extractedData: {},
  confidence: 0.95,
  schema: input.schema,
  temperature: input.temperature,
  sourceLength: input.text?.length || 0,
});
