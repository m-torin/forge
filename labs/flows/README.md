# Flowbuilder

Business Logic Engine at-scale - A visual programming platform for creating complex workflows and integrations.

## Overview

Flowbuilder is a powerful workflow automation platform that enables visual programming for complex business logic. It provides a drag-and-drop interface for creating flows that integrate with:

- AWS services (Lambda, S3, SNS, SQS, EventBridge)
- GitHub webhooks and events
- AI services (OpenAI, Anthropic)
- Custom webhooks and APIs

## Getting Started

### 1. Clone the repository and install dependencies

```
git clone https://github.com/nextauthjs/next-auth-example.git
cd next-auth-example
pnpm install
```

### 2. Configure your local environment

Copy the env.example file in this directory to .env.local (which will be ignored by Git):

```
cp env.example .env.local
```

**⚠️ IMPORTANT: This application requires several environment variables to function properly. Please review the `env.example` file and configure all required variables.**

#### Required Environment Variables

This application integrates with multiple services and requires the following environment variables:

- **Database**: `PRISMA_DB_URL` - PostgreSQL connection string
- **Authentication**: `AUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` - NextAuth.js and GitHub OAuth
- **AWS Integration**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` - For S3, SNS, SQS, EventBridge, Lambda
- **Vercel Integration**: `VERCEL_AUTH_BEARER_TOKEN`, `VERCEL_PROJECT_ID` - For domain management
- **OpenAI Integration**: `OPENAI_API_KEY` - For GPT functionality
- **Encryption**: `ENCRYPTION_SECRET` - For data encryption
- **Cache**: `REDIS_URL`, `CACHE_STORE` - For caching and rate limiting

See `env.example` for a complete list with descriptions.

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
