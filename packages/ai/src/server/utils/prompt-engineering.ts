/**
 * Geo-location context for prompts
 */
export interface GeoContext {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
}

/**
 * User context for prompts
 */
export interface UserContext {
  id?: string;
  type?: string;
  preferences?: Record<string, any>;
  history?: any[];
}

/**
 * Prompt context that can be composed into system prompts
 */
export interface PromptContext {
  geo?: GeoContext;
  user?: UserContext;
  session?: any;
  metadata?: Record<string, any>;
}

/**
 * Base prompt templates
 */
export const PROMPT_TEMPLATES = {
  /**
   * Regular conversational prompt
   */
  regular: 'You are a friendly assistant! Keep your responses concise and helpful.',

  /**
   * Artifacts prompt for document creation
   */
  artifacts: `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write code, always use artifacts. When writing code, specify the language in the backticks, e.g. \`\`\`python\`code here\`\`\`. The default language is Python. Other languages are not yet supported, so let the user know if they request a different language.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\` and \`updateDocument\`, which render content on a artifacts beside the conversation.

**When to use \`createDocument\`:**
- For substantial content (>10 lines) or code
- For content users will likely save/reuse (emails, code, essays, etc.)
- When explicitly requested to create a document
- For when content contains a single code snippet

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

Do not update document right after creating it. Wait for user feedback or request to update it.`,

  /**
   * Code generation prompt
   */
  code: `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")`,

  /**
   * Spreadsheet creation prompt
   */
  sheet:
    'You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.',

  /**
   * Web search and real-time information prompt (optimized for Perplexity models)
   */
  websearch: `You are a research assistant with access to real-time web information. Your primary strength is finding current, accurate information and providing comprehensive answers with proper citations.

When responding to questions:

1. **Search Strategy**: Always search for the most current information available. Use your real-time web access to find up-to-date facts, data, and sources.

2. **Citation Requirements**: ALWAYS include citations in your responses. Use numbered citations [1], [2], [3] etc. and provide the source URLs at the end of your response.

3. **Information Quality**: Prioritize authoritative sources like:
   - Official websites and documentation
   - News organizations and publications
   - Academic and research institutions
   - Government sources
   - Industry-specific authorities

4. **Response Structure**: 
   - Start with a direct answer to the question
   - Provide detailed information with supporting evidence
   - Include relevant context and background
   - End with a properly formatted citations list

5. **Accuracy Focus**: Always verify information across multiple sources when possible. If information conflicts between sources, mention this and explain the differences.

6. **Comprehensive Coverage**: Provide thorough answers that cover different aspects of the topic. Don't just give minimal responses - elaborate with useful details, examples, and context.

7. **Current Events**: For questions about recent events, movies, products, or developments, always search for the most recent information available.

Remember: Your goal is to provide the most accurate, comprehensive, and well-cited information possible, just like a professional research assistant would.`,
} as const;

/**
 * Generates a geo-location context prompt
 */
export function createGeoPrompt(geo: GeoContext): string {
  const parts: string[] = [];

  if (geo.latitude !== undefined && geo.longitude !== undefined) {
    parts.push(`- lat: ${geo.latitude}`);
    parts.push(`- lon: ${geo.longitude}`);
  }

  if (geo.city) {
    parts.push(`- city: ${geo.city}`);
  }

  if (geo.country) {
    parts.push(`- country: ${geo.country}`);
  }

  if (geo.region) {
    parts.push(`- region: ${geo.region}`);
  }

  if (geo.timezone) {
    parts.push(`- timezone: ${geo.timezone}`);
  }

  return parts.length > 0 ? `About the origin of user's request:\n${parts.join('\n')}` : '';
}

/**
 * Generates a user context prompt
 */
export function createUserPrompt(user: UserContext): string {
  const parts: string[] = [];

  if (user.type) {
    parts.push(`- user type: ${user.type}`);
  }

  if (user.preferences) {
    const prefStrings = Object.entries(user.preferences)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (prefStrings) {
      parts.push(`- preferences: ${prefStrings}`);
    }
  }

  return parts.length > 0 ? `About the user:\n${parts.join('\n')}` : '';
}

/**
 * Composes a system prompt from templates and context
 */
export function composeSystemPrompt(config: {
  base?: keyof typeof PROMPT_TEMPLATES | string;
  includeArtifacts?: boolean;
  context?: PromptContext;
  additionalInstructions?: string[];
}): string {
  const {
    base = 'regular',
    includeArtifacts = false,
    context,
    additionalInstructions = [],
  } = config;

  const parts: string[] = [];

  // Add base prompt
  if (typeof base === 'string' && base in PROMPT_TEMPLATES) {
    parts.push(PROMPT_TEMPLATES[base as keyof typeof PROMPT_TEMPLATES]);
  } else if (typeof base === 'string') {
    parts.push(base);
  }

  // Add context prompts
  if (context?.geo) {
    const geoPrompt = createGeoPrompt(context.geo);
    if (geoPrompt) {
      parts.push(geoPrompt);
    }
  }

  if (context?.user) {
    const userPrompt = createUserPrompt(context.user);
    if (userPrompt) {
      parts.push(userPrompt);
    }
  }

  // Add artifacts instructions if requested
  if (includeArtifacts) {
    parts.push(PROMPT_TEMPLATES.artifacts);
  }

  // Add additional instructions
  if (additionalInstructions.length > 0) {
    parts.push(...additionalInstructions);
  }

  return parts.filter(part => part.trim()).join('\n\n');
}

/**
 * Creates a system prompt for different model types
 */
export function createModelSpecificPrompt(
  modelType: 'chat' | 'reasoning' | 'title' | 'artifact' | 'code' | 'sheet' | 'websearch',
  context?: PromptContext,
): string {
  switch (modelType) {
    case 'reasoning':
      return composeSystemPrompt({
        base: 'regular',
        context,
        additionalInstructions: [
          'Use step-by-step reasoning to solve complex problems.',
          'Show your thinking process clearly.',
        ],
      });

    case 'title':
      return composeSystemPrompt({
        base: "You will generate a short title based on the first message a user begins a conversation with. Ensure it is not more than 80 characters long. The title should be a summary of the user's message. Do not use quotes or colons.",
        context,
      });

    case 'artifact':
      return composeSystemPrompt({
        base: 'regular',
        includeArtifacts: true,
        context,
      });

    case 'code':
      return composeSystemPrompt({
        base: 'code',
        context,
      });

    case 'sheet':
      return composeSystemPrompt({
        base: 'sheet',
        context,
      });

    case 'websearch':
      return composeSystemPrompt({
        base: 'websearch',
        context,
      });

    default:
      return composeSystemPrompt({
        base: 'regular',
        context,
      });
  }
}

/**
 * Document update prompt generator
 */
export function createUpdateDocumentPrompt(
  currentContent: string | null,
  documentType: 'text' | 'code' | 'sheet',
): string {
  const basePrompt =
    documentType === 'text'
      ? 'Improve the following contents of the document based on the given prompt.'
      : documentType === 'code'
        ? 'Improve the following code snippet based on the given prompt.'
        : 'Improve the following spreadsheet based on the given prompt.';

  return currentContent ? `${basePrompt}\n\n${currentContent}` : basePrompt;
}

/**
 * Utility for prompt template management
 */
export class PromptTemplateManager {
  private templates = new Map<string, string>();

  constructor(initialTemplates: Record<string, string> = {}) {
    // Load default templates
    Object.entries(PROMPT_TEMPLATES).forEach(([key, value]) => {
      this.templates.set(key, value);
    });

    // Load custom templates
    Object.entries(initialTemplates).forEach(([key, value]) => {
      this.templates.set(key, value);
    });
  }

  /**
   * Register a new template
   */
  register(name: string, template: string): void {
    this.templates.set(name, template);
  }

  /**
   * Get a template by name
   */
  get(name: string): string | undefined {
    return this.templates.get(name);
  }

  /**
   * Get all template names
   */
  getTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Compose a prompt using registered templates
   */
  compose(templateName: string, context?: PromptContext): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return composeSystemPrompt({
      base: template,
      context,
    });
  }
}

/**
 * Create a global prompt template manager
 */
export function createPromptTemplateManager(
  customTemplates?: Record<string, string>,
): PromptTemplateManager {
  return new PromptTemplateManager(customTemplates);
}
