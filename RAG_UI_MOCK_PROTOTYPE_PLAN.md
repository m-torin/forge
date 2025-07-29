# Mock RAG UI Components for Rapid Prototyping

Following your existing MCP prototype pattern with `isPrototypeMode()`, mock
data, and visual components.

## Phase 1: Mock RAG Data & Core Components

### 1. **Mock RAG Data** (`lib/mock-data.ts` additions)

```typescript
// Mock knowledge base documents
export const mockRAGDocuments = [
  {
    id: "doc-react-hooks",
    title: "React Hooks Guide",
    content: "useState, useEffect, useContext...",
    category: "Frontend",
    uploadedAt: "2024-01-15",
    chunks: 12,
    score: 0.95
  }
  // ... more mock documents
];

// Mock search results
export const mockRAGSearchResults = [
  {
    content: "React hooks are functions that let you...",
    score: 0.94,
    metadata: { title: "React Hooks Guide", source: "documentation" }
  }
  // ... more results
];
```

### 2. **RAG Knowledge Base Dashboard** (`components/rag/rag-knowledge-base.tsx`)

- **Document Grid** - Visual cards showing stored documents
- **Search Interface** - Filter and search through knowledge base
- **Upload Zone** - Drag & drop area (mock functionality)
- **Stats Panel** - Document count, categories, recent activity
- **Quick Actions** - Add document, clear all, export

### 3. **RAG Analytics Dashboard** (`components/rag/rag-analytics.tsx`)

- **Usage Metrics** - Search queries, response quality
- **Popular Queries** - Most asked questions
- **Source Attribution** - Which documents are used most
- **Performance Stats** - Response times, success rates
- **Mock Charts** - Simple visual representations

## Phase 2: Enhanced Chat Integration

### 4. **RAG Suggestion Panel** (`components/rag/rag-suggestions.tsx`)

- **Smart Queries** - Suggested questions based on knowledge base
- **Related Topics** - Show connected documents
- **Quick Add** - "Add this to knowledge base" for chat messages
- **Context Hints** - Visual indicators of available knowledge

### 5. **RAG Processing Visualization** (`components/rag/rag-processing.tsx`)

- **Step-by-Step Flow** - Search → Retrieve → Generate (animated)
- **Progress Indicators** - Real-time feedback during RAG operations
- **Source Preview** - Show documents being used in real-time
- **Quality Scoring** - Visual confidence indicators

## Phase 3: Interactive Mock Components

### 6. **RAG Playground** (`components/rag/rag-playground.tsx`)

- **Interactive Demo** - Try different queries and see mock results
- **Parameter Tuning** - Adjust search parameters (topK, threshold)
- **Response Comparison** - With/without RAG responses side-by-side
- **Example Scenarios** - Pre-built demo scenarios

### 7. **RAG Settings Panel** (`components/rag/rag-settings.tsx`)

- **Configuration Options** - Search parameters, model selection
- **Data Source Management** - Enable/disable document categories
- **Quality Controls** - Confidence thresholds, fallback behavior
- **Debug Mode** - Show internal search process

## Implementation Details

### Mock Data Pattern (Following MCP Style):

```typescript
export function getMockRAGData() {
  if (!isPrototypeMode()) return null;

  return {
    documents: mockRAGDocuments,
    searchResults: mockRAGSearchResults,
    metrics: mockRAGMetrics,
    suggestions: mockRAGSuggestions
  };
}
```

### Visual Components:

- **Consistent Design** - Match existing Mantine + shadcn/ui patterns
- **Loading States** - Skeleton components for async operations
- **Empty States** - Beautiful empty knowledge base illustrations
- **Error States** - Graceful error handling with retry options
- **Mobile Responsive** - Touch-friendly RAG interfaces

### Integration Points:

- **Sidebar Section** - New "Knowledge Base" tab
- **Chat Interface** - RAG indicators and source cards (already exists)
- **Settings Page** - RAG configuration section
- **Feature Playground** - RAG-specific demos and examples

## Quick Implementation Strategy:

1. **Start with mock data** - Add RAG mock data to existing `mock-data.ts`
2. **Create dashboard shell** - Basic layout with placeholder content
3. **Add visual flourishes** - Icons, animations, loading states
4. **Hook into prototype mode** - Conditional rendering based on
   `isPrototypeMode()`
5. **Progressive enhancement** - Start simple, add features incrementally

This follows your existing MCP pattern exactly: prototype mode detection, mock
data, visual components, and easy toggle between mock/real functionality.

## Task Breakdown

### Phase 1 Tasks:

- [ ] Add mock RAG data to existing `mock-data.ts`
- [ ] Create RAG Knowledge Base Dashboard component
- [ ] Create RAG Analytics Dashboard component

### Phase 2 Tasks:

- [ ] Create RAG Suggestion Panel component
- [ ] Create RAG Processing Visualization component

### Phase 3 Tasks:

- [ ] Create RAG Playground interactive demo component
- [ ] Create RAG Settings Panel component
- [ ] Integrate RAG components into sidebar and feature playground

### Integration Tasks:

- [ ] Add Knowledge Base sidebar section
- [ ] Update feature playground with RAG demos
- [ ] Add RAG settings to settings page
- [ ] Ensure mobile responsiveness
- [ ] Add prototype mode detection throughout
