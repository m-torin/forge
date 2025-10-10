# @repo/editing

Unified TipTap v3 rich text editor with Tailwind/Mantine UI, state management,
and real-time collaboration.

## Overview

`@repo/editing` provides a modern, unified TipTap v3 architecture with:

- ✅ **ESM Direct Imports** - No build step, consumes TypeScript source
- ✅ **TipTap v3 Latest** - Uses official TipTap v3 API patterns
- ✅ **Dual UI Systems** - Light (Tailwind) and Mantine components
- ✅ **State Management** - Jotai for reactive state
- ✅ **Real-time Collaboration** - Yjs + WebSocket support
- ✅ **AI Features** - AI highlighting, completions, slash commands
- ✅ **Tree-shakeable** - Granular exports for optimal bundles

## Installation

```bash
pnpm add @repo/editing
```

## Quick Start

### Light Editor (Tailwind)

```tsx
import { EditorRoot, EditorContent } from "@repo/editing/light";
import { createBasicPreset } from "@repo/editing/presets";
import "@repo/editing/components/light/styles.css";

function MyEditor() {
  const extensions = createBasicPreset({
    placeholder: "Start writing..."
  });

  return (
    <EditorRoot>
      <EditorContent
        extensions={extensions}
        content="<p>Hello world!</p>"
        onUpdate={({ html }) => console.log(html)}
      />
    </EditorRoot>
  );
}
```

### AI-Enhanced Editor

```tsx
import {
  EditorRoot,
  EditorContent,
  BubbleMenu,
  CommandMenu
} from "@repo/editing/light";
import { createAIPreset } from "@repo/editing/presets";

function AIEditor() {
  const extensions = createAIPreset({
    placeholder: "Type / for AI commands...",
    aiHighlightColor: "#3b82f6",
    enableMarkdown: true,
    enableSlashCommands: true
  });

  return (
    <EditorRoot>
      <EditorContent extensions={extensions} />
      <BubbleMenu />
      <CommandMenu />
    </EditorRoot>
  );
}
```

### Mantine Notion Editor

```tsx
import { NotionEditor } from "@repo/editing/mantine";
import { createRichPreset } from "@repo/editing/presets";

function MyNotionEditor() {
  const extensions = createRichPreset({
    enableTables: true,
    enableImages: true,
    enableTaskLists: true
  });

  return (
    <NotionEditor
      extensions={extensions}
      content="<p>Start writing...</p>"
      showToolbar
      onUpdate={({ html, json }) => {
        console.log("Updated:", html);
      }}
    />
  );
}
```

### Collaborative Editor

```tsx
import { CollaborativeEditor } from "@repo/editing/collaboration";

function RealtimeEditor() {
  return (
    <CollaborativeEditor
      documentId="doc-123"
      user={{
        id: "user-456",
        name: "John Doe",
        color: "#10b981"
      }}
      serverUrl="wss://collab.example.com" // Optional: defaults to ws://localhost:1234
      showPresence
      onUpdate={({ html }) => console.log(html)}
    />
  );
}
```

## Hooks

### useEditor - Editor State & Stats

```tsx
import { useEditor } from "@repo/editing/hooks";

function EditorToolbar() {
  const {
    editor,
    isDirty,
    isEmpty,
    canUndo,
    canRedo,
    characterCount,
    wordCount,
    activeMarks
  } = useEditor();

  if (!editor) return null;

  return (
    <div>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!canRedo}
      >
        Redo
      </button>
      <span>
        {wordCount} words · {characterCount} characters
      </span>
    </div>
  );
}
```

### usePersistence - Save/Load Documents

```tsx
import { usePersistence } from "@repo/editing/hooks";
import { createLocalStorageStore } from "@repo/editing/utils";

function MyEditor() {
  const storageAdapter = createLocalStorageStore("my-docs");

  const { save, load, createNew, isSaving, lastSaved, isDirty } =
    usePersistence({
      storageAdapter,
      autoSaveInterval: 30000, // 30 seconds
      onSaveSuccess: (doc) => console.log("Saved:", doc.title)
    });

  return (
    <div>
      <button onClick={save} disabled={!isDirty || isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>
      <button onClick={() => createNew("New Document")}>New</button>
      {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
    </div>
  );
}
```

### useAICompletion - AI Features

```tsx
import { useAICompletion } from "@repo/editing/hooks";

function AIToolbar() {
  const {
    highlightText,
    removeHighlight,
    isHighlightActive,
    generateCompletion,
    isGenerating
  } = useAICompletion({
    onCompletion: (text) => console.log("Generated:", text)
  });

  return (
    <div>
      <button onClick={() => highlightText("#3b82f6")}>
        Highlight AI Text
      </button>
      <button onClick={removeHighlight} disabled={!isHighlightActive}>
        Remove Highlight
      </button>
      <button
        onClick={() => generateCompletion("Complete this sentence...")}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "AI Complete"}
      </button>
    </div>
  );
}
```

### useCommandMenu - Slash Commands

```tsx
import { useCommandMenu } from "@repo/editing/hooks";

function CustomCommandMenu() {
  const {
    isOpen,
    query,
    selectedIndex,
    close,
    selectNext,
    selectPrevious,
    executeCommand
  } = useCommandMenu();

  const items = [
    {
      title: "Heading",
      command: ({ editor }) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run()
    }
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div>
      {filteredItems.map((item, index) => (
        <button
          key={item.title}
          onClick={() => executeCommand(item)}
          className={index === selectedIndex ? "selected" : ""}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
```

## Available Exports

### Components

```tsx
// Light (Tailwind-based)
import {
  EditorRoot,
  EditorContent,
  BubbleMenu,
  CommandMenu
} from "@repo/editing/light";

// Mantine
import {
  NotionEditor,
  MinimalEditor,
  FloatingToolbar,
  DocumentManager
} from "@repo/editing/mantine";

// Collaboration
import {
  CollaborativeEditor,
  CollaborationProvider,
  PresenceIndicator,
  CursorOverlay
} from "@repo/editing/collaboration";
```

### Extensions

```tsx
// All extensions
import * as extensions from "@repo/editing/extensions";

// Individual imports (tree-shakeable)
import { AIHighlight } from "@repo/editing/extensions/ai-highlight";
import { SlashCommand } from "@repo/editing/extensions/slash-command";
import { Markdown } from "@repo/editing/extensions/markdown";
import { Mathematics } from "@repo/editing/extensions/mathematics";
import { Twitter } from "@repo/editing/extensions/twitter";
import { YouTubeEnhanced } from "@repo/editing/extensions/youtube-enhanced";
import { ImageResizer } from "@repo/editing/extensions/image-resizer";
import { DragHandle } from "@repo/editing/extensions/drag-handle";
```

### Presets

```tsx
import { createBasicPreset } from "@repo/editing/presets/basic";
import { createRichPreset } from "@repo/editing/presets/rich";
import { createAIPreset } from "@repo/editing/presets/ai";
import { createCollaborationPreset } from "@repo/editing/presets/collaboration";
import { createFullPreset } from "@repo/editing/presets/full";
```

### State & Hooks

```tsx
// Atoms
import {
  editorAtom,
  selectionAtom,
  collaboratorsAtom
} from "@repo/editing/state";

// Selectors
import {
  hasSelectionAtom,
  isCollaboratingAtom
} from "@repo/editing/state/selectors";

// Editor Hooks
import {
  useEditor,
  useEditorInstance,
  useEditorStats
} from "@repo/editing/hooks";

// Persistence Hooks
import { usePersistence } from "@repo/editing/hooks";

// Feature Hooks
import { useCommandMenu, useAICompletion } from "@repo/editing/hooks";

// Collaboration Hooks
import {
  useCollaboration,
  useCollaborator,
  useSyncStatus
} from "@repo/editing/hooks";
```

### Utilities

```tsx
// Export/Import
import {
  exportAsHTML,
  exportAsJSON,
  exportAsMarkdown
} from "@repo/editing/utils";
import {
  importFromHTML,
  importFromJSON,
  importFromMarkdown
} from "@repo/editing/utils";

// Document Store
import {
  createMemoryStore,
  createLocalStorageStore,
  createApiStore
} from "@repo/editing/utils";

// Media Upload
import {
  uploadFile,
  createImageUploadHandler,
  createImagePasteHandler
} from "@repo/editing/utils";
```

### Types

```tsx
import type {
  EditorConfig,
  BaseEditorProps,
  DocumentMetadata,
  Collaborator
} from "@repo/editing/types";
```

## Migration from @repo/editor

The main difference is the removal of the build step. Update your imports:

```diff
- import { NotionEditor } from '@repo/editor/components';
+ import { NotionEditor } from '@repo/editing/mantine/notion';
```

## Deployment Guide

### Architecture Overview

The collaboration features use a **separation of concerns** architecture that's
fully compatible with Vercel:

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Next.js App    │ ←─────→ │  WebSocket Server    │ ←─────→ │  Other Clients  │
│  (Vercel)       │  WSS    │  (External Service)  │  WSS    │  (Browsers)     │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
```

**Key Points:**

- ✅ **Frontend runs on Vercel** - No WebSocket server needed in your Next.js
  app
- ✅ **Collaboration server runs separately** - Use external service or
  self-host
- ✅ **Stateless frontend** - Vercel serverless functions handle everything
  except collaboration
- ✅ **Real-time sync** - WebSocket server manages Yjs document synchronization

### Quick Start: Vercel + PartyKit

The fastest way to deploy with collaboration:

#### 1. Deploy Next.js to Vercel

```bash
# In your Next.js app
vercel deploy
```

#### 2. Deploy Collaboration Server to PartyKit

```bash
# Install PartyKit CLI
npm install -g partykit

# Create collaboration server
mkdir collab-server && cd collab-server
npm init -y
npm install y-partykit yjs
```

```typescript
// src/server.ts
import type { PartyKitServer } from "partykit/server";
import { onConnect } from "y-partykit";

export default {
  onConnect(ws, room) {
    return onConnect(ws, room, {
      persist: true, // Enable persistence
      callback: {
        handler: async (yDoc) => {
          // Optional: Save to database
          console.log(`Document ${room.id} updated`);
        }
      }
    });
  }
} satisfies PartyKitServer;
```

```bash
# Deploy to PartyKit
partykit deploy
```

#### 3. Configure Your App

```typescript
// In your Next.js app
import { CollaborativeEditor } from "@repo/editing/collaboration";

function Editor() {
  return (
    <CollaborativeEditor
      documentId="doc-123"
      serverUrl={process.env.NEXT_PUBLIC_COLLAB_URL} // wss://your-party.partykit.dev
      user={{
        id: "user-456",
        name: "John Doe",
        color: "#10b981"
      }}
    />
  );
}
```

```bash
# .env.local
NEXT_PUBLIC_COLLAB_URL=wss://your-party.partykit.dev
```

### Deployment Options Comparison

| Option                 | Complexity  | Cost               | Persistence        | Scale     | Best For            |
| ---------------------- | ----------- | ------------------ | ------------------ | --------- | ------------------- |
| **PartyKit**           | ⭐ Low      | Free tier + $10/mo | ✅ Built-in        | High      | Production apps     |
| **Railway**            | ⭐⭐ Medium | $5/mo              | ✅ Custom          | Medium    | Self-hosted control |
| **Cloudflare Workers** | ⭐⭐⭐ High | Free tier          | ✅ Durable Objects | Very High | Global scale        |
| **Y-Sweet**            | ⭐ Low      | Free tier          | ✅ Built-in        | High      | Managed service     |
| **Self-hosted**        | ⭐⭐⭐ High | VPS cost           | ✅ Custom          | Custom    | Full control        |

### Option 1: PartyKit (Recommended)

**Pros:** Easiest setup, Vercel-recommended, built-in persistence, great free
tier **Cons:** Vendor lock-in

```bash
# Full setup
npm install y-partykit yjs
partykit init
partykit deploy
```

**Server Code:** See Quick Start above

**Environment:**

```bash
NEXT_PUBLIC_COLLAB_URL=wss://your-party.partykit.dev
```

**Documentation:** https://docs.partykit.io/

### Option 2: Railway

**Pros:** Simple deployment, Docker support, persistent connections, custom
control **Cons:** Requires server management

```bash
# Create y-websocket server
mkdir collab-server && cd collab-server
npm init -y
npm install y-websocket yjs ws
```

```javascript
// server.js
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const wss = new WebSocketServer({ port: process.env.PORT || 1234 });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req, {
    gc: true, // Enable garbage collection
    gcInterval: 10000 // Run GC every 10s
  });
});

console.log(`WebSocket server running on port ${process.env.PORT || 1234}`);
```

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 1234
CMD ["node", "server.js"]
```

```bash
# Deploy to Railway
railway login
railway init
railway up
```

**Environment:**

```bash
NEXT_PUBLIC_COLLAB_URL=wss://your-app.railway.app
```

**Documentation:** https://docs.railway.app/

### Option 3: Cloudflare Workers + Durable Objects

**Pros:** Global scale, WebSocket support, serverless pricing, integrated edge
**Cons:** More complex setup, learning curve

```bash
npm install y-durableobjects yjs
```

```typescript
// src/index.ts
import { YDurableObject } from "y-durableobjects";

export { YDurableObject };

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const room = url.pathname.slice(1);

    const id = env.YROOMS.idFromName(room);
    const stub = env.YROOMS.get(id);

    return stub.fetch(request);
  }
};
```

```toml
# wrangler.toml
name = "collab-server"
main = "src/index.ts"
compatibility_date = "2025-01-03"

[[durable_objects.bindings]]
name = "YROOMS"
class_name = "YDurableObject"
script_name = "collab-server"

[[migrations]]
tag = "v1"
new_classes = ["YDurableObject"]
```

```bash
# Deploy
npx wrangler deploy
```

**Environment:**

```bash
NEXT_PUBLIC_COLLAB_URL=wss://your-worker.workers.dev
```

**Documentation:** https://github.com/aslaker/y-durableobjects

### Option 4: Y-Sweet (Jamsocket)

**Pros:** Managed service, zero-config persistence, WebSocket + HTTP API
**Cons:** External dependency, pricing

```bash
# Install Y-Sweet client
npm install @y-sweet/client
```

```typescript
import { CollaborativeEditor } from "@repo/editing/collaboration";
import { createYjsProvider } from "@y-sweet/client";

function Editor() {
  const provider = createYjsProvider({
    docId: "doc-123",
    url: process.env.NEXT_PUBLIC_YSWEET_URL
  });

  return (
    <CollaborativeEditor
      documentId="doc-123"
      serverUrl={provider.url}
      user={{ id: "user-456", name: "John Doe", color: "#10b981" }}
    />
  );
}
```

**Environment:**

```bash
NEXT_PUBLIC_YSWEET_URL=https://your-app.y-sweet.cloud
```

**Documentation:** https://jamsocket.com/y-sweet

### Option 5: Self-Hosted (VPS)

**Pros:** Full control, no vendor lock-in, custom persistence **Cons:** Server
management, DevOps overhead

Use Railway server code above, deploy to any VPS:

```bash
# On your VPS (Ubuntu example)
sudo apt install nodejs npm
git clone your-collab-server
cd your-collab-server
npm install
npm install -g pm2

# Run with process manager
pm2 start server.js --name collab-server
pm2 startup
pm2 save

# Configure nginx reverse proxy
sudo apt install nginx
```

```nginx
# /etc/nginx/sites-available/collab
server {
  listen 80;
  server_name collab.yourdomain.com;

  location / {
    proxy_pass http://localhost:1234;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
# Enable site and restart nginx
sudo ln -s /etc/nginx/sites-available/collab /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Get SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d collab.yourdomain.com
```

**Environment:**

```bash
NEXT_PUBLIC_COLLAB_URL=wss://collab.yourdomain.com
```

### Alternative Approaches (Future)

#### HTTP Polling (No WebSocket)

For environments that can't use WebSockets, HTTP polling is an alternative:

```typescript
// Not yet implemented - future consideration
import { createPollingProvider } from "@repo/editing/providers/polling";

const provider = createPollingProvider({
  documentId: "doc-123",
  pollInterval: 2000, // 2 seconds
  apiUrl: "/api/collab"
});
```

**Trade-offs:**

- ✅ Serverless-compatible
- ✅ Works everywhere
- ❌ Higher latency (2-5s delays)
- ❌ More server requests

#### Peer-to-Peer WebRTC

For collaborative editing without a server:

```typescript
// Not yet implemented - future consideration
import { createWebRTCProvider } from "@repo/editing/providers/webrtc";

const provider = createWebRTCProvider({
  documentId: "doc-123",
  signaling: "/api/signaling", // Serverless signaling
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});
```

**Trade-offs:**

- ✅ No WebSocket server needed
- ✅ Low latency
- ❌ Requires all peers online
- ❌ Complex NAT traversal

#### Local-Only Persistence

For offline-first apps without collaboration:

```typescript
import { CollaborationProvider } from "@repo/editing/collaboration";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

function Editor() {
  const ydoc = new Y.Doc();
  const persistence = new IndexeddbPersistence("doc-123", ydoc);

  return (
    <CollaborationProvider ydoc={ydoc}>
      <EditorContent />
    </CollaborationProvider>
  );
}
```

**Trade-offs:**

- ✅ No server needed
- ✅ Offline support
- ❌ No real-time collaboration
- ❌ Browser storage limits

### Environment Configuration

Create `.env.local` for development:

```bash
# Collaboration server URL
NEXT_PUBLIC_COLLAB_URL=wss://your-collab-server.com

# Optional: Collaboration server API key (if using authentication)
NEXT_PUBLIC_COLLAB_API_KEY=your-api-key

# Optional: Enable presence features
NEXT_PUBLIC_ENABLE_PRESENCE=true
```

For production, set these in your Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_COLLAB_URL`
3. Add any authentication keys if needed
4. Redeploy your app

### Testing Collaboration Locally

**Default Behavior**: The collaboration components **automatically default to
`ws://localhost:1234`** in development when no `serverUrl` is provided. This
means you can start collaborating immediately by running a local WebSocket
server.

#### Quick Start (Recommended)

```bash
# Terminal 1: Start local y-websocket server (defaults to port 1234)
npx y-websocket-server

# Terminal 2: Start your Next.js app
pnpm dev
```

No environment variables needed! The `CollaborationProvider` will automatically
connect to `ws://localhost:1234`.

#### Option A: Override with Environment Variable

```bash
# .env.local
NEXT_PUBLIC_COLLAB_URL=wss://your-dev-party.partykit.dev
```

#### Option B: Override with Prop

```tsx
<CollaborativeEditor
  documentId="doc-123"
  serverUrl="wss://custom-server.com" // Overrides default
  user={{ id: "1", name: "John", color: "#10b981" }}
/>
```

**Priority Order**:

1. `serverUrl` prop (highest priority)
2. `COLLABORATION_WS_URL` environment variable
3. `ws://localhost:1234` (default fallback)

#### Option C: Use ngrok for Local Testing

```bash
# Terminal 1: Start local server
npx y-websocket-server

# Terminal 2: Expose with ngrok
ngrok http 1234

# Terminal 3: Start Next.js app
pnpm dev
```

```bash
# .env.local
NEXT_PUBLIC_COLLAB_URL=wss://your-tunnel.ngrok.io
```

### Troubleshooting

**WebSocket connection fails:**

- Check `NEXT_PUBLIC_COLLAB_URL` includes `wss://` (not `https://`)
- Verify WebSocket server is running and accessible
- Check browser console for CORS errors

**Changes not syncing:**

- Verify all clients use the same `documentId`
- Check network tab for WebSocket messages
- Ensure WebSocket server has persistence enabled

**High latency:**

- Use a WebSocket server closer to your users
- Consider Cloudflare Workers for global distribution
- Check for rate limiting on your WebSocket server

**Vercel deployment issues:**

- Never try to run WebSocket server in Next.js API routes
- Use external WebSocket service (see options above)
- Ensure `NEXT_PUBLIC_COLLAB_URL` is set in Vercel environment variables

## Development Status

- ✅ Phase 1: Foundation - Package structure, types, config
- ✅ Phase 2: Core Extensions - 8 custom TipTap v3 extensions
- ✅ Phase 3: State & Presets - Jotai atoms + 5 editor presets
- ✅ Phase 4: Components - Light (Tailwind) + Mantine UI
- ✅ Phase 5: Collaboration - Yjs + WebSocket integration
- ✅ Phase 6: Server & Utils - Export/Import/Media utilities
- ✅ Phase 7: Testing - Vitest config + example tests
- ✅ Phase 8: Documentation - README + migration guides

**Status: Production Ready** 🎉

## License

Private - Internal use only
