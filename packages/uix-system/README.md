# @repo/uix-system

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./mantine`, `./algolia`, `./tailwind`
  - **Tailwind**: `./tailwind/v3`, `./tailwind/v3/components`,
    `./tailwind/v3/collaboration`
  - **Utilities**: `./shared/i18n`

- _AI Hints:_

  ```typescript
  // Primary: UI component system - Mantine, Tailwind v3/v4, Algolia search, TipTap editor
  // Mantine: import { DataTable, AuthGuard } from "@repo/uix-system/mantine"
  // Tailwind: import { AdvancedAnimations } from "@repo/uix-system/tailwind/v3"
  // Algolia: import { SearchProvider, SearchBox } from "@repo/uix-system/algolia"
  // ❌ NEVER: Mix v3 and v4 Tailwind components or use without proper peer deps
  ```

- _Key Features:_
  - **Mantine Components**: 20+ auth components, data tables, page headers,
    stats cards
  - **Tailwind v3/v4**: Advanced animations, mobile optimizations, theme
    toggles, UI components
  - **Algolia Search**: Complete search implementation with SSR, autocomplete,
    refinements
  - **TipTap Editor**: Rich text editing with collaboration support (Yjs
    integration)
  - **Authentication UI**: Complete auth flow components with Better Auth
    integration

- _Component Categories:_
  - **Mantine Auth**: Sign in/up forms, passkey management, sessions,
    organization management
  - **Mantine Data**: DataTable with sorting/filtering, PageHeader, StatsCard
  - **Tailwind v3**: Advanced animations, mobile optimizations, keyboard
    shortcuts
  - **Tailwind v4**: Enhanced auth components, dark mode, validation
  - **Algolia**: Search provider, autocomplete, refinements, pagination,
    highlighting
  - **Shared**: Internationalization components with i18n support

- _Environment Variables:_

  ```bash
  # Algolia Search (optional)
  NEXT_PUBLIC_ALGOLIA_APPLICATION_ID=your-app-id
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
  ALGOLIA_ADMIN_API_KEY=your-admin-key
  
  # Collaboration (optional)
  NEXT_PUBLIC_COLLABORATION_ENDPOINT=wss://your-collab-server.com
  NEXT_PUBLIC_YJS_WEBSOCKET_URL=wss://your-yjs-server.com
  ```

- _Quick Setup:_

  ```typescript
  // Mantine auth components
  import { SignInForm, AuthGuard } from "@repo/uix-system/mantine";

  function AuthPage() {
    return (
      <AuthGuard fallback={<SignInForm />}>
        <Dashboard />
      </AuthGuard>
    );
  }

  // Algolia search integration
  import { SearchProvider, SearchBox, SearchResults } from "@repo/uix-system/algolia";

  function SearchPage() {
    return (
      <SearchProvider indexName="products">
        <SearchBox />
        <SearchResults />
      </SearchProvider>
    );
  }

  // Tailwind v3 animations
  import { AdvancedAnimations, TypingAnimation } from "@repo/uix-system/tailwind/v3";

  function HomePage() {
    return (
      <div>
        <TypingAnimation text="Welcome to our platform" />
        <AdvancedAnimations.FadeInUp>
          <h1>Content here</h1>
        </AdvancedAnimations.FadeInUp>
      </div>
    );
  }
  ```

- _Peer Dependencies:_
  - **Required**: @mantine/core, @mantine/form, @mantine/hooks, react, react-dom
  - **Optional**: @mantine/modals, @mantine/notifications, @tiptap/core,
    @tiptap/react, yjs, next

- _Storybook Integration:_
  - All components include comprehensive Storybook stories
  - Interactive documentation for auth flows, data components, animations
  - Example implementations and configuration options

- _Testing Coverage:_
  - Comprehensive test suite with Vitest
  - Component testing with jsdom
  - Coverage reports available in coverage/ directory
  - UI testing mode with @vitest/ui

- _Architecture:_
  - **Mantine**: Complete auth system with Better Auth integration
  - **Tailwind v3**: Advanced animations and mobile-first optimizations
  - **Tailwind v4**: Enhanced components with improved dark mode support
  - **Algolia**: Production-ready search with Next.js SSR support
  - **TipTap**: Rich text editing with real-time collaboration

- _Component Examples:_
  - **Auth Flow**: SignIn → TwoFactor → Dashboard → SessionManagement
  - **Data Display**: DataTable with pagination, sorting, filtering
  - **Search**: SearchBox → AutoComplete → Results → Refinements
  - **Animations**: FadeIn, SlideUp, TypeWriter, Parallax effects
  - **Layout**: Responsive grids, mobile optimizations, keyboard navigation

- _Documentation:_
  **[UIX System Package](../../apps/docs/packages/uix-system/)**
