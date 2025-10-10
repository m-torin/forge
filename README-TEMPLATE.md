# README Template

Use this template for all app and package READMEs to ensure consistency.

## Template Structure

```markdown
# @repo/[package-name] | [App Name]

> Brief one-line description of purpose

📖 **[Full Documentation](../../apps/docs/packages/[name].mdx)** |
**[App Documentation](../../apps/docs/apps/[name].mdx)**

## Primary Use Cases

- Main scenario 1 with brief context
- Main scenario 2 with brief context
- Main scenario 3 with brief context
- Main scenario 4 (if applicable)

## Edge Cases

- **Configuration**: Missing env vars, API keys, or required dependencies
- **Runtime**: Rate limits, timeouts, provider outages, or service failures
- **Integration**: SSR/hydration mismatches, peer dependency conflicts
- **Security**: PII handling, input validation, or injection risks
- **Performance**: Memory limits, concurrency issues, or payload size
  constraints

## AI Hints

- Key constraint/pattern for AI assistance (e.g., "Edge runtime compatible")
- Important limitation or requirement (e.g., "Requires Node 22+ features")
- Critical usage pattern (e.g., "Use /server/next imports in Next.js apps")
```

## Examples by Type

### Package Example

```markdown
# @repo/auth

> Better Auth integration for Next.js with server/edge/client support

📖 **[Full Documentation](../../apps/docs/packages/auth/overview.mdx)**

## Primary Use Cases

- Secure authentication flows (email/password, magic links, social, passkeys)
- Session management with organization support
- Server-side guards and middleware protection
- Client-side auth state and user management

## Edge Cases

- **Configuration**: Missing DATABASE_URL, AUTH_SECRET, or provider credentials
- **Runtime**: Cookie SameSite issues, cross-subdomain session handling
- **Integration**: SSR hydration mismatches with auth state
- **Security**: Rate limiting for brute-force protection, session fixation
- **Performance**: Database connection limits, slow auth provider responses

## AI Hints

- Use `/server/next` for Next.js server components, `/server/edge` for
  middleware
- Always validate auth state server-side for protected routes
- Edge runtime compatible for middleware and API routes
```

### App Example

```markdown
# AI Chatbot Example

> Next.js AI chatbot with streaming, tools, and RAG capabilities

📖 **[Full Documentation](../../apps/docs/apps/ai-chatbot.mdx)**

## Primary Use Cases

- Conversational UI with streaming AI responses
- Tool calling and function execution workflows
- RAG (Retrieval Augmented Generation) with vector similarity
- Multi-model experimentation and A/B testing

## Edge Cases

- **Configuration**: Missing model API keys, vector database credentials
- **Runtime**: Model rate limits, provider outages, token overflows
- **Integration**: Streaming cancellations, partial response handling
- **Security**: Input validation, prompt injection protection
- **Performance**: Large context windows, concurrent user limits

## AI Hints

- Uses AI SDK v5 with `inputSchema` (not `parameters`)
- Streaming responses require proper error boundaries
- Vector embeddings need dimension consistency across models
```

## Guidelines

1. **Keep it minimal** - Detailed documentation lives in `/apps/docs`
2. **Focus on discovery** - Help developers quickly understand purpose and
   gotchas
3. **Link correctly** - Ensure all doc links point to existing MDX files
4. **Be consistent** - Follow the exact template structure
5. **Stay current** - Update as packages evolve or new edge cases emerge
