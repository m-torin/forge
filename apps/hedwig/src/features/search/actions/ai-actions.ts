import { createAnthropicClient } from '@repo/ai';

export interface AISearchResult {
  data?: {
    productName?: string;
    brand?: string;
    category?: string;
    description?: string;
    potentialMatches?: {
      name: string;
      brand: string;
      confidence: number;
      reasoning: string;
    }[];
    searchSuggestions?: string[];
    analysis?: string;
  };
  error?: string;
  success: boolean;
}

export async function searchProductsWithAIAction(query: string, context?: string): Promise<AISearchResult> {

  if (!query) {
    return {
      error: 'Search query is required',
      success: false,
    };
  }

  try {
    const client = createAnthropicClient();

    if (!client) {
      throw new Error('AI client not available');
    }

    const systemPrompt = `You are a product identification assistant for a barcode scanning and product management system. Your role is to help identify products based on user descriptions, partial information, or unclear barcode scans.

When a user provides a product description or search query, analyze it and provide:

1. Most likely product identification
2. Potential brand matches
3. Product category classification
4. Search suggestions for finding the product
5. Analysis of the query

Respond in JSON format with the following structure:
{
  "productName": "Most likely product name",
  "brand": "Most likely brand",
  "category": "Product category",
  "description": "Enhanced product description",
  "potentialMatches": [
    {
      "name": "Product name",
      "brand": "Brand name",
      "confidence": 0.85,
      "reasoning": "Why this is a good match"
    }
  ],
  "searchSuggestions": ["alternative search terms"],
  "analysis": "Analysis of the query and recommendations"
}

Focus on being helpful for product identification and inventory management.`;

    const structuredPrompt = `User Query: "${query}"
${context ? `Additional Context: ${context}` : ''}

Please analyze this product search query and provide product identification assistance.`;

    const response = await client.call([
      {
        content: structuredPrompt,
        role: 'user',
      },
    ], systemPrompt);

    // Parse the AI response
    let aiData;
    try {
      // Check if response has text property or is a different structure
      const responseText = response.body || response.text || JSON.stringify(response);
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        aiData = {
          analysis: responseText,
          searchSuggestions: [query],
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError);
      const responseText = response.body || response.text || 'No response text available';
      aiData = {
        analysis: responseText,
        searchSuggestions: [query],
      };
    }

    return {
      data: aiData,
      success: true,
    };
  } catch (error) {
    console.error('AI product search error:', error);
    return {
      error: 'Failed to process AI search request',
      success: false,
    };
  }
}