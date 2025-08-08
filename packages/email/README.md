# @repo/email

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Templates**: `./templates/api-key-created`, `./templates/contact`,
    `./templates/magic-link`
  - **Utilities**: `./keys`, `./env`

- _AI Hints:_

  ```typescript
  // Primary: React Email templates with Resend delivery - 8 professional templates
  import { sendMagicLinkEmail, sendWelcomeEmail } from "@repo/email/server";
  // Templates: import { MagicLinkTemplate } from "@repo/email/templates/magic-link"
  // ❌ NEVER: Send emails from client components or without rate limiting
  ```

- _Key Features:_
  - **8 Professional Templates**: Magic link, verification, password reset,
    organization invites, welcome, API key alerts, contact forms, OTP
  - **React Email Framework**: Modern, responsive templates built with React
    components
  - **Resend Integration**: Enterprise email delivery with high deliverability
    rates
  - **Security-First Design**: Built-in security warnings, expiration notices,
    and best practices
  - **Graceful Degradation**: Mock email service for development environments
    without RESEND_TOKEN
  - **T3 Env Validation**: Type-safe environment configuration with helper
    functions

- _Environment Variables:_

  ```bash
  # Production (required)
  RESEND_FROM=noreply@yourdomain.com
  RESEND_TOKEN=re_your_resend_api_token
  
  # Development (optional - uses mock service if missing)
  RESEND_FROM=noreply@yourdomain.com
  RESEND_TOKEN=re_your_resend_api_token
  ```

- _Quick Setup:_

  ```typescript
  // Authentication emails
  import {
    sendMagicLinkEmail,
    sendPasswordResetEmail
  } from "@repo/email/server";
  await sendMagicLinkEmail({
    email: "user@example.com",
    magicLink: "https://app.com/verify?token=xyz",
    name: "John Doe",
    expiresIn: "20 minutes"
  });

  // Organization management
  import { sendOrganizationInvitationEmail } from "@repo/email/server";
  await sendOrganizationInvitationEmail({
    email: "member@example.com",
    organizationName: "Acme Corp",
    inviterName: "John Doe",
    inviteLink: "https://app.com/invite?token=ghi"
  });
  ```

- _Email Preview:_

  ```bash
  # Start email preview server (apps/email)
  pnpm --filter email dev
  # Open preview at http://localhost:3500
  ```

- _Documentation:_ **[Email Package](../../apps/docs/packages/email.mdx)**
