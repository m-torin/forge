// Helper to get current story context
interface StoryContext {
  parameters?: {
    mockData?: {
      apiKeys?: any[];
      loading?: boolean;
      [key: string]: any;
    };
  };
}

// Global variable to store the current story context
let currentStoryContext: StoryContext | null = null;

export function setStoryContext(context: StoryContext) {
  currentStoryContext = context;
}

export function getStoryContext(): StoryContext | null {
  return currentStoryContext;
}

export function getMockApiKeys() {
  return currentStoryContext?.parameters?.mockData?.apiKeys || [];
}

export function getMockLoadingState() {
  return currentStoryContext?.parameters?.mockData?.loading || false;
}
