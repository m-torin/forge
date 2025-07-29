import type { Meta, StoryObj } from '@storybook/react';
import { EmbeddableNotionEditor } from './EmbeddableNotionEditor';

const meta: Meta<typeof EmbeddableNotionEditor> = {
  title: 'Editor/EmbeddableNotionEditor',
  component: EmbeddableNotionEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# EmbeddableNotionEditor

A **lightweight, self-contained** Notion-style editor designed for embedding in external applications, CMSs, or third-party websites.

## Key Features:

- 🪶 **Lightweight** - Minimal dependencies, under 50KB gzipped
- 🎨 **Themeable** - Customizable colors and styling
- 🔧 **Configurable** - Enable/disable features as needed
- 📱 **Responsive** - Works on all screen sizes
- ♿ **Accessible** - Full ARIA support
- 💾 **Auto-save** - Built-in auto-save functionality
- 🎯 **Self-contained** - Includes all necessary CSS

## Perfect For:

- Content Management Systems
- Blog platforms
- Documentation sites
- Form editors
- Comment systems
- Embedded widgets

## Usage

\`\`\`tsx
import { EmbeddableNotionEditor } from '@repo/editor/components';

<EmbeddableNotionEditor
  placeholder="Start writing..."
  onChange={(html, json) => {
    console.log('Content changed:', html);
  }}
  theme={{
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    focusColor: '#3b82f6',
  }}
  features={{
    formatting: true,
    lists: true,
    tables: false,
    codeBlocks: true,
  }}
  autoSave={{
    enabled: true,
    delay: 1000,
    onSave: (content) => {
      console.log('Auto-saving:', content);
    },
  }}
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
      description: 'Initial HTML content of the editor',
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
        defaultValue: { summary: '"Start writing..."' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
      table: {
        type: { summary: 'string' },
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
    maxWidth: {
      control: 'text',
      description: 'Maximum width of editor content',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"100%"' },
      },
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of the editor',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"200px"' },
      },
    },
    showToolbar: {
      control: 'boolean',
      description: 'Whether to show the formatting toolbar',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof EmbeddableNotionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// BASIC EXAMPLES
// =============================================================================

export const Default: Story = {
  args: {
    placeholder: 'Start writing your content...',
    showToolbar: true,
    editable: true,
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic embeddable editor with all default features enabled.',
      },
    },
  },
};

export const WithInitialContent: Story = {
  args: {
    content: `
      <h1>Welcome to the Embeddable Editor</h1>
      <p>This is a <strong>lightweight</strong> and <em>customizable</em> editor that can be embedded anywhere.</p>
      <ul>
        <li>Rich text formatting</li>
        <li>Lists and tables</li>
        <li>Code blocks</li>
        <li>And much more!</li>
      </ul>
      <blockquote>
        <p>Perfect for content management systems, blogs, and documentation.</p>
      </blockquote>
    `,
    placeholder: 'Continue writing...',
    showToolbar: true,
    minHeight: '400px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Editor with pre-populated content demonstrating various formatting options.',
      },
    },
  },
};

// =============================================================================
// THEME CUSTOMIZATION
// =============================================================================

export const DarkTheme: Story = {
  args: {
    placeholder: 'Dark theme editor...',
    theme: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      borderColor: '#374151',
      focusColor: '#60a5fa',
      placeholderColor: '#9ca3af',
    },
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dark theme variant with custom colors.',
      },
    },
  },
};

export const GreenTheme: Story = {
  args: {
    placeholder: 'Nature-inspired editor...',
    theme: {
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      borderColor: '#bbf7d0',
      focusColor: '#16a34a',
      placeholderColor: '#6b7280',
    },
    content: '<h2>🌱 Green Theme</h2><p>A nature-inspired color scheme for your content.</p>',
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom green theme perfect for environmental or nature-focused content.',
      },
    },
  },
};

// =============================================================================
// FEATURE CONFIGURATION
// =============================================================================

export const MinimalEditor: Story = {
  args: {
    placeholder: 'Simple text editor...',
    showToolbar: false,
    features: {
      formatting: true,
      lists: false,
      tables: false,
      codeBlocks: false,
      links: false,
      tasks: false,
      colors: false,
    },
    minHeight: '200px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal editor with only basic formatting features.',
      },
    },
  },
};

export const BlogEditor: Story = {
  args: {
    placeholder: 'Write your blog post...',
    features: {
      formatting: true,
      lists: true,
      tables: false,
      codeBlocks: true,
      links: true,
      tasks: false,
      colors: true,
    },
    content: `
      <h1>My Blog Post Title</h1>
      <p>This is the perfect configuration for blog writing with <strong>formatting</strong>, <mark>highlights</mark>, and <a href="#">links</a>.</p>
      <ul>
        <li>Support for lists</li>
        <li>Code blocks for technical content</li>
        <li>No tables or tasks to keep it clean</li>
      </ul>
    `,
    minHeight: '400px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Configuration optimized for blog writing with relevant features.',
      },
    },
  },
};

export const DocumentationEditor: Story = {
  args: {
    placeholder: 'Write documentation...',
    features: {
      formatting: true,
      lists: true,
      tables: true,
      codeBlocks: true,
      links: true,
      tasks: true,
      colors: false,
    },
    content: `
      <h1>API Documentation</h1>
      <p>Complete documentation editor with all features needed for technical writing.</p>
      
      <h2>Features</h2>
      <ul>
        <li>Task lists for checklists</li>
        <li>Tables for structured data</li>
        <li>Code blocks for examples</li>
      </ul>
      
      <h3>Task List Example</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Set up environment</li>
        <li data-type="taskItem" data-checked="false">Write documentation</li>
        <li data-type="taskItem" data-checked="false">Review and publish</li>
      </ul>
    `,
    minHeight: '500px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured editor perfect for technical documentation.',
      },
    },
  },
};

// =============================================================================
// AUTO-SAVE DEMO
// =============================================================================

export const AutoSaveDemo: Story = {
  args: {
    placeholder: 'Start typing to see auto-save in action...',
    autoSave: {
      enabled: true,
      delay: 2000,
      onSave: (content: string) => {
        console.log('Auto-saved content:', content);
        // In a real app, this would save to your backend
      },
    },
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: `
Auto-save functionality demo. Content is automatically saved 2 seconds after typing stops.

**Try it:**
- Start typing in the editor
- Stop typing and wait 2 seconds
- Check the browser console to see the auto-save in action

In a real application, the \`onSave\` callback would send the content to your backend API.
        `,
      },
    },
  },
};

// =============================================================================
// RESPONSIVE DEMO
// =============================================================================

export const ResponsiveDemo: Story = {
  args: {
    placeholder: 'Resize the viewport to see responsive behavior...',
    maxWidth: '100%',
    minHeight: '250px',
    content: `
      <h2>📱 Responsive Editor</h2>
      <p>This editor adapts to different screen sizes and viewport widths.</p>
      <p>Try resizing your browser window or changing the viewport in Storybook to see how it responds.</p>
    `,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive behavior across different screen sizes.',
      },
    },
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// =============================================================================
// READ-ONLY MODE
// =============================================================================

export const ReadOnlyMode: Story = {
  args: {
    editable: false,
    showToolbar: false,
    content: `
      <h1>Read-Only Content</h1>
      <p>This editor is in <strong>read-only mode</strong>. You can view the content but cannot edit it.</p>
      <p>Perfect for displaying formatted content without allowing modifications.</p>
      <ul>
        <li>Viewing formatted documents</li>
        <li>Content previews</li>
        <li>Static documentation</li>
      </ul>
    `,
    theme: {
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
    },
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode for displaying formatted content without editing capabilities.',
      },
    },
  },
};

// =============================================================================
// MEDIA UPLOAD STORIES (Phase 5)
// =============================================================================

export const MediaUploadEnabled: Story = {
  args: {
    placeholder: 'Upload images, videos, and audio files...',
    features: {
      formatting: true,
      lists: true,
      tables: false,
      codeBlocks: false,
      links: true,
      tasks: false,
      colors: false,
      mediaUpload: true,
    },
    mediaUploadConfig: {
      accept: 'image/*,video/*,audio/*',
      maxSizes: {
        image: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024, // 100MB
        audio: 50 * 1024 * 1024, // 50MB
      },
      uploadHandler: undefined, // Will use mock handler
      onError: (error: Error) => {
        console.error('Media upload error:', error);
        alert(`Upload failed: ${error.message}`);
      },
      onSuccess: (url: string, mediaType: 'image' | 'video' | 'audio') => {
        console.log(`${mediaType} uploaded:`, url);
        alert(`${mediaType} uploaded successfully!`);
      },
    },
    content: `
      <h1>📸 Embeddable Media Upload</h1>
      <p>This embeddable editor supports <strong>multimedia content</strong> including images, videos, and audio files.</p>
      
      <h2>How to Upload Media</h2>
      <ul>
        <li>Click the 📎 button in the toolbar</li>
        <li>Drag files directly into the editor</li>
        <li>Paste images from your clipboard</li>
      </ul>
      
      <p><em>Try uploading media files to see them embedded in the editor!</em></p>
    `,
    minHeight: '400px',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Embeddable Media Upload**

This story demonstrates media upload functionality in the embeddable editor:

- Image, video, and audio support
- Drag & drop file handling  
- Toolbar upload button
- Custom upload handlers
- Error handling with alerts
- Progress indicators

Perfect for content management systems that need rich media support.
        `,
      },
    },
  },
};

export const ImageOnlyUpload: Story = {
  args: {
    placeholder: 'Upload images only...',
    features: {
      formatting: true,
      lists: true,
      tables: false,
      codeBlocks: false,
      links: true,
      tasks: false,
      colors: false,
      mediaUpload: true,
    },
    mediaUploadConfig: {
      accept: 'image/*',
      maxSizes: {
        image: 5 * 1024 * 1024, // 5MB limit
      },
      onSuccess: (url: string, mediaType: 'image' | 'video' | 'audio') => {
        console.log(`Image uploaded: ${url}`);
      },
    },
    content: `
      <h2>🖼️ Image Upload Only</h2>
      <p>This configuration only accepts image files for upload.</p>
      <p>Perfect for blog editors or content management where only images are needed.</p>
    `,
    minHeight: '300px',
  },
  parameters: {
    docs: {
      description: {
        story: 'Embeddable editor configured to accept only image uploads.',
      },
    },
  },
};

export const VideoUploadBlog: Story = {
  args: {
    placeholder: 'Create a video blog post...',
    features: {
      formatting: true,
      lists: true,
      tables: false,
      codeBlocks: false,
      links: true,
      tasks: false,
      colors: true,
      mediaUpload: true,
    },
    mediaUploadConfig: {
      accept: 'video/*,image/*',
      maxSizes: {
        image: 10 * 1024 * 1024, // 10MB
        video: 200 * 1024 * 1024, // 200MB for high-quality videos
      },
      onSuccess: (url: string, mediaType: 'image' | 'video' | 'audio') => {
        console.log(`${mediaType} uploaded for blog:`, url);
      },
    },
    content: `
      <h1>🎬 Video Blog Editor</h1>
      <p>Perfect configuration for creating video blog posts with supporting images.</p>
      
      <p>This editor supports:</p>
      <ul>
        <li>High-quality video uploads (up to 200MB)</li>
        <li>Supporting images</li>
        <li>Rich text formatting</li>
        <li>Color highlighting</li>
      </ul>
      
      <p><mark style="background-color: #fef08a">Upload your video content and create engaging blog posts!</mark></p>
    `,
    minHeight: '400px',
    theme: {
      focusColor: '#dc2626',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Video blog editor configuration with support for high-quality video uploads.',
      },
    },
  },
};

export const PodcastEditor: Story = {
  args: {
    placeholder: 'Create podcast show notes with audio...',
    features: {
      formatting: true,
      lists: true,
      tables: true,
      codeBlocks: false,
      links: true,
      tasks: true,
      colors: false,
      mediaUpload: true,
    },
    mediaUploadConfig: {
      accept: 'audio/*,image/*',
      maxSizes: {
        image: 5 * 1024 * 1024, // 5MB
        audio: 100 * 1024 * 1024, // 100MB for podcast episodes
      },
      onSuccess: (url: string, mediaType: 'image' | 'video' | 'audio') => {
        console.log(`${mediaType} uploaded for podcast:`, url);
      },
    },
    content: `
      <h1>🎙️ Podcast Show Notes Editor</h1>
      <p>Perfect for creating podcast show notes with embedded audio content.</p>
      
      <h2>Episode Checklist</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Record podcast episode</li>
        <li data-type="taskItem" data-checked="true">Edit and export audio</li>
        <li data-type="taskItem" data-checked="false">Upload episode audio</li>
        <li data-type="taskItem" data-checked="false">Write show notes</li>
        <li data-type="taskItem" data-checked="false">Add guest information</li>
        <li data-type="taskItem" data-checked="false">Publish episode</li>
      </ul>
      
      <h2>Guest Information</h2>
      <table>
        <tbody>
          <tr>
            <th><p><strong>Guest</strong></p></th>
            <th><p><strong>Topic</strong></p></th>
            <th><p><strong>Duration</strong></p></th>
          </tr>
          <tr>
            <td><p>John Doe</p></td>
            <td><p>Web Development</p></td>
            <td><p>45 minutes</p></td>
          </tr>
        </tbody>
      </table>
      
      <p><em>Upload your podcast audio above to embed it in the show notes!</em></p>
    `,
    minHeight: '500px',
    theme: {
      focusColor: '#7c3aed',
      backgroundColor: '#faf5ff',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Podcast show notes editor with audio upload support and organizational features.',
      },
    },
  },
};

export const MediaUploadErrorDemo: Story = {
  args: {
    placeholder: 'Try uploading large files to see error handling...',
    features: {
      formatting: true,
      lists: false,
      tables: false,
      codeBlocks: false,
      links: false,
      tasks: false,
      colors: false,
      mediaUpload: true,
    },
    mediaUploadConfig: {
      accept: 'image/*,video/*,audio/*',
      maxSizes: {
        image: 500 * 1024, // Very small: 500KB
        video: 2 * 1024 * 1024, // Small: 2MB
        audio: 1024 * 1024, // Small: 1MB
      },
      onError: (error: Error) => {
        console.error('Upload error demo:', error);
        // Error will be shown in the editor UI
      },
      onSuccess: (url: string, mediaType: 'image' | 'video' | 'audio') => {
        console.log(`${mediaType} uploaded successfully`);
      },
    },
    content: `
      <h2>⚠️ Error Handling Demo</h2>
      <p>This editor has very small file size limits to demonstrate error handling:</p>
      <ul>
        <li><strong>Images:</strong> 500KB limit</li>
        <li><strong>Videos:</strong> 2MB limit</li>
        <li><strong>Audio:</strong> 1MB limit</li>
      </ul>
      <p>Try uploading larger files to see the error messages and retry functionality.</p>
    `,
    minHeight: '300px',
    theme: {
      borderColor: '#fca5a5',
      focusColor: '#ef4444',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Error Handling Demo**

This story demonstrates comprehensive error handling for media uploads with intentionally small file size limits:

- Clear error messages
- Retry functionality
- Upload cancellation
- Graceful error recovery

Try uploading files larger than the limits to see the error handling in action.
        `,
      },
    },
  },
};

// =============================================================================
// SIZE VARIANTS
// =============================================================================

export const CompactEditor: Story = {
  args: {
    placeholder: 'Compact editor for tight spaces...',
    minHeight: '100px',
    maxWidth: '400px',
    showToolbar: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version perfect for comments, short notes, or tight spaces.',
      },
    },
  },
};

export const LargeEditor: Story = {
  args: {
    placeholder: 'Large editor for extensive content...',
    minHeight: '600px',
    maxWidth: '900px',
    content: `
      <h1>Large Editor</h1>
      <p>Perfect for long-form content creation with plenty of space to work.</p>
    `,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large editor suitable for extensive content creation and editing.',
      },
    },
    layout: 'fullscreen',
  },
};
