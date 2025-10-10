/**
 * AI SDK v5 Structured Data Generation Examples
 * Comprehensive examples for all output strategies and features
 */

import { z } from 'zod/v3';
import {
  generateArray,
  generateCommon,
  generateEnum,
  generateNoSchema,
  // Basic structured data functions
  generateObject,
  // Experimental structured output
  generateTextWithStructuredOutput,
  outputStrategyFragments,
  streamArray,
  streamObjectWithPartials,
  streamTextWithStructuredOutput,
  // Configuration fragments
  structuredFragments,
} from '../index';
import { TEMPS, TOKENS } from '../providers/shared';

// Example schemas for demonstrations
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  inStock: z.boolean(),
  tags: z.array(z.string()),
  specifications: z.object({
    weight: z.number().optional(),
    dimensions: z.string().optional(),
    color: z.string().optional(),
  }),
});

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
});

const RecipeSchema = z.object({
  name: z.string(),
  cookingTime: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string(),
    }),
  ),
  instructions: z.array(z.string()),
  nutritionalInfo: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
});

/**
 * BASIC OBJECT GENERATION EXAMPLES
 */

// 1. Simple object generation
export async function generateProductExample() {
  const result = await generateObject('Generate a product for a laptop computer', ProductSchema, {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'object' as const,
  });

  console.log('Generated Product:', result.object);
  return result.object;
}

// 2. Object generation with schema metadata
export async function generateProductWithMetadata() {
  const result = await generateObject('Create a gaming laptop product listing', {
    schema: ProductSchema,
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'object' as const,
    schemaName: 'GamingLaptop',
    schemaDescription: 'High-performance gaming laptop product data',
  });

  return result.object;
}

// 3. Object generation with error repair
export async function generateProductWithRepair() {
  const result = await generateObject(
    'Generate a laptop product that might have formatting issues',
    ProductSchema,
    {
      temperature: TEMPS.PRECISE,
      maxOutputTokens: TOKENS.MEDIUM,
      output: 'object' as const,
      // Custom repair function
      experimental_repairText: async ({ text, error }: { text: string; error: any }) => {
        console.log('Attempting to repair malformed JSON:', error.message);

        // Handle specific error types
        if (error.message.includes('Unexpected end of JSON input')) {
          return text + '}';
        }

        // Try to fix unclosed arrays
        if (text.includes('[') && !text.includes(']')) {
          return text + ']';
        }

        return text;
      },
    },
  );

  return result.object;
}

/**
 * ARRAY GENERATION EXAMPLES
 */

// 4. Generate array of objects
export async function generateProductListExample() {
  const result = await generateArray(
    'Generate 3 different laptop products with varying specifications',
    ProductSchema,
    structuredFragments.arrayGeneration,
  );

  console.log('Generated Products:', result.object);
  return result.object;
}

// 5. Generate large dataset
export async function generateLargeDataset() {
  const result = await generateArray(
    'Generate 10 sample users with realistic data for testing',
    PersonSchema,
    {
      ...structuredFragments.largeDataExtraction,
      maxOutputTokens: TOKENS.MAX,
    },
  );

  console.log(`Generated ${result.object?.length || 0} users`);
  return result.object;
}

/**
 * ENUM CLASSIFICATION EXAMPLES
 */

// 6. Content classification
export async function classifyContentExample() {
  const contentTypes = ['blog', 'tutorial', 'news', 'review', 'opinion'] as const;

  const result = await generateEnum(
    'This is a step-by-step guide on how to build a React application with TypeScript',
    contentTypes,
    outputStrategyFragments.contentClassification,
  );

  console.log('Classification result:', result.object);
  return result.object;
}

// 7. Sentiment analysis enum
export async function analyzeSentimentEnum() {
  const sentiments = ['positive', 'negative', 'neutral'] as const;

  const result = await generateEnum(
    'I absolutely love this new laptop! The performance is amazing and the build quality is excellent.',
    sentiments,
    structuredFragments.enumClassification,
  );

  console.log('Sentiment:', result.object);
  return result.object;
}

/**
 * NO-SCHEMA GENERATION EXAMPLES
 */

// 8. Flexible unstructured output
export async function generateFlexibleData() {
  const result = await generateNoSchema(
    "Extract any relevant information from this text: 'John Smith works at TechCorp, earns $75000, lives in San Francisco, and has 2 children'",
    structuredFragments.noSchemaGeneration,
  );

  console.log('Extracted data:', result.object);
  return result.object;
}

/**
 * STREAMING EXAMPLES
 */

// 9. Stream object with partial updates
export async function streamProductGeneration() {
  const { result, partialObjectStream } = await streamObjectWithPartials(
    'Generate a complex recipe with detailed instructions and nutritional information',
    RecipeSchema,
    {
      ...structuredFragments.streamingObject,
      onPartialUpdate: partial => {
        console.log('Partial update received:', Object.keys(partial));
      },
    },
  );

  return result.object;
}

// 10. Stream array with element streaming
export async function streamArrayExample() {
  const result = await streamArray(
    'Generate 5 sample products for an e-commerce website',
    ProductSchema,
    {
      ...structuredFragments.largeDataExtraction,
      onError: ({ error }) => {
        console.error('Streaming error:', error.message);
      },
    },
  );

  // Access elementStream for real-time processing
  if (result.elementStream) {
    const reader = result.elementStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        console.log('New product generated:', value);
        // Process each product as it's generated
      }
    } finally {
      reader.releaseLock();
    }
  }

  return result.object;
}

/**
 * EXPERIMENTAL STRUCTURED OUTPUT WITH TEXT GENERATION
 */

// 11. Combine text and structured output
export async function generateTextWithStructuredData() {
  const result = await generateTextWithStructuredOutput(
    'Write a product review for this laptop and extract key product data',
    ProductSchema,
    {
      ...outputStrategyFragments.productData,
      temperature: TEMPS.BALANCED, // Allow creativity for text while keeping structure precise
    },
  );

  console.log('Generated review:', result.text);
  console.log('Extracted product data:', result.experimental_output);

  return {
    review: result.text,
    productData: result.experimental_output,
  };
}

// 12. Stream text with structured data extraction
export async function streamTextWithStructuredData() {
  const result = await streamTextWithStructuredOutput(
    'Generate a detailed product description while extracting key specifications',
    ProductSchema,
    {
      temperature: TEMPS.HIGH_CREATIVE,
      maxOutputTokens: TOKENS.MEDIUM,
    },
  );

  // Access streaming structured data
  if (result.experimental_partialOutputStream) {
    const reader = result.experimental_partialOutputStream.getReader();

    // Process partial structured data as it streams
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          console.log('Partial structured data:', value);
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }

  return result;
}

/**
 * COMMON SCHEMAS AND HELPERS EXAMPLES
 */

// 13. Use common schemas
export async function useCommonSchemasExample() {
  // Classification
  const classification = await generateCommon.classify(
    'This article discusses the latest trends in machine learning and AI development',
    ['technology', 'business', 'science', 'entertainment'],
  );

  // Sentiment analysis
  const sentiment = await generateCommon.analyzeSentiment(
    'The new product launch exceeded all our expectations!',
  );

  // Data extraction
  const extraction = await generateCommon.extract(
    'Extract key information: John Doe, age 30, Software Engineer at TechCorp',
  );

  // Task breakdown
  const tasks = await generateCommon.breakdownTasks(
    'Build a complete e-commerce website with user authentication, product catalog, shopping cart, and payment processing',
  );

  return {
    classification,
    sentiment,
    extraction,
    tasks,
  };
}

/**
 * ERROR HANDLING EXAMPLES
 */

// 14. Handle StructuredDataError
export async function handleStructuredDataErrors() {
  try {
    const result = await generateObject(
      "Generate invalid data that doesn't match the schema",
      ProductSchema,
      {
        temperature: TEMPS.PRECISE,
        maxOutputTokens: 100, // Very low token limit to potentially cause issues
      },
    );

    return result.object;
  } catch (error) {
    if (error instanceof Error && error.name === 'AI_NoObjectGeneratedError') {
      const structuredError = error as any; // StructuredDataError type

      console.log('Structured data generation failed:');
      console.log('- Message:', structuredError.message);
      console.log('- Generated text:', structuredError.text);
      console.log('- Usage:', structuredError.usage);
      console.log('- Response:', structuredError.response);

      // Attempt manual parsing or provide fallback
      return null;
    }

    throw error;
  }
}

/**
 * REAL-WORLD USE CASES
 */

// 15. E-commerce product data extraction
export async function extractEcommerceData() {
  const productDescription = `
    MacBook Pro 16-inch with M2 Max chip
    Features a stunning 16.2-inch Liquid Retina XDR display
    Up to 96GB unified memory and 8TB SSD storage
    Advanced camera and audio for video calls
    All-day battery life up to 22 hours
    Price: $3,499
    Currently in stock
    Weight: 4.7 pounds
    Color: Space Gray
  `;

  const result = await generateObject(
    `Extract structured product data from this description: ${productDescription}`,
    ProductSchema,
    outputStrategyFragments.productData,
  );

  return result.object;
}

// 16. Form data extraction from unstructured text
export async function extractFormData() {
  const ContactFormSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string(),
    message: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
  });

  const unstructuredText = `
    Hi, this is Sarah Johnson and I need help with my account. 
    You can reach me at sarah.j@email.com or 555-123-4567. 
    I'm having trouble accessing my dashboard and it's quite urgent since I have a presentation tomorrow.
    The issue started yesterday and I haven't been able to log in since.
  `;

  const result = await generateObject(
    `Extract contact form data from this message: ${unstructuredText}`,
    ContactFormSchema,
    outputStrategyFragments.formExtraction,
  );

  return result.object;
}

// 17. Bulk data processing
export async function processBulkData() {
  const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    segment: z.enum(['enterprise', 'business', 'individual']),
    status: z.enum(['active', 'inactive', 'trial']),
    joinDate: z.string(),
  });

  const rawData = `
    Process this customer data:
    1. John Smith - john@enterprise.com - Large company account - Active since 2023
    2. Jane Doe - jane@small.biz - Small business - Trial user from last month  
    3. Bob Wilson - bob@email.com - Individual user - Been with us for 2 years but inactive
    4. Alice Corp - alice@bigtech.com - Major enterprise client - Active premium account
  `;

  const result = await generateArray(
    `Convert this raw customer data into structured format: ${rawData}`,
    CustomerSchema,
    outputStrategyFragments.bulkProcessing,
  );

  return result.object;
}

/**
 * PERFORMANCE OPTIMIZATION EXAMPLES
 */

// 18. Optimized configuration for different use cases
export const optimizedConfigurations = {
  // Fast classification for real-time use
  realTimeClassification: {
    ...structuredFragments.enumClassification,
    maxOutputTokens: TOKENS.TINY,
    temperature: TEMPS.PRECISE,
  },

  // High-quality data extraction
  highQualityExtraction: {
    ...structuredFragments.objectGeneration,
    maxOutputTokens: TOKENS.LONG,
    temperature: TEMPS.PRECISE,
    schemaName: 'HighQualityData',
    schemaDescription: 'Comprehensive data extraction with high accuracy',
  },

  // Balanced streaming for UI updates
  balancedStreaming: {
    ...structuredFragments.streamingObject,
    maxOutputTokens: TOKENS.MEDIUM,
    temperature: TEMPS.VERY_LOW,
    onError: ({ error }: { error: Error }) => {
      console.error('Stream error:', error.message);
    },
  },
};

/**
 * INTEGRATION EXAMPLES WITH MONOREPO PACKAGES
 */

// 19. Integration with observability and error tracking
export async function generateWithObservability() {
  const result = await generateObject(
    'Generate sample data for monitoring',
    z.object({
      metric: z.string(),
      value: z.number(),
      timestamp: z.string(),
      tags: z.array(z.string()),
    }),
    {
      ...structuredFragments.objectGeneration,
      // Enhanced observability
      onFinish: (result: any) => {
        console.log('Generation completed with tokens:', result.usage?.totalTokens);
      },
      onError: ({ error }: { error: Error }) => {
        console.error('Generation failed:', error.message);
        // Integration with @repo/observability for error tracking
      },
    },
  );

  return result.object;
}

// 20. Example usage patterns for different domains
export const domainExamples = {
  ecommerce: () =>
    generateObject(
      'Generate product data for online store',
      ProductSchema,
      outputStrategyFragments.productData,
    ),

  analytics: () =>
    generateObject(
      'Extract KPIs from performance report',
      z.object({
        revenue: z.number(),
        conversions: z.number(),
        traffic: z.number(),
        roi: z.number(),
      }),
      outputStrategyFragments.analyticsData,
    ),

  contentModeration: (text: string) =>
    generateEnum(
      text,
      ['safe', 'warning', 'blocked'] as const,
      outputStrategyFragments.contentClassification,
    ),

  formProcessing: (formText: string) =>
    generateObject(
      formText,
      z.object({
        name: z.string(),
        email: z.string(),
        message: z.string(),
      }),
      outputStrategyFragments.formExtraction,
    ),
};
