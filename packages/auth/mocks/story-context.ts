// Helper to get current story context
interface StoryContext {
  parameters?: {
    mockData?: {
      [key: string]: any;
      apiKeys?: any[];
      loading?: boolean;
    };
  };
}

// Global variable to store the current story context
let currentStoryContext: null | StoryContext = null;

export function getMockApiKeys() {
  return currentStoryContext?.parameters?.mockData?.apiKeys ?? [];
}

export function getMockLoadingState() {
  return currentStoryContext?.parameters?.mockData?.loading ?? false;
}

export function getStoryContext(): null | StoryContext {
  return currentStoryContext;
}

export function setStoryContext(context: StoryContext) {
  currentStoryContext = context;
}
