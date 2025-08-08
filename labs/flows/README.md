# @labs/flows - Flowbuilder

- _Can build:_ **YES** (Next.js App)

- _AI Hints:_

  ```typescript
  // Primary: Visual workflow automation platform with AWS, AI, GitHub integrations
  // Flow: import { ReactFlow, saveFlowAction } from "@/flows"
  // AWS: import { awsClients, lambdaHandler } from "@/integrations/aws"
  // AI: import { openaiNode, anthropicNode } from "@/flows/nodes/gpt"
  // ❌ NEVER: Run workflows without proper authentication or bypass encryption
  ```

- _Key Features:_
  - **Visual Flow Builder**: Drag-and-drop interface with React Flow for complex workflow creation
  - **AWS Integration**: Complete SDK integration for Lambda, S3, SNS, SQS, EventBridge, IAM
  - **AI Services**: OpenAI GPT and Anthropic Claude nodes with custom prompting
  - **GitHub Integration**: Webhook receivers and event processing for CI/CD workflows
  - **Real-time Execution**: Flow orchestration with error handling and retry logic
  - **Authentication**: NextAuth.js with GitHub OAuth and WebAuthn passkey support

- _Integrations:_
  - **AWS Services**: Lambda functions, S3 storage, SNS/SQS messaging, EventBridge events
  - **AI Providers**: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude), custom prompts
  - **Version Control**: GitHub webhooks, repository events, CI/CD triggers
  - **Database**: PostgreSQL with Prisma ORM, Redis caching
  - **Monitoring**: Sentry error tracking, Vercel analytics

Business Logic Engine at-scale - A visual programming platform for creating complex workflows and integrations.

- _Environment Variables:_
  ```bash
  # Database
  PRISMA_DB_URL=postgresql://user:pass@localhost:5432/flows
  
  # Authentication
  AUTH_SECRET=your-auth-secret
  GITHUB_ID=your-github-oauth-id
  GITHUB_SECRET=your-github-oauth-secret
  
  # AWS Integration
  AWS_ACCESS_KEY_ID=your-aws-access-key
  AWS_SECRET_ACCESS_KEY=your-aws-secret-key
  AWS_REGION=us-east-1
  
  # AI Services
  OPENAI_API_KEY=sk-your-openai-key
  ANTHROPIC_API_KEY=your-anthropic-key
  
  # Cache & Storage
  REDIS_URL=redis://localhost:6379
  ENCRYPTION_SECRET=your-encryption-secret
  
  # Vercel (optional)
  VERCEL_AUTH_BEARER_TOKEN=your-vercel-token
  VERCEL_PROJECT_ID=your-project-id
  ```

- _Quick Setup:_
  ```bash
  # Install dependencies
  pnpm install
  
  # Set up environment
  cp env.example .env.local
  # Edit .env.local with your values
  
  # Set up database
  pnpm prisma:generate
  pnpm prisma:migrate:dev
  
  # Start development server
  pnpm dev
  ```

- _Flow Node Types:_
  - **Triggers**: Webhook, Cron, GitHub events
  - **AWS**: Lambda, S3, SNS, SQS, EventBridge
  - **AI**: OpenAI GPT, Anthropic Claude
  - **Logic**: If/Then/Else, JavaScript/Python editors
  - **Data**: Transform, filter, aggregate operations

- _Architecture:_
  - **Frontend**: Next.js 15 with React Flow for visual editor
  - **Backend**: Prisma ORM with PostgreSQL, Redis caching
  - **Security**: NextAuth.js, data encryption, rate limiting
  - **Deployment**: Vercel with edge functions and database

## Getting Started

#### Database

A database is needed to persist user accounts and to support email sign in. However, you can still use NextAuth.js for authentication without a database by using OAuth for authentication. If you do not specify a database, [JSON Web Tokens](https://jwt.io/introduction) will be enabled by default.

You **can** skip configuring a database and come back to it later if you want.

For more information about setting up a database, please check out the following links:

- Docs: [authjs.dev/reference/core/adapters](https://authjs.dev/reference/core/adapters)

### 3. Configure Authentication Providers

1. Review and update options in `auth.ts` as needed.

2. When setting up OAuth, in the developer admin page for each of your OAuth services, you should configure the callback URL to use a callback path of `{server}/api/auth/callback/{provider}`.

e.g. For Google OAuth you would use: `http://localhost:3000/api/auth/callback/google`

A list of configured providers and their callback URLs is available from the endpoint `api/auth/providers`. You can find more information at https://authjs.dev/getting-started/providers/oauth-tutorial

1. You can also choose to specify an SMTP server for passwordless sign in via email.

### 4. Start the application

To run your site locally, use:

```
pnpm run dev
```

To run it in production mode, use:

```
pnpm run build
pnpm run start
```

### 5. Preparing for Production

Follow the [Deployment documentation](https://authjs.dev/getting-started/deployment)

## Acknowledgements

<a href="https://vercel.com?utm_source=nextauthjs&utm_campaign=oss">
<img width="170px" src="https://raw.githubusercontent.com/nextauthjs/next-auth/main/docs/public/img/etc/powered-by-vercel.svg" alt="Powered By Vercel" />
</a>
<p align="left">Thanks to Vercel sponsoring this project by allowing it to be deployed for free for the entire NextAuth.js Team</p>

## License

ISC
