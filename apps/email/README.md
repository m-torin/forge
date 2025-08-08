# Email Preview

- _Port:_ **3500** (React Email)

- _AI Hints:_

  ```typescript
  // Primary: React Email development server - preview and test email templates
  // Dev: email dev --port 3500
  // Build: email build (generates static HTML)
  // Export: email export (exports all templates)
  // ❌ NEVER: Use in production - development preview only
  ```

- _Key Features:_
  - **React Email Preview**: Live preview server for @repo/email templates
  - **8 Professional Templates**: Magic link, welcome, password reset,
    verification, etc.
  - **Interactive Development**: Hot reload, responsive preview, dark mode
    testing
  - **Export Functionality**: Generate static HTML for all email templates
  - **Template Testing**: Preview with dynamic data and different viewport sizes
  - **Resend Integration**: Connected to @repo/email package for production
    delivery

- _Available Templates:_
  - **Magic Link**: Passwordless authentication emails
  - **Welcome**: User onboarding and welcome messages
  - **Password Reset**: Secure password reset flows
  - **Email Verification**: Account verification emails
  - **Newsletter**: Marketing and newsletter campaigns
  - **Invoice**: Billing and payment notifications
  - **Receipt**: Purchase confirmations
  - **Two-Factor**: 2FA authentication codes

- _Documentation:_ **[Email Preview](../docs/apps/email.mdx)**
