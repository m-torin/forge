# @repo/notifications

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **UI Integration**: `./mantine-notifications`

- _AI Hints:_

  ```typescript
  // Primary: Mantine UI notifications + Knock.io multi-channel delivery
  import { notify } from "@repo/notifications/mantine-notifications";
  // Server: import { notifications } from "@repo/notifications/server/next"
  // ❌ NEVER: Use server notifications without proper UI provider setup
  ```

- _Key Features:_
  - **Instant UI Feedback**: Mantine-based toast notifications with styled
    presets (success, error, warning, info)
  - **Multi-Channel Delivery**: Knock.io integration for email, SMS, push
    notifications
  - **Real-Time Feeds**: In-app notification feeds with React components
  - **Graceful Degradation**: Works without configuration for development
  - **Environment-Aware**: Smart defaults that adapt to dev/prod environments
  - **React Integration**: Drop-in notification provider and trigger components

- _Environment Variables:_

  ```bash
  # Development (optional - graceful degradation without these)
  KNOCK_SECRET_API_KEY=sk_test_your_secret_key
  NEXT_PUBLIC_KNOCK_API_KEY=pk_test_your_public_key
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID=your_feed_id
  
  # Production (required for full functionality)
  KNOCK_SECRET_API_KEY=sk_live_your_secret_key
  NEXT_PUBLIC_KNOCK_API_KEY=pk_live_your_public_key
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID=your_feed_id
  ```

- _Quick Setup:_

  ```typescript
  // 1. Provider setup in layout
  import { NotificationsProvider } from '@repo/notifications/mantine-notifications';
  <NotificationsProvider>{children}</NotificationsProvider>

  // 2. Instant UI feedback
  import { notify } from "@repo/notifications/mantine-notifications";
  notify.success("Operation completed successfully!");
  notify.error("Something went wrong");

  // 3. Multi-channel server notifications
  import { notifications } from "@repo/notifications/server/next";
  await notifications.trigger("welcome-email", {
    recipients: [userId],
    data: { email, name: "John Doe" }
  });

  // 4. In-app notification feed
  import { NotificationsTrigger } from '@repo/notifications/client/next';
  <NotificationsTrigger />
  ```

- _Documentation:_
  **[Notifications Package](../../apps/docs/packages/notifications.mdx)**
