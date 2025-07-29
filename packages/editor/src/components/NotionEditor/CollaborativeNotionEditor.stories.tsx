import type { Meta, StoryObj } from '@storybook/react';
import { CollaborativeNotionEditor } from './CollaborativeNotionEditor';

const meta: Meta<typeof CollaborativeNotionEditor> = {
  title: 'Editor/CollaborativeNotionEditor',
  component: CollaborativeNotionEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# CollaborativeNotionEditor

A **real-time collaborative** Notion-style editor built with Tiptap v3 and Yjs, featuring:

- 🔄 **Real-time Collaboration** - Live editing with multiple users via WebSocket/Y.js
- 👥 **Live Cursors** - See other users' cursors and selections in real-time
- 🎯 **Presence Indicators** - Know who's online and actively editing
- ⌨️ **Typing Indicators** - See when collaborators are typing in real-time
- 🔗 **11+ Slash Commands** - Create headings, lists, tables, code blocks, and more
- 🎨 **Floating Toolbar** - Rich text formatting with colors and highlights  
- 🔄 **Drag Handles** - Reorder blocks with visual feedback
- ✨ **Emoji Support** - Type ':' followed by emoji names
- 👥 **Mentions** - Type '@' to mention collaborators
- 📊 **Tables** - Resizable tables with headers and formatting
- 💻 **Code Blocks** - Syntax highlighting with 180+ languages
- ♿ **Accessibility** - Full ARIA support and keyboard navigation
- 🛡️ **Error Boundaries** - Graceful error handling and recovery
- 💾 **Offline Support** - IndexedDB persistence with sync when reconnected

## Usage

\`\`\`tsx
import { CollaborativeNotionEditor } from '@repo/editor/components';

<CollaborativeNotionEditor 
  documentId="my-document"
  userId="user-123"
  userName="John Doe"
  userColor="#3B82F6"
  websocketUrl="ws://localhost:1234"
  placeholder="Start collaborating..."
  enableEmoji={true}
  enableMentions={true}
  users={collaborators}
/>
\`\`\`
        `,
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  argTypes: {
    documentId: {
      control: 'text',
      description: 'Unique document identifier for collaboration',
      table: {
        type: { summary: 'string' },
      },
    },
    userId: {
      control: 'text',
      description: 'Unique user identifier',
      table: {
        type: { summary: 'string' },
      },
    },
    userName: {
      control: 'text',
      description: 'Display name for the current user',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Anonymous User"' },
      },
    },
    userColor: {
      control: 'color',
      description: 'Color for user cursor and presence',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"#3B82F6"' },
      },
    },
    websocketUrl: {
      control: 'text',
      description: 'WebSocket URL for real-time collaboration',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"ws://localhost:1234"' },
      },
    },
    enablePersistence: {
      control: 'boolean',
      description: 'Enable IndexedDB persistence for offline support',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enablePresence: {
      control: 'boolean',
      description: 'Show user presence indicators',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableCursors: {
      control: 'boolean',
      description: 'Show live cursors from other users',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    useMockProvider: {
      control: 'boolean',
      description: 'Use mock provider for development/testing',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    enableEmoji: {
      control: 'boolean',
      description: 'Enable emoji picker and :emoji: syntax',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableMentions: {
      control: 'boolean',
      description: 'Enable @user mentions with autocomplete',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showTypingIndicators: {
      control: 'boolean',
      description: 'Show typing indicators for collaborators',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    typingIndicatorPosition: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'inline'],
      description: 'Position of typing indicators',
      table: {
        type: { summary: "'top' | 'bottom' | 'inline'" },
        defaultValue: { summary: "'bottom'" },
      },
    },
  },
} satisfies Meta<typeof CollaborativeNotionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// TYPING INDICATORS DEMO
// =============================================================================

export const TypingIndicatorsDemo: Story = {
  args: {
    documentId: 'typing-demo-doc',
    userId: 'user-demo',
    userName: 'Demo User',
    userColor: '#3B82F6',
    placeholder: 'Start typing to see typing indicators in action...',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 150,
    enableEmoji: true,
    enableMentions: true,
    showTypingIndicators: true,
    typingIndicatorPosition: 'bottom',
    enablePersistence: true,
    enablePresence: true,
    enableCursors: true,
    users: [
      { id: 'user-demo', name: 'Demo User', email: 'demo@example.com' },
      { id: 'user-sarah', name: 'Sarah Chen', email: 'sarah@example.com' },
      { id: 'user-mike', name: 'Mike Rodriguez', email: 'mike@example.com' },
      { id: 'user-emma', name: 'Emma Thompson', email: 'emma@example.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
**Typing Indicators Features:**

⌨️ **Real-Time Typing** - See when collaborators start and stop typing
📀 **Smart Aggregation** - Multiple users shown with intelligent grouping
🎨 **Visual Feedback** - Animated dots and user avatars with status indicators
🔄 **Auto-Timeout** - Typing indicators disappear after 2 seconds of inactivity
📱 **Responsive Design** - Compact mode for smaller screens

**Try It:**
- Start typing in the editor to trigger your typing indicator
- Multiple typing indicators are smartly grouped
- User avatars show green pulse when typing
- Different positions: bottom (default), top, or inline in header
        `,
      },
    },
  },
};

export const TypingIndicatorsInline: Story = {
  args: {
    documentId: 'typing-inline-doc',
    userId: 'user-inline',
    userName: 'Inline User',
    userColor: '#10B981',
    placeholder: 'Typing indicators shown inline in the header...',
    useMockProvider: true,
    showTypingIndicators: true,
    typingIndicatorPosition: 'inline',
    users: [
      { id: 'user-inline', name: 'Inline User', email: 'inline@example.com' },
      { id: 'user-compact', name: 'Compact View', email: 'compact@example.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates compact typing indicators integrated into the collaboration header.',
      },
    },
  },
};

// =============================================================================
// BASIC COLLABORATIVE STORIES
// =============================================================================

export const Default: Story = {
  args: {
    documentId: 'demo-document-1',
    userId: 'user-demo-1',
    userName: 'Demo User',
    userColor: '#3B82F6',
    placeholder: "Start collaborating... Type '/' for commands, ':' for emojis, '@' for mentions",
    useMockProvider: true,
    enableEmoji: true,
    enableMentions: true,
    enableImageUpload: true,
    showTypingIndicators: true,
    typingIndicatorPosition: 'bottom',
    enablePersistence: true,
    enablePresence: true,
    enableCursors: true,
    users: [
      { id: 'user-demo-1', name: 'Demo User', email: 'demo@example.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
    ],
  },
};

export const MultiUser: Story = {
  args: {
    documentId: 'multi-user-doc',
    userId: 'user-alice',
    userName: 'Alice Wilson',
    userColor: '#10B981',
    placeholder: 'Collaborative editing with multiple users...',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 100,
    users: [
      { id: 'user-alice', name: 'Alice Wilson', email: 'alice@company.com' },
      { id: 'user-bob', name: 'Bob Johnson', email: 'bob@company.com' },
      { id: 'user-charlie', name: 'Charlie Brown', email: 'charlie@company.com' },
      { id: 'user-diana', name: 'Diana Prince', email: 'diana@company.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates multi-user collaboration with simulated network latency.',
      },
    },
  },
};

export const OfflineCapable: Story = {
  args: {
    documentId: 'offline-document',
    userId: 'user-offline',
    userName: 'Offline User',
    userColor: '#F59E0B',
    placeholder: 'Works offline with IndexedDB persistence...',
    useMockProvider: true,
    enablePersistence: true,
    enablePresence: false,
    enableCursors: false,
    simulateDrops: true,
    dropRate: 0.3, // Simulate poor connection
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor with offline capabilities and connection simulation for testing.',
      },
    },
  },
};

// =============================================================================
// DEVELOPMENT STORIES
// =============================================================================

export const DevelopmentMode: Story = {
  args: {
    documentId: 'dev-document',
    userId: 'developer-1',
    userName: 'Developer',
    userColor: '#8B5CF6',
    placeholder: 'Development mode with mock provider...',
    useMockProvider: true,
    mockProviderType: 'broadcast',
    simulateLatency: false,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
    users: [
      { id: 'developer-1', name: 'Developer', email: 'dev@localhost' },
      { id: 'tester-1', name: 'Tester', email: 'test@localhost' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Development-friendly setup with broadcast provider and minimal latency.',
      },
    },
  },
};

export const MinimalCollaboration: Story = {
  args: {
    documentId: 'minimal-collab',
    userId: 'user-minimal',
    userName: 'Minimal User',
    userColor: '#6B7280',
    placeholder: 'Minimal collaborative setup...',
    useMockProvider: true,
    enablePersistence: false,
    enablePresence: false,
    enableCursors: false,
    enableEmoji: false,
    enableMentions: false,
    showFloatingToolbar: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal collaborative editor with only basic sync features enabled.',
      },
    },
  },
};

// =============================================================================
// COMPREHENSIVE DEMO
// =============================================================================

export const FullFeatured: Story = {
  args: {
    documentId: 'full-featured-demo',
    userId: 'user-full',
    userName: 'Full Feature User',
    userColor: '#EF4444',
    placeholder: 'Experience all collaborative features...',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 50,
    enablePersistence: true,
    enablePresence: true,
    enableCursors: true,
    enableEmoji: true,
    enableMentions: true,
    enableImageUpload: true,
    showFloatingToolbar: true,
    maxWidth: '800px',
    users: [
      { id: 'user-full', name: 'Full Feature User', email: 'full@demo.com' },
      { id: 'designer', name: 'UI Designer', email: 'designer@demo.com' },
      { id: 'developer', name: 'Developer', email: 'dev@demo.com' },
      { id: 'manager', name: 'Project Manager', email: 'pm@demo.com' },
      { id: 'writer', name: 'Content Writer', email: 'writer@demo.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete collaborative NotionEditor with all features enabled for comprehensive testing.',
      },
    },
    layout: 'fullscreen',
  },
};

// =============================================================================
// IMAGE UPLOAD DEMO
// =============================================================================

export const ImageUploadDemo: Story = {
  args: {
    documentId: 'image-upload-demo',
    userId: 'user-image-demo',
    userName: 'Image Demo User',
    userColor: '#10B981',
    placeholder: 'Try uploading images by drag & drop, paste, or using the /image command...',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 100,
    enableEmoji: true,
    enableMentions: true,
    enableImageUpload: true,
    imageUploadConfig: {
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: 'image/*',
      useStoragePackage: false, // Use mock handler for demo
    },
    showFloatingToolbar: true,
    showTypingIndicators: true,
    users: [
      { id: 'user-image-demo', name: 'Image Demo User', email: 'image@demo.com' },
      { id: 'photographer', name: 'Pro Photographer', email: 'photo@demo.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
**Image Upload Features:**

📸 **Drag & Drop** - Drop images directly into the editor
📋 **Paste from Clipboard** - Paste images copied from other applications  
🔄 **Progress Indicators** - Real-time upload progress with cancel support
❌ **Error Handling** - File size and type validation with user-friendly errors
🏞️ **Image Display** - Automatically displays uploaded images with delete option
⚙️ **Configurable** - Customizable file size limits, accepted types, and upload handlers

**Try It:**
- Drag an image file from your computer into the editor
- Copy an image and paste it (Cmd+V / Ctrl+V)
- Type '/image' to see the slash command option
- Try uploading files that exceed the 5MB limit to see error handling
        `,
      },
    },
  },
};
