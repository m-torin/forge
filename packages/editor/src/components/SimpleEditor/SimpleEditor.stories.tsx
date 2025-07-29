import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { CollaborativeSimpleEditor } from './CollaborativeSimpleEditor';
import { SimpleEditor } from './SimpleEditor';

// Basic SimpleEditor Meta
const meta: Meta<typeof SimpleEditor> = {
  title: 'Editor/SimpleEditor',
  component: SimpleEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A simple rich text editor built with Tiptap v3. Supports basic formatting, collaboration, and has an optional collaborative mode with real-time features.',
      },
    },
  },
  argTypes: {
    documentId: {
      control: 'text',
      description: 'Unique identifier for the document (used for collaboration)',
      defaultValue: 'simple-editor-doc',
    },
    userId: {
      control: 'text',
      description: 'User identifier for collaboration',
      defaultValue: 'anonymous',
    },
    userName: {
      control: 'text',
      description: 'Display name for the user',
      defaultValue: 'Anonymous User',
    },
    userColor: {
      control: 'color',
      description: 'Color for user cursor/caret in collaboration',
      defaultValue: '#3B82F6',
    },
    userAvatar: {
      control: 'text',
      description: 'URL for user avatar image',
    },
    websocketUrl: {
      control: 'text',
      description: 'WebSocket URL for collaboration server',
      defaultValue: 'ws://localhost:1234',
    },
    enableCollaboration: {
      control: 'boolean',
      description: 'Enable real-time collaboration features',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: 'CSS class name for custom styling',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
      defaultValue: 'Start writing...',
    },
    content: {
      control: 'text',
      description: 'Initial content for the editor',
      defaultValue: '',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic standalone editor story
export const Default: Story = {
  args: {
    placeholder: 'Start writing your story...',
    content: '<p>Welcome to the <strong>Simple Editor</strong>! Try formatting some text.</p>',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Wait for editor to load
    const editor = canvas.getByRole('textbox');
    await expect(editor).toBeInTheDocument();

    // Test basic interaction
    await userEvent.click(editor);
    await userEvent.type(editor, ' This text was added by the story.');
  },
};

// Empty editor story
export const Empty: Story = {
  args: {
    placeholder: 'Start writing...',
    content: '',
  },
};

// Pre-filled with rich content
export const WithRichContent: Story = {
  args: {
    content: `
      <h2>Welcome to Simple Editor</h2>
      <p>This editor supports <strong>bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p>
      <ul>
        <li>Bullet lists work great</li>
        <li>Perfect for organizing content</li>
        <li>Easy to use</li>
      </ul>
      <blockquote>
        <p>Blockquotes are perfect for highlighting important information or quotes.</p>
      </blockquote>
      <p>Try editing this content and using the toolbar buttons!</p>
    `,
    placeholder: 'Start writing...',
  },
};

// Custom styling story
export const CustomStyled: Story = {
  args: {
    className: 'border-2 border-blue-500 rounded-xl shadow-lg',
    placeholder: 'Custom styled editor...',
    content: '<p>This editor has custom styling applied!</p>',
  },
};

// Collaboration enabled (but not connected)
export const WithCollaborationEnabled: Story = {
  args: {
    enableCollaboration: true,
    documentId: 'story-collab-doc',
    userId: 'story-user-1',
    userName: 'Story User',
    userColor: '#10B981',
    placeholder: 'Collaboration enabled editor...',
    content:
      '<p>This editor has collaboration enabled, but requires a WebSocket server to connect.</p>',
  },
};

// Collaborative Editor Stories
const CollaborativeMeta: Meta<typeof CollaborativeSimpleEditor> = {
  title: 'Editor/CollaborativeSimpleEditor',
  component: CollaborativeSimpleEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An enhanced collaborative editor with real-time features, status indicators, and user presence. Built on top of SimpleEditor with Y.js integration.',
      },
    },
  },
  argTypes: {
    documentId: {
      control: 'text',
      description: 'Unique identifier for the document',
      defaultValue: 'collab-editor-doc',
    },
    userId: {
      control: 'text',
      description: 'User identifier',
      defaultValue: 'user-1',
    },
    userName: {
      control: 'text',
      description: 'Display name for the user',
      defaultValue: 'Story User',
    },
    userColor: {
      control: 'color',
      description: 'Color for user cursor/caret',
      defaultValue: '#3B82F6',
    },
    userAvatar: {
      control: 'text',
      description: 'URL for user avatar image',
    },
    websocketUrl: {
      control: 'text',
      description: 'WebSocket URL for collaboration server',
      defaultValue: 'ws://localhost:1234',
    },
    enablePersistence: {
      control: 'boolean',
      description: 'Enable document persistence',
      defaultValue: true,
    },
    enablePresence: {
      control: 'boolean',
      description: 'Enable user presence indicators',
      defaultValue: true,
    },
    enableCursors: {
      control: 'boolean',
      description: 'Enable collaborative cursors',
      defaultValue: true,
    },
    useMockProvider: {
      control: 'boolean',
      description: 'Use mock provider for demo purposes',
      defaultValue: false,
    },
    mockProviderType: {
      control: 'select',
      options: ['websocket', 'indexeddb'],
      description: 'Type of mock provider to use',
      defaultValue: 'websocket',
    },
    simulateLatency: {
      control: 'boolean',
      description: 'Simulate network latency in mock mode',
      defaultValue: true,
    },
    latencyMs: {
      control: 'number',
      description: 'Latency simulation in milliseconds',
      defaultValue: 50,
    },
    simulateDrops: {
      control: 'boolean',
      description: 'Simulate network drops in mock mode',
      defaultValue: false,
    },
    dropRate: {
      control: 'number',
      description: 'Drop rate for simulation (0.0 to 1.0)',
      defaultValue: 0.05,
    },
    className: {
      control: 'text',
      description: 'CSS class name for custom styling',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
      defaultValue: 'Start collaborating...',
    },
  },
};

// Collaborative editor with mock provider
export const CollaborativeDefault: StoryObj<typeof CollaborativeSimpleEditor> = {
  ...CollaborativeMeta,
  args: {
    documentId: 'story-collab-doc',
    userId: 'story-user-1',
    userName: 'Story User',
    userColor: '#10B981',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 100,
    placeholder: 'Start collaborating...',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Wait for collaborative editor to load
    const editor = canvas.getByRole('textbox');
    await expect(editor).toBeInTheDocument();

    // Check for status bar
    const statusBar = canvas.getByText(/Connected|Disconnected/);
    await expect(statusBar).toBeInTheDocument();

    // Test typing
    await userEvent.click(editor);
    await userEvent.type(editor, 'Testing collaborative editing!');
  },
};

// Multiple users simulation (mock)
export const MultipleUsers: StoryObj<typeof CollaborativeSimpleEditor> = {
  ...CollaborativeMeta,
  args: {
    documentId: 'multi-user-doc',
    userId: 'user-1',
    userName: 'Alice',
    userColor: '#EF4444',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 150,
    placeholder: 'Collaborative editing with multiple users...',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the collaborative editor with simulated multiple users. In a real environment, multiple users would see each other's cursors and edits in real-time.",
      },
    },
  },
};

// High latency simulation
export const HighLatency: StoryObj<typeof CollaborativeSimpleEditor> = {
  ...CollaborativeMeta,
  args: {
    documentId: 'high-latency-doc',
    userId: 'user-slow',
    userName: 'Slow Connection User',
    userColor: '#F59E0B',
    useMockProvider: true,
    mockProviderType: 'websocket',
    simulateLatency: true,
    latencyMs: 1000, // 1 second delay
    simulateDrops: true,
    dropRate: 0.1, // 10% drop rate
    placeholder: 'Testing with high latency and drops...',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tests the editor behavior under poor network conditions with high latency and packet drops.',
      },
    },
  },
};

// Disconnected state
export const Disconnected: StoryObj<typeof CollaborativeSimpleEditor> = {
  ...CollaborativeMeta,
  args: {
    documentId: 'disconnected-doc',
    userId: 'user-offline',
    userName: 'Offline User',
    userColor: '#6B7280',
    useMockProvider: false, // This will cause connection to fail
    websocketUrl: 'ws://invalid-url:9999',
    placeholder: 'Editor in disconnected state...',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the editor behaves when collaboration connection fails or is unavailable.',
      },
    },
  },
};
