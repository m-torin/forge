# Provider-Specific Features Documentation

This document catalogs the unique features and capabilities of each provider
tool to ensure they are preserved during refactoring.

## Weather Tools (`weather.ts`)

### Open-Meteo API Provider

- **API-Specific Features**:
  - Timezone auto-detection (`timezone: 'auto'`)
  - Multiple weather models support (`best_match`, `ecmwf`, `gfs`)
  - Hourly forecasts with detailed parameters
  - Daily forecasts with sunrise/sunset times
  - Weather codes for detailed conditions
  - Wind speed and direction data
  - No API key required (free tier)

- **Custom Parameters**:
  - `includeHourly`: Toggle hourly forecast data
  - `includeForecast`: Toggle daily forecast data
  - `extraParams`: Custom query parameters for advanced usage
  - Alternative `baseUrl` support for different endpoints

- **Error Handling**:
  - Graceful fallback to mock data when API fails
  - Structured error responses with fallback suggestions
  - Response validation using Zod schema

## MCP Tools (`mcp-tools.ts`)

### Model Context Protocol Provider

- **Transport Types**:
  - `stdio`: Standard input/output for local servers
  - `sse`: Server-Sent Events for web-based servers
  - `websocket`: WebSocket connections for real-time servers

- **Server Management**:
  - Auto-discovery of common MCP servers
  - Health check monitoring with configurable intervals
  - Auto-restart capability for failed connections
  - Connection timeout handling

- **Provider-Specific Servers**:
  - **Filesystem**: File operations with encoding support
  - **Database**: SQLite operations with schema introspection
  - **Context7**: Documentation lookup with SSE transport
  - **Web Search**: Brave Search API integration
  - **Weather**: Weather data with multiple sources

- **Advanced Features**:
  - Tool caching and refresh mechanisms
  - Server status tracking and reporting
  - Batch tool execution support
  - Custom tool name prefixing/unprefixing

## Code Quality Tools

### TypeScript Integration

- **Compiler Features**:
  - Direct TypeScript compiler invocation
  - Skip lib check for faster analysis
  - Custom tsconfig handling
  - Source map support for accurate line numbers

- **Analysis Capabilities**:
  - Complexity calculation using AST parsing
  - Function coverage detection
  - Branch coverage analysis
  - Integration with ESLint for style checking

### Babel Integration (`test-coverage.ts`, `documentation-generator.ts`)

- **AST Processing**:
  - TypeScript and JSX plugin support
  - Traverse with proper default export handling
  - Function declaration detection
  - Import/export analysis

- **Language Support**:
  - TypeScript (.ts, .tsx)
  - JavaScript (.js, .jsx)
  - React components and hooks
  - Modern ES6+ syntax

## Key Provider Differentiators

### What Makes Each Provider Unique

1. **Weather (Open-Meteo)**:
   - Free, no-API-key weather service
   - European weather model integration
   - High-resolution hourly data
   - Timezone-aware responses

2. **MCP (Model Context Protocol)**:
   - Multi-transport support (stdio/sse/ws)
   - Dynamic tool discovery
   - Server health monitoring
   - Protocol-specific error handling

3. **Code Quality (TypeScript/Babel)**:
   - Direct compiler integration
   - AST-based analysis
   - Multi-language support
   - Development tool integration

## Preservation Strategy

When refactoring to direct AI SDK patterns:

1. **Maintain All Provider Options**: Each unique parameter/feature must be
   preserved in the new tool schema
2. **Preserve Error Handling**: Provider-specific error handling and fallbacks
   must be maintained
3. **Keep Transport Logic**: MCP transport handling, HTTP request customization,
   etc.
4. **Document Capabilities**: Each tool should clearly document its
   provider-specific features
5. **Test Provider Features**: Ensure all unique capabilities still work after
   refactoring

## Migration Checklist

For each provider tool:

- [ ] All unique schema parameters preserved
- [ ] Provider-specific error handling maintained
- [ ] Custom response processing intact
- [ ] Transport/connection logic preserved
- [ ] Advanced configuration options available
- [ ] Provider documentation updated
- [ ] Integration tests passing
