<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

# AI Chatbot

- _Type:_ **Next.js Application**

- _Purpose:_ **Multi-provider AI chatbot with real-time streaming, artifacts
  generation, and comprehensive authentication**

- _Documentation:_ **[AI Chatbot](../docs/apps/ai-chatbot.mdx)**

## Features

- 🤖 **Multi-Provider AI Support** - Support for xAI (Grok), OpenAI, Anthropic,
  Google AI, and Perplexity
- 💬 **Real-time Chat** - Stream responses with resumable streams
- 🎨 **Artifacts** - Generate images, code, and documents
- 🔐 **Authentication** - GitHub and Google OAuth
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Mode** - Built-in dark mode support
- 🧪 **Testing** - Comprehensive test suite with Playwright

## Multi-Provider AI Support

This chatbot now supports multiple AI providers, allowing users to choose from
different models based on their needs and available API keys.

### Supported Providers

1. **xAI (Grok)** - Primary provider with multimodal capabilities
2. **OpenAI** - GPT-4o and GPT-4o Mini models
3. **Anthropic** - Claude Sonnet and Claude Haiku models
4. **Google AI** - Gemini Pro and Gemini Flash models
5. **Perplexity** - Sonar models with web search capabilities

### Environment Variables

Copy the following environment variables to your `.env.local` file:

```bash
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/ai_chatbot"
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/ai_chatbot?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/ai_chatbot"

# Auth
AUTH_SECRET="your-auth-secret-here"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# AI Providers (at least one required)
XAI_API_KEY="your-xai-api-key"               # xAI (Grok) - Primary
OPENAI_API_KEY="your-openai-api-key"         # OpenAI - Alternative
ANTHROPIC_API_KEY="your-anthropic-api-key"   # Anthropic - Alternative
GOOGLE_AI_API_KEY="your-google-ai-api-key"   # Google AI - Alternative
PERPLEXITY_API_KEY="your-perplexity-api-key" # Perplexity - Alternative

# Storage
BLOB_READ_WRITE_TOKEN="your-blob-read-write-token"

# Redis (for resumable streams)
REDIS_URL="redis://localhost:6379"
REDIS_TOKEN="your-redis-token"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Environment
NODE_ENV="development"

# Client
NEXT_PUBLIC_VERCEL_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Provider Priority

The system will automatically select the best available model based on this
priority order:

1. xAI (Grok) - If `XAI_API_KEY` is available
2. OpenAI - If `OPENAI_API_KEY` is available
3. Anthropic - If `ANTHROPIC_API_KEY` is available
4. Google AI - If `GOOGLE_AI_API_KEY` is available
5. Perplexity - If `PERPLEXITY_API_KEY` is available

### Model Selection

Users can select different models from the dropdown in the chat interface.
Available models depend on which API keys are configured:

- **xAI Models**: Grok Vision, Grok Reasoning, Grok Title, Grok Artifact
- **OpenAI Models**: GPT-4o, GPT-4o Mini, GPT-4o Reasoning
- **Anthropic Models**: Claude Sonnet, Claude Sonnet Reasoning, Claude Haiku
- **Google Models**: Gemini Pro, Gemini Flash
- **Perplexity Models**: Perplexity Sonar, Perplexity Sonar Large

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up your environment variables (see above)
4. Run the development server: `pnpm dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

## Deployment

The easiest way to deploy your AI chatbot is to use the
[Vercel Platform](https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET&envDescription=Learn
more about how to get the API Keys for the
application&envLink=https://github.com/vercel/ai-chatbot/blob/main/.env.example&demo-title=AI
Chatbot&demo-description=An Open-Source AI Chatbot Template Built With Next.js
and the AI SDK by
Vercel.&demo-url=https://chat.vercel.ai&products=[{"type":"integration","protocol":"ai","productSlug":"grok","integrationSlug":"xai"},{"type":"integration","protocol":"storage","productSlug":"neon","integrationSlug":"neon"},{"type":"integration","protocol":"storage","productSlug":"upstash-kv","integrationSlug":"upstash"},{"type":"blob"}])

## License

MIT License - see the [LICENSE](LICENSE) file for details.
