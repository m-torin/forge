# @repo/auth

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Features**: `./actions`, `./components`, `./shared`, `./types`, `./config`
  - **Testing**: `./testing`, `./testing/mocks`

- _AI Hints:_

  ```typescript
  // Primary: Better Auth with organizations - server-side auth checks only
  import { auth } from "@repo/auth/server/next";
  // Edge: import { auth } from "@repo/auth/server/edge"
  // Client: import { useAuth } from "@repo/auth/client/next"
  // ❌ NEVER: Use server auth functions in client components
  ```

- _Key Features:_
  - **Complete Auth Methods**: Email/password, magic links, social OAuth
    (Google, GitHub), 2FA, passkeys
  - **Organization System**: Multi-tenant organizations with teams, roles,
    member management
  - **API Key Management**: Production-ready API authentication with rate
    limiting
  - **Admin Panel**: User management, impersonation, session control, ban/unban
  - **RBAC**: Organization roles (owner/admin/member) and system roles
    (super-admin/moderator/support)

- _Environment Variables:_

  ```bash
  BETTER_AUTH_SECRET=your-secret-key-here
  BETTER_AUTH_URL=http://localhost:3000
  DATABASE_URL=postgresql://...
  # Optional: GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, RESEND_API_KEY
  ```

- _Quick Setup:_

  ```typescript
  // app/api/auth/[...all]/route.ts
  import { auth } from "@repo/auth/server";
  import { toNextJsHandler } from "better-auth/next-js";
  export const { GET, POST } = toNextJsHandler(auth);
  ```

- _Documentation:_
  **[Auth Package](../../apps/docs/packages/auth/overview.mdx)**
