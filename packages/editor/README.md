# @repo/editor

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./components`, `./hooks`, `./utils`
  - **Specialized**: `./embeddable`, `./collaboration`, `./offline`
  - **Bundles**: `./react`, `./nextjs`

- _AI Hints:_

  ```typescript
  // Primary: Notion-style editor with multiple deployment formats + collaboration
  import { Editor } from "@repo/editor"; // Clean external API
  // Internal: import { EmbeddableNotionEditor } from "@repo/editor/components/embeddable"
  // React: import { Editor } from "@repo/editor/react"
  // Next.js: import { Editor } from "@repo/editor/nextjs"
  // ❌ NEVER: Render large files without virtualization or ignore performance
  ```

- _Key Features:_
  - **Multiple Distribution Formats**: Standalone IIFE (~1.6MB), React bundle
    (~40KB), Next.js bundle (~36KB)
  - **Notion-Style Editor**: Rich text editing with blocks, formatting, lists,
    tables, code blocks
  - **Collaboration Support**: Real-time collaborative editing with conflict
    resolution
  - **Security First**: Built-in XSS protection, CSP support, file validation
  - **Framework Agnostic**: Works in React, Next.js, vanilla JavaScript, and
    direct HTML

- _Environment Variables:_

  ```bash
  # Optional: Collaboration features
  COLLABORATION_ENDPOINT=wss://your-collab-server.com
  COLLABORATION_API_KEY=your-api-key
  
  # Optional: File uploads
  UPLOAD_ENDPOINT=https://your-upload-server.com/api/upload
  UPLOAD_MAX_SIZE=10485760 # 10MB
  ```

- _Quick Setup:_

  ```typescript
  // External usage (clean API)
  import { Editor } from "@repo/editor";

  function MyApp() {
    return (
      <Editor
        placeholder="Start writing..."
        onChange={(html) => console.log(html)}
      />
    );
  }

  // Internal monorepo usage
  import { EmbeddableNotionEditor } from "@repo/editor/components/embeddable";
  import { useCollaborativeEditing } from "@repo/editor/hooks";

  const editor = new EmbeddableNotionEditor({
    container: document.getElementById("editor"),
    placeholder: "Start writing...",
    collaboration: {
      enabled: true,
      endpoint: process.env.COLLABORATION_ENDPOINT
    }
  });
  ```

- _Distribution Options:_
  - **Standalone HTML**: Direct script inclusion with no dependencies
  - **React Bundle**: Optimized for React applications
  - **Next.js Bundle**: SSR-compatible for Next.js apps
  - **Full Library**: Complete component library with hooks and utilities

- _Performance Metrics:_
  - Standalone: ~200ms load on 3G, includes all dependencies
  - React/Next.js: ~50ms load with external dependencies
  - Tree-shakeable exports for optimal bundle size

- _Documentation:_
  **[Editor Package](../../apps/docs/packages/editor/overview.mdx)**
