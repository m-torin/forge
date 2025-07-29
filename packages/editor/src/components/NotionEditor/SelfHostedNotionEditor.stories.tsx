import type { Meta, StoryObj } from '@storybook/react';
import { SelfHostedNotionEditor } from './SelfHostedNotionEditor';

const meta: Meta<typeof SelfHostedNotionEditor> = {
  title: 'Editor/SelfHostedNotionEditor',
  component: SelfHostedNotionEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# SelfHostedNotionEditor

A **complete self-hosted** document editing solution built with Tiptap v3 and Mantine hooks, featuring:

## 🏠 Self-Hosted Features
- 💾 **Local Storage** - All data stored locally using Mantine's useLocalStorage
- 📄 **Document Manager** - Browse, organize, and manage documents locally
- 🔍 **Advanced Search** - Full-text search with relevance scoring, filters, and search history
- 📁 **Document Organization** - Hierarchical folders (5 levels), smart tagging, pinning, archiving
- 🎨 **Visual Organization** - Custom colors for folders and tags with descriptions
- 📊 **Usage Analytics** - Document access tracking and usage patterns
- 🔒 **Privacy First** - Zero external dependencies, complete data control
- 💾 **Auto-save** - Automatic document persistence with configurable intervals
- 🔄 **Crash Recovery** - Restore unsaved work after unexpected closures
- 📊 **Export Templates** - Customizable export templates with CSS styling and preferences
- 📤 **Export Manager** - Multiple formats with user preferences and export history
- ⚙️ **Privacy Settings** - Complete control over data storage and retention

## 📝 Editor Features  
- 🔗 **11+ Slash Commands** - Create headings, lists, tables, code blocks, and more
- 🎨 **Floating Toolbar** - Rich text formatting with colors and highlights  
- ✨ **Emoji Support** - Type ':' followed by emoji names
- 👥 **Mentions** - Type '@' to mention collaborators
- 🆔 **Unique Block IDs** - Every block has a unique identifier
- 📝 **Trailing Nodes** - Always have a paragraph ready for writing
- ♿ **Accessibility** - Full ARIA support and keyboard navigation
- 🛡️ **Error Boundaries** - Graceful error handling and recovery

## 📊 Document Management
- 📁 **Document Browser** - Visual interface for managing documents
- 🔍 **Search & Filter** - Find documents by title or content
- ⭐ **Favorites** - Mark important documents for quick access
- 📊 **Document Stats** - Word count, character count, version tracking
- 🕒 **Recent Documents** - Quick access to recently edited files
- 🗂️ **Sorting Options** - Sort by date, title, or word count

## 🔒 Privacy & Data Control
- 🏠 **100% Local** - No external servers or services
- 🔧 **Data Management** - View storage usage and manage data retention
- 📤 **Export All Data** - Complete data portability
- 🗑️ **Clear Data** - User-controlled data deletion
- ⚙️ **Preferences** - Customize auto-save, recovery, and export settings

## Usage

\`\`\`tsx
import { SelfHostedNotionEditor } from '@repo/editor/components';

<SelfHostedNotionEditor 
  documentTitle="My Document"
  showSidebar={true}
  enableDocumentManager={true}
  enablePrivacySettings={true}
  autoSaveInterval={30000}
  onDocumentChange={(id, title) => console.log('Document changed:', id, title)}
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
    documentTitle: {
      control: 'text',
      description: 'Initial document title',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Untitled Document"' },
      },
    },
    showSidebar: {
      control: 'boolean',
      description: 'Show the document management sidebar',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableDocumentManager: {
      control: 'boolean',
      description: 'Enable the document browser and management features',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enableExportTemplates: {
      control: 'boolean',
      description: 'Enable export template manager and customization',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    enablePrivacySettings: {
      control: 'boolean',
      description: 'Enable privacy and data control settings',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    autoSaveInterval: {
      control: { type: 'number', min: 5000, max: 300000, step: 5000 },
      description: 'Auto-save interval in milliseconds',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '30000' },
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
  },
} satisfies Meta<typeof SelfHostedNotionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// COMPLETE SELF-HOSTED STORIES
// =============================================================================

export const Default: Story = {
  args: {
    documentTitle: 'Welcome to Self-Hosted NotionEditor',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 30000,
    enableEmoji: true,
    enableMentions: true,
    users: [
      { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
    ],
  },
};

export const DocumentManagement: Story = {
  args: {
    documentTitle: 'Document Management Demo',
    showSidebar: true,
    enableDocumentManager: true,
    enablePrivacySettings: false,
    autoSaveInterval: 15000, // Faster for demo
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Focused on document management features - browse, search, and organize documents locally.',
      },
    },
  },
};

export const PrivacyFocused: Story = {
  args: {
    documentTitle: 'Privacy-First Editor',
    showSidebar: true,
    enableDocumentManager: false,
    enableExportTemplates: false,
    enablePrivacySettings: true,
    autoSaveInterval: 60000,
    enableEmoji: true,
    enableMentions: false, // Privacy-focused might disable mentions
  },
  parameters: {
    docs: {
      description: {
        story: 'Emphasizes privacy controls and data management - perfect for sensitive documents.',
      },
    },
  },
};

export const MinimalSelfHosted: Story = {
  args: {
    documentTitle: 'Minimal Self-Hosted Editor',
    showSidebar: false,
    enableDocumentManager: false,
    enableExportTemplates: false,
    enablePrivacySettings: false,
    autoSaveInterval: 30000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal self-hosted setup with just the editor and auto-save functionality.',
      },
    },
  },
};

export const FastAutoSave: Story = {
  args: {
    documentTitle: 'Fast Auto-Save Demo',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 5000, // Save every 5 seconds
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates fast auto-save for environments where frequent saves are important.',
      },
    },
  },
};

// =============================================================================
// FEATURE-SPECIFIC DEMOS
// =============================================================================

export const OfflineCapable: Story = {
  args: {
    documentTitle: 'Offline-Capable Editor',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 10000,
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates offline capabilities with IndexedDB persistence and recovery features.',
      },
    },
  },
};

export const DataPortability: Story = {
  args: {
    documentTitle: 'Data Export & Portability Demo',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 30000,
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Showcases export capabilities and data portability features for self-hosted environments.',
      },
    },
  },
};

export const ComprehensiveDemo: Story = {
  args: {
    documentTitle: '🚀 Complete Self-Hosted NotionEditor',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 20000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
    showDragHandles: true,
    users: [
      { id: 'demo-user', name: 'Demo User', email: 'demo@localhost' },
      { id: 'editor-user', name: 'Editor User', email: 'editor@localhost' },
      { id: 'writer-user', name: 'Content Writer', email: 'writer@localhost' },
      { id: 'manager-user', name: 'Project Manager', email: 'pm@localhost' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete demonstration of all self-hosted features - document management, privacy controls, auto-save, export, and full editor capabilities.',
      },
    },
    layout: 'fullscreen',
  },
};

// =============================================================================
// EXPORT TEMPLATE CUSTOMIZATION
// =============================================================================

export const ExportTemplateDemo: Story = {
  args: {
    documentTitle: '📤 Export Template Customization',
    showSidebar: true,
    enableDocumentManager: false, // Focus on export features
    enableExportTemplates: true,
    enablePrivacySettings: false,
    autoSaveInterval: 30000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Advanced Export Template System:**

🎨 **Custom Templates** - Create personalized export templates with custom CSS
📄 **Multiple Formats** - Support for Markdown, HTML, JSON, and Backup formats
⚙️ **Template Editor** - Visual template creator with live preview
📊 **Export History** - Track all exports with file sizes and timestamps
🎯 **Quick Export** - One-click export with your preferred settings
🔄 **Template Sharing** - Copy built-in templates and customize them

**Built-in Templates:**
- **Blog Post** - HTML format with serif typography and styled headings
- **Documentation** - Clean Markdown format for technical docs
- **Meeting Notes** - HTML format optimized for business communications

**Features to Explore:**
- Create new templates with custom CSS styling
- Set default export preferences
- Preview templates before creating documents
- Export with different templates for different use cases
- Track export history and file sizes
        `,
      },
    },
    layout: 'fullscreen',
  },
};

// =============================================================================
// PHASE 3 ORGANIZATION & SEARCH FEATURES
// =============================================================================

export const DocumentOrganizationDemo: Story = {
  args: {
    documentTitle: '📁 Document Organization & Search Demo',
    showSidebar: true,
    enableDocumentManager: true,
    enablePrivacySettings: false,
    autoSaveInterval: 30000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Advanced Document Organization Features:**

🗂️ **Hierarchical Folders** - Create nested folder structures up to 5 levels deep
🏷️ **Smart Tagging** - Multi-colored tags with descriptions and document counts
📌 **Pin & Archive** - Pin important documents, archive completed ones
🔍 **Full-Text Search** - Search across all documents with relevance scoring
📊 **Advanced Filters** - Filter by folder, tags, pinned, archived, or unorganized
📈 **Usage Analytics** - Track document access counts and last accessed times
🎨 **Color Coding** - Customize folder and tag colors for visual organization

**Try These Features:**
- Create folders and nest them within each other
- Add colorful tags to categorize your documents
- Use the search bar to find documents instantly
- Pin important documents for quick access
- Archive completed work to keep your workspace clean
- Switch between different view modes (folders, tags, all, pinned, archived)
        `,
      },
    },
    layout: 'fullscreen',
  },
};

export const AdvancedSearchDemo: Story = {
  args: {
    documentTitle: '🔍 Advanced Search & Discovery',
    showSidebar: true,
    enableDocumentManager: true,
    enablePrivacySettings: false,
    autoSaveInterval: 45000,
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Powerful Search Capabilities:**

🎯 **Relevance Scoring** - Results ranked by title matches, content relevance, and recency
🏷️ **Multi-Filter Search** - Combine text search with folder, tag, and status filters
📊 **Search Analytics** - Track search history and popular queries
⚡ **Real-Time Search** - Instant results as you type with debounced queries
💡 **Smart Suggestions** - Get search suggestions based on your document library
📈 **Usage Insights** - See which documents are accessed most frequently

**Search Features to Explore:**
- Type in the search bar for instant full-text search
- Use filters to narrow down results by folder or tags
- Search within specific document categories
- View search history and popular queries
- See relevance scores and match highlighting
        `,
      },
    },
  },
};

export const WorkspaceOrganizationDemo: Story = {
  args: {
    documentTitle: '🏢 Workspace Organization System',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 25000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
    users: [
      { id: 'team-lead', name: 'Team Lead', email: 'lead@company.com' },
      { id: 'developer', name: 'Developer', email: 'dev@company.com' },
      { id: 'designer', name: 'Designer', email: 'design@company.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
**Complete Workspace Management:**

📁 **Project Structure** - Organize documents by projects, teams, or topics
🏷️ **Team Tagging** - Use tags to categorize by team, priority, or status
📌 **Quick Access** - Pin frequently used documents and templates
🗃️ **Smart Archiving** - Archive completed projects while keeping them searchable
🔍 **Workspace Search** - Find any document across your entire workspace
📊 **Usage Tracking** - Monitor document activity and collaboration patterns

**Ideal for:**
- Software development teams
- Content creation workflows
- Project management
- Knowledge base management
- Team collaboration spaces
        `,
      },
    },
    layout: 'fullscreen',
  },
};

export const PersonalKnowledgeBase: Story = {
  args: {
    documentTitle: '🧠 Personal Knowledge Management',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 60000, // Longer interval for personal use
    enableEmoji: true,
    enableMentions: false, // Personal use might not need mentions
    showFloatingToolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Personal Knowledge Management System:**

📚 **Learning Organization** - Structure your notes by subjects, courses, or topics
🏷️ **Concept Tagging** - Tag notes with concepts, difficulty levels, or review status
📌 **Important Notes** - Pin key concepts and frequently referenced materials
🔍 **Knowledge Discovery** - Search across all your notes and learning materials
📊 **Learning Analytics** - Track your note-taking patterns and review frequency
🗃️ **Archive System** - Archive completed courses while keeping notes accessible

**Perfect for:**
- Students and researchers
- Professional development
- Personal learning journeys
- Reference material organization
- Study note management
        `,
      },
    },
  },
};

// =============================================================================
// COMPLETE PHASE 3 INTEGRATION DEMOS
// =============================================================================

export const Phase3CompleteIntegration: Story = {
  args: {
    documentTitle: '✨ Phase 3: Complete Self-Hosted Integration',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 20000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
    showDragHandles: true,
    users: [
      { id: 'phase3-user', name: 'Phase 3 Tester', email: 'test@phase3.local' },
      { id: 'feature-user', name: 'Feature Explorer', email: 'features@phase3.local' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
# 🎆 Phase 3 Complete Integration

**All Self-Hosted Features Enabled:**

## 📁 Advanced Organization
- 🗂️ **Hierarchical Folders** - Nested folder structures (5 levels deep)
- 🏷️ **Smart Tagging System** - Multi-colored tags with descriptions
- 📌 **Pin & Archive** - Document status management
- 🎨 **Color Customization** - Visual organization with custom colors

## 🔍 Intelligent Search
- 🎯 **Relevance Scoring** - Advanced search algorithm
- 📊 **Search Analytics** - History and usage tracking
- 📈 **Multi-Filter Search** - Combine text and metadata filters
- ⚡ **Real-Time Results** - Instant search with debouncing

## 💾 Data Management
- 🏠 **100% Local Storage** - Mantine useLocalStorage integration
- 🔒 **Privacy Controls** - Complete data ownership
- 📊 **Usage Analytics** - Document access patterns
- 📤 **Export Templates** - Customizable export templates with CSS styling
- 📻 **Export Manager** - Multiple formats with preferences and history

## 🚀 Enhanced Editor
- ✨ **Emoji Integration** - :emoji: syntax with suggestions
- 👥 **Mention System** - @user autocomplete
- 🎯 **Floating Toolbar** - Rich text formatting
- ⌨️ **Keyboard Shortcuts** - Notion-style shortcuts
- 📝 **Slash Commands** - Enhanced command palette

**This story demonstrates the complete Phase 3 implementation with all features working together seamlessly.**
        `,
      },
    },
    layout: 'fullscreen',
  },
};

export const ProductionReadyDemo: Story = {
  args: {
    documentTitle: '🎯 Production-Ready Self-Hosted Editor',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 30000, // Production-appropriate interval
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Production-Ready Configuration:**

🔒 **Enterprise Security** - Complete data isolation and privacy controls
💾 **Reliable Persistence** - Mantine hooks with error handling and recovery
🚀 **Performance Optimized** - Efficient search algorithms and document management
🎯 **User Experience** - Intuitive organization and discovery features
📈 **Scalable Architecture** - Handles large document collections efficiently
🔧 **Maintenance Friendly** - Clear data management and export capabilities

**Ready for deployment in production environments with sensitive data requirements.**
        `,
      },
    },
  },
};

// =============================================================================
// DEVELOPMENT & TESTING
// =============================================================================

export const DevelopmentMode: Story = {
  args: {
    documentTitle: 'Development Environment',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 5000, // Fast saves for development
    enableEmoji: true,
    enableMentions: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Development-friendly configuration with fast auto-save and all features enabled for testing and debugging.',
      },
    },
  },
};

export const FeatureTesting: Story = {
  args: {
    documentTitle: '🧪 Feature Testing Playground',
    showSidebar: true,
    enableDocumentManager: true,
    enableExportTemplates: true,
    enablePrivacySettings: true,
    autoSaveInterval: 10000,
    enableEmoji: true,
    enableMentions: true,
    showFloatingToolbar: true,
    showDragHandles: true,
    users: [
      { id: 'tester-1', name: 'Alpha Tester', email: 'alpha@test.local' },
      { id: 'tester-2', name: 'Beta Tester', email: 'beta@test.local' },
      { id: 'qa-user', name: 'QA Engineer', email: 'qa@test.local' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
**Comprehensive Feature Testing Environment:**

🧪 **All Features Enabled** - Complete feature set for thorough testing
🔍 **Search Testing** - Test search algorithms with various document types
📁 **Organization Testing** - Create complex folder/tag hierarchies
💾 **Persistence Testing** - Verify auto-save and data recovery
👥 **Collaboration Testing** - Test mentions and user interactions
⌨️ **Interaction Testing** - Verify all keyboard shortcuts and commands
        `,
      },
    },
    layout: 'fullscreen',
  },
};
