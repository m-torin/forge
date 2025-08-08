import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { NotionEditor } from './NotionEditor';

// Mock function for stories
const mockFn = () => () => {};

const meta: Meta<typeof NotionEditor> = {
  title: 'Editor/NotionEditor',
  component: NotionEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# NotionEditor

A comprehensive **Notion-style block editor** built with Tiptap v3, featuring:

- 🔗 **11+ Slash Commands** - Create headings, lists, tables, code blocks, and more
- 🎨 **Floating Toolbar** - Rich text formatting with colors and highlights  
- 🔄 **Drag Handles** - Reorder blocks with visual feedback
- ✅ **Task Lists** - Interactive checkboxes for productivity
- 📊 **Tables** - Resizable tables with headers and formatting
- 💻 **Code Blocks** - Syntax highlighting with 180+ languages
- ♿ **Accessibility** - Full ARIA support and keyboard navigation
- 🛡️ **Error Boundaries** - Graceful error handling and recovery

## Usage

\`\`\`tsx
import { NotionEditor } from '@repo/editor/components';

<NotionEditor 
  placeholder="Type '/' for commands..."
  onChange={(html) => setContent(html)}
  showFloatingToolbar={true}
  showDragHandles={true}
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
    content: {
      control: 'text',
      description: 'Initial HTML content for the editor',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '""' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when editor is empty',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Type \'/\' for commands..."' },
      },
    },
    className: {
      control: 'text',
      description: 'CSS class name for custom styling',
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      action: 'content-changed',
      description: 'Callback fired when content changes',
      table: {
        type: { summary: '(html: string) => void' },
      },
    },
    onUpdate: {
      action: 'editor-updated',
      description: 'Callback fired when editor updates',
      table: {
        type: { summary: '(editor: Editor) => void' },
      },
    },
    editable: {
      control: 'boolean',
      description: 'Whether the editor is editable',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showDragHandles: {
      control: 'boolean',
      description: 'Show drag handles for blocks',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showFloatingToolbar: {
      control: 'boolean',
      description: 'Show floating toolbar on text selection',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showContextMenu: {
      control: 'boolean',
      description: 'Show right-click context menu',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableLinkPreviews: {
      control: 'boolean',
      description: 'Enable hover link previews',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableMobileOptimizations: {
      control: 'boolean',
      description: 'Enable mobile-specific UI optimizations',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of the editor content',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"100%"' },
      },
    },
  },
} satisfies Meta<typeof NotionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// BASIC STORIES
// =============================================================================

export const Default: Story = {
  args: {
    placeholder: "Type '/' for commands, ':' for emojis, '@' for mentions...",
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableEmoji: true,
    enableMentions: true,
  },
};

export const WithRichContent: Story = {
  args: {
    content: `
      <h1>🎯 Notion-Style Editor Showcase</h1>
      <p>This editor demonstrates <strong>powerful features</strong> and <em>rich formatting</em> capabilities.</p>
      
      <h2>✨ Key Features</h2>
      <ul>
        <li><strong>Slash Commands</strong> - Type / to see all available blocks</li>
        <li><strong>Floating Toolbar</strong> - Select text to see formatting options</li>
        <li><strong>Drag Handles</strong> - Hover over blocks to see drag handles</li>
        <li><strong>Rich Formatting</strong> - Bold, italic, underline, colors, and more</li>
      </ul>

      <h3>🔗 Interactive Elements</h3>
      <blockquote>
        <p>This is a quote block. Perfect for highlighting important information and quotes.</p>
      </blockquote>

      <pre><code>// Code blocks with syntax highlighting
function createNotionEditor() {
  return new Editor({
    extensions: [StarterKit, SlashCommands, FloatingToolbar],
    content: 'Start building amazing content...'
  });
}</code></pre>

      <h3>✅ Task Management</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Create comprehensive editor ✓</li>
        <li data-type="taskItem" data-checked="false">Add collaboration features</li>
        <li data-type="taskItem" data-checked="false">Implement real-time sync</li>
      </ul>

      <p>Try selecting text to see the <mark style="background-color: #fef08a">floating toolbar</mark> or type <code>/</code> to see <span style="color: #e53e3e">slash commands</span>!</p>
      
      <h3>🎉 New Features</h3>
      <p>Type <code>:</code> followed by an emoji name to insert emojis like :smile: or :rocket:</p>
      <p>Type <code>@</code> to mention someone: <span class="notion-mention">@John Doe</span></p>
    `,
    placeholder: "Start writing, type '/' for commands, ':' for emojis, '@' for mentions...",
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of the editor with rich content including headings, lists, quotes, code blocks, and task lists.',
      },
    },
  },
};

export const NewFeaturesDemo: Story = {
  args: {
    content: `
      <h1>🚀 NotionEditor v3 Features</h1>
      <p>This demo showcases the new Phase 1 features added to our NotionEditor!</p>
      
      <h2>✨ Emoji Support</h2>
      <p>Type <code>:</code> followed by an emoji name:</p>
      <ul>
        <li>:smile: becomes 😊</li>
        <li>:rocket: becomes 🚀</li>
        <li>:heart: becomes ❤️</li>
        <li>:thumbs_up: becomes 👍</li>
      </ul>
      
      <h2>👥 Mentions</h2>
      <p>Type <code>@</code> to mention team members:</p>
      <p>Hey <span class="notion-mention">@John Doe</span>, can you review this document?</p>
      <p>Cc: <span class="notion-mention">@Jane Smith</span> and <span class="notion-mention">@Bob Johnson</span></p>
      
      <h2>🆔 Unique Block IDs</h2>
      <p>Every block now has unique IDs for better tracking and collaboration!</p>
      
      <h2>📝 Trailing Node</h2>
      <p>The editor ensures there's always a paragraph at the end for continuous writing.</p>
      
      <blockquote>
        <p><strong>Try it:</strong> Type <code>:</code> for emojis or <code>@</code> for mentions anywhere in this editor!</p>
      </blockquote>
    `,
    placeholder: "Try typing ':' for emojis or '@' for mentions...",
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableEmoji: true,
    enableMentions: true,
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      { id: '4', name: 'Alice Wilson', email: 'alice@example.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the new Phase 1 features: Emoji extension, Mentions, Unique IDs, and Trailing Node.',
      },
    },
  },
};

// =============================================================================
// CONFIGURATION STORIES
// =============================================================================

export const ReadOnlyMode: Story = {
  args: {
    content: `
      <h1>Read-Only Notion Editor</h1>
      <p>This editor is in <strong>read-only mode</strong>. You can view the content but cannot edit it.</p>
      <blockquote>
        <p>"The best way to predict the future is to create it." - Peter Drucker</p>
      </blockquote>
      <ul>
        <li>No editing capabilities</li>
        <li>No slash commands</li>
        <li>No floating toolbar</li>
        <li>Perfect for content display</li>
      </ul>
    `,
    editable: false,
    showDragHandles: false,
    showFloatingToolbar: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor in read-only mode with all interactive features disabled.',
      },
    },
  },
};

export const MinimalConfiguration: Story = {
  args: {
    content: '<p>Minimal editor without drag handles or floating toolbar.</p>',
    showDragHandles: false,
    showFloatingToolbar: false,
    placeholder: 'Minimal setup...',
    onChange: mockFn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal editor configuration with only essential features enabled.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    content:
      '<h2>Custom Styled Editor</h2><p>This editor demonstrates custom styling capabilities.</p>',
    className: 'custom-notion-editor',
    maxWidth: '600px',
    placeholder: 'Custom styled editor...',
    onChange: mockFn(),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          minHeight: '400px',
        }}
      >
        <style>{`
          .custom-notion-editor {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .custom-notion-editor h2 {
            color: #6f42c1;
            border-bottom: 3px solid #6f42c1;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
          }
          .custom-notion-editor .notion-editor-content {
            font-family: 'Georgia', serif;
            line-height: 1.8;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates custom styling capabilities with themed appearance and constrained width.',
      },
    },
    backgrounds: {
      default: 'dark',
    },
  },
};

// =============================================================================
// MEDIA UPLOAD STORIES (Phase 5)
// =============================================================================

export const MediaUploadDemo: Story = {
  args: {
    content: `
      <h1>📸 Media Upload Demo</h1>
      <p>This demo showcases the <strong>Phase 5 media upload capabilities</strong> with support for images, videos, and audio files!</p>
      
      <h2>🖼️ Image Upload</h2>
      <p>Upload and display images with drag & drop support:</p>
      <p><em>Try dragging an image file into the editor below this text or click the upload button in the toolbar.</em></p>
      
      <h2>🎬 Video Upload</h2>
      <p>Upload videos with HTML5 player controls:</p>
      <p><em>Supported formats: MP4, WebM, MOV (up to 100MB)</em></p>
      
      <h2>🎵 Audio Upload</h2>
      <p>Upload audio files with custom player interface:</p>
      <p><em>Supported formats: MP3, WAV, OGG, M4A (up to 50MB)</em></p>
      
      <h2>✨ Features</h2>
      <ul>
        <li><strong>Drag & Drop</strong> - Drag media files directly into the editor</li>
        <li><strong>Paste Support</strong> - Paste images from clipboard</li>
        <li><strong>Progress Indicators</strong> - Real-time upload progress</li>
        <li><strong>Error Handling</strong> - Graceful error messages and retry options</li>
        <li><strong>Size Limits</strong> - Configurable per media type</li>
        <li><strong>Type Validation</strong> - Only accept specified file types</li>
      </ul>
      
      <blockquote>
        <p><strong>Try it:</strong> Use the media upload button in the floating toolbar or drag media files directly into this editor!</p>
      </blockquote>
    `,
    placeholder: 'Try dragging media files here or use the toolbar to upload...',
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableMediaUpload: true,
    mediaUploadConfig: {
      accept: 'image/*,video/*,audio/*',
      maxSizes: {
        image: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024, // 100MB
        audio: 50 * 1024 * 1024, // 50MB
      },
      useStoragePackage: false, // Use mock for demo
      onError: (error: Error) => {
        console.error('Media upload error:', error);
        alert(`Upload failed: ${error.message}`);
      },
      onSuccess: (url: string, mediaType: string) => {
        console.log(`${mediaType} uploaded successfully:`, url);
        alert(`${mediaType} uploaded successfully!`);
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Phase 5 Media Upload Demo**

This story demonstrates the comprehensive media upload system supporting images, videos, and audio files.

**Features:**
- Unified MediaUploadNode supporting all media types
- Drag & drop file handling
- Real-time upload progress
- Error handling with retry options
- Media type-specific size limits
- Custom upload handlers

**Try it:**
1. Click the media upload button in the floating toolbar
2. Drag media files directly into the editor
3. Paste images from your clipboard
4. Watch the upload progress and preview
        `,
      },
    },
  },
};

export const VideoUploadShowcase: Story = {
  args: {
    content: `
      <h1>🎬 Video Upload Showcase</h1>
      <p>Dedicated demo for video upload capabilities with HTML5 video player integration.</p>
      
      <h2>Supported Video Formats</h2>
      <ul>
        <li><strong>MP4</strong> - Most compatible format</li>
        <li><strong>WebM</strong> - Web-optimized format</li>
        <li><strong>MOV</strong> - Apple QuickTime format</li>
        <li><strong>AVI</strong> - Windows Media format</li>
      </ul>
      
      <h2>Video Features</h2>
      <ul>
        <li>HTML5 video player with native controls</li>
        <li>Responsive video sizing (max 500px height)</li>
        <li>Hover-to-show delete button</li>
        <li>100MB maximum file size</li>
        <li>Upload progress indication</li>
      </ul>
      
      <p><em>Try uploading a video file below to see the video player in action!</em></p>
    `,
    placeholder: 'Upload a video file to see the video player...',
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableMediaUpload: true,
    mediaUploadConfig: {
      accept: 'video/*',
      maxSizes: {
        video: 100 * 1024 * 1024, // 100MB
      },
      useStoragePackage: false,
      onSuccess: (url: string, mediaType: string) => {
        console.log(`Video uploaded: ${url}`);
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Focused demo for video upload functionality with HTML5 video player integration.',
      },
    },
  },
};

export const AudioUploadShowcase: Story = {
  args: {
    content: `
      <h1>🎵 Audio Upload Showcase</h1>
      <p>Dedicated demo for audio upload capabilities with custom audio player interface.</p>
      
      <h2>Supported Audio Formats</h2>
      <ul>
        <li><strong>MP3</strong> - Most common audio format</li>
        <li><strong>WAV</strong> - Uncompressed audio</li>
        <li><strong>OGG</strong> - Open source format</li>
        <li><strong>M4A</strong> - Apple audio format</li>
        <li><strong>FLAC</strong> - Lossless compression</li>
      </ul>
      
      <h2>Audio Player Features</h2>
      <ul>
        <li>Custom play/pause button with icons</li>
        <li>HTML5 audio controls for scrubbing</li>
        <li>Compact audio card design</li>
        <li>50MB maximum file size</li>
        <li>Visual feedback for playing state</li>
      </ul>
      
      <p><em>Try uploading an audio file below to see the custom audio player!</em></p>
    `,
    placeholder: 'Upload an audio file to see the custom player...',
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableMediaUpload: true,
    mediaUploadConfig: {
      accept: 'audio/*',
      maxSizes: {
        audio: 50 * 1024 * 1024, // 50MB
      },
      useStoragePackage: false,
      onSuccess: (url: string, mediaType: string) => {
        console.log(`Audio uploaded: ${url}`);
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Focused demo for audio upload functionality with custom audio player interface.',
      },
    },
  },
};

export const MediaUploadErrorHandling: Story = {
  args: {
    content: `
      <h1>⚠️ Media Upload Error Handling</h1>
      <p>This demo shows how the editor handles various error scenarios during media upload.</p>
      
      <h2>Error Scenarios</h2>
      <ul>
        <li><strong>File Too Large</strong> - Exceeds size limits</li>
        <li><strong>Invalid File Type</strong> - Unsupported format</li>
        <li><strong>Network Errors</strong> - Upload failures</li>
        <li><strong>Cancelled Uploads</strong> - User cancellation</li>
      </ul>
      
      <h2>Error Handling Features</h2>
      <ul>
        <li>Clear error messages with specific details</li>
        <li>Retry button for failed uploads</li>
        <li>Progress cancellation</li>
        <li>Graceful fallbacks</li>
      </ul>
      
      <p><em>Try uploading files that exceed the size limits or invalid formats to see error handling in action.</em></p>
    `,
    placeholder: 'Try uploading invalid files to see error handling...',
    onChange: mockFn(),
    onUpdate: mockFn(),
    enableMediaUpload: true,
    mediaUploadConfig: {
      accept: 'image/*,video/*,audio/*',
      maxSizes: {
        image: 1024 * 1024, // Very small limit for demo (1MB)
        video: 5 * 1024 * 1024, // 5MB
        audio: 2 * 1024 * 1024, // 2MB
      },
      useStoragePackage: false,
      onError: (error: Error) => {
        console.error('Demo error:', error);
        // Errors will be shown in the editor UI
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Error Handling Demo**

This story uses very small file size limits to demonstrate error handling:
- Images: 1MB limit
- Videos: 5MB limit  
- Audio: 2MB limit

Try uploading larger files to see the error states and retry functionality.
        `,
      },
    },
  },
};

// =============================================================================
// COMPREHENSIVE DEMO STORY
// =============================================================================

// =============================================================================
// PHASE 7: ENHANCED UI COMPONENTS DEMO
// =============================================================================

export const Phase7EnhancedUIDemo: Story = {
  args: {
    content: `
      <h1>🎯 Phase 7: Enhanced UI Components</h1>
      <p>This demo showcases the <strong>Phase 7 enhanced UI components</strong> with official Tiptap-inspired dropdown menus and context menu!</p>
      
      <h2>✨ New Features</h2>
      <ul>
        <li><strong>Enhanced Floating Toolbar</strong> - Now includes dropdown menus for block transformations</li>
        <li><strong>Turn Into Dropdown</strong> - Convert blocks between different types (paragraph, headings, lists, etc.)</li>
        <li><strong>Heading Dropdown</strong> - Quick heading level selection with visual indicators</li>
        <li><strong>List Dropdown</strong> - Switch between bullet, numbered, and task lists</li>
        <li><strong>Right-Click Context Menu</strong> - Complete context menu with cut/copy/paste and formatting options</li>
        <li><strong>Link Previews</strong> - Hover over links to see rich preview cards with metadata</li>
        <li><strong>Enhanced Link Editor</strong> - Professional link editing dialog with URL validation</li>
        <li><strong>Mobile Optimizations</strong> - Touch-friendly UI with gesture support and mobile toolbar</li>
        <li><strong>Official Tiptap Drag Handle</strong> - Replaced custom implementation with official extension</li>
      </ul>
      
      <h2>🔧 How to Use</h2>
      <ol>
        <li><strong>Select text</strong> to see the enhanced floating toolbar with dropdown menus</li>
        <li><strong>Right-click</strong> anywhere to see the context menu with hierarchical options</li>
        <li><strong>Hover over blocks</strong> to see the official Tiptap drag handles</li>
        <li><strong>Use dropdown menus</strong> to quickly transform content between different block types</li>
        <li><strong>Hover over links</strong> to see rich preview cards with page metadata</li>
        <li><strong>Select text and click link button</strong> to use the enhanced link editor</li>
        <li><strong>On mobile devices</strong> - Swipe up or long press to access mobile toolbar</li>
      </ol>
      
      <h3>📝 Try These Actions</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">Select text and use the "Turn Into" dropdown</li>
        <li data-type="taskItem" data-checked="false">Right-click to access the context menu</li>
        <li data-type="taskItem" data-checked="false">Use heading dropdown to change heading levels</li>
        <li data-type="taskItem" data-checked="false">Switch between list types using the list dropdown</li>
        <li data-type="taskItem" data-checked="false">Try drag & drop with the official drag handles</li>
        <li data-type="taskItem" data-checked="false">Hover over links to see previews</li>
        <li data-type="taskItem" data-checked="false">Use the enhanced link editor to add new links</li>
        <li data-type="taskItem" data-checked="false">Test mobile gestures (swipe up for toolbar)</li>
        <li data-type="taskItem" data-checked="false">Try the mobile-optimized color picker</li>
      </ul>
      
      <h3>🔗 Link Preview Demo</h3>
      <p>Try hovering over these links to see the preview functionality:</p>
      <ul>
        <li><a href="https://tiptap.dev">Tiptap Editor Documentation</a> - Official Tiptap docs</li>
        <li><a href="https://github.com/ueberdosis/tiptap">Tiptap GitHub Repository</a> - Source code and issues</li>
        <li><a href="https://notion.so">Notion</a> - The inspiration for this editor</li>
      </ul>
      
      <blockquote>
        <p><strong>Phase 7 Achievement:</strong> Successfully integrated official Tiptap-inspired UI components including dropdown menus, context menu, enhanced floating toolbar, and link previews for a professional editing experience!</p>
      </blockquote>
      
      <pre><code>// Example: Using the enhanced editor
import { NotionEditor } from '@repo/editor/components';

&lt;NotionEditor
  showContextMenu={true}
  showDragHandles={true}
  content="Start with enhanced UI..."
/&gt;</code></pre>
    `,
    placeholder: 'Try the enhanced UI features: select text, right-click, or hover over blocks...',
    onChange: mockFn(),
    onUpdate: mockFn(),
    showContextMenu: true,
    showDragHandles: true,
    enableLinkPreviews: true,
    enableMobileOptimizations: true,
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Phase 7: Enhanced UI Components Demo**

This story showcases the comprehensive Phase 7 UI enhancements:

**Enhanced Floating Toolbar:**
- TurnIntoDropdown for block type conversion
- HeadingDropdownMenu for heading levels
- ListDropdownMenu for list type switching
- All standard formatting options (bold, italic, colors, etc.)

**Right-Click Context Menu:**
- Cut, copy, paste operations
- Block transformation submenu
- Text formatting options
- Link and comment actions
- Keyboard shortcut indicators

**Official Tiptap Integration:**
- Official DragHandle extension
- Tiptap-inspired dropdown patterns
- Proper accessibility support
- Professional visual design

**Try it:**
1. Select any text to see the enhanced toolbar
2. Right-click anywhere for the context menu
3. Hover over blocks to see drag handles
4. Use dropdowns to transform content types
        `,
      },
    },
    layout: 'fullscreen',
  },
};

export const ComprehensiveDemo: Story = {
  args: {
    content: `
      <h1>🚀 Complete NotionEditor Demo</h1>
      <p>Welcome to the most comprehensive demo of our Notion-style editor! This showcase demonstrates every feature and capability.</p>
      
      <h2>🎯 Core Features</h2>
      <ul>
        <li><strong>11+ Slash Commands</strong> - Type <code>/</code> to access blocks</li>
        <li><strong>Rich Text Formatting</strong> - Bold, italic, colors, highlights</li>
        <li><strong>Interactive Elements</strong> - Tables, task lists, code blocks</li>
        <li><strong>Accessibility First</strong> - Full ARIA compliance</li>
        <li><strong>Error Resilient</strong> - Graceful error handling</li>
      </ul>

      <h2>📊 Data Visualization</h2>
      <table>
        <tbody>
          <tr>
            <th><p><strong>Feature</strong></p></th>
            <th><p><strong>Status</strong></p></th>
            <th><p><strong>Coverage</strong></p></th>
          </tr>
          <tr>
            <td><p>Slash Commands</p></td>
            <td><p>✅ Complete</p></td>
            <td><p>100%</p></td>
          </tr>
          <tr>
            <td><p>Floating Toolbar</p></td>
            <td><p>✅ Complete</p></td>
            <td><p>100%</p></td>
          </tr>
          <tr>
            <td><p>Accessibility</p></td>
            <td><p>✅ Complete</p></td>
            <td><p>WCAG 2.1 AA</p></td>
          </tr>
        </tbody>
      </table>

      <h2>💻 Code Examples</h2>
      <pre><code class="language-typescript">// TypeScript Integration
import { NotionEditor } from '@repo/editor/components';

function MyApp() {
  const [content, setContent] = useState('');
  
  return (
    &lt;NotionEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
      showFloatingToolbar={true}
      showDragHandles={true}
    /&gt;
  );
}</code></pre>

      <h2>✅ Project Management</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">✅ Core editor implementation</li>
        <li data-type="taskItem" data-checked="true">✅ Slash command system</li>
        <li data-type="taskItem" data-checked="true">✅ Floating toolbar</li>
        <li data-type="taskItem" data-checked="true">✅ Drag handle system</li>
        <li data-type="taskItem" data-checked="true">✅ Error boundaries</li>
        <li data-type="taskItem" data-checked="true">✅ Accessibility features</li>
        <li data-type="taskItem" data-checked="true">✅ Comprehensive testing</li>
        <li data-type="taskItem" data-checked="false">🔄 Real-time collaboration</li>
        <li data-type="taskItem" data-checked="false">🔄 Plugin ecosystem</li>
        <li data-type="taskItem" data-checked="false">🔄 Mobile optimization</li>
      </ul>

      <blockquote>
        <p><strong>Pro Tip:</strong> Try selecting any text to see the floating toolbar, or type <code>/</code> anywhere to access the slash command menu. Every feature is designed for maximum productivity and accessibility.</p>
      </blockquote>

      <h2>🎨 Rich Content Support</h2>
      <p>The editor supports <mark style="background-color: #fef08a">highlighted text</mark>, <span style="color: #e53e3e">colored text</span>, and <code>inline code</code>. You can create complex documents with nested structures and maintain perfect formatting.</p>

      <hr>

      <p><em>This demo showcases the full capabilities of our NotionEditor. Try interacting with any element to see it in action!</em></p>
    `,
    placeholder: "🎯 Try typing '/' to see all commands...",
    onChange: mockFn(),
    onUpdate: mockFn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Ultimate comprehensive demo showcasing every feature of the NotionEditor.',
      },
    },
    layout: 'fullscreen',
  },
};
