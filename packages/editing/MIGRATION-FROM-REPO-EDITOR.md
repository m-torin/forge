# Migration Guide: @repo/editor → @repo/editing

This guide helps you migrate from `@repo/editor` (TipTap v3 with build step) to
`@repo/editing` (TipTap v3 ESM direct).

## Key Differences

| Feature            | @repo/editor  | @repo/editing         |
| ------------------ | ------------- | --------------------- |
| **Build Step**     | tsup bundling | ESM direct (no build) |
| **TipTap Version** | v3.0.0        | v3.0.0                |
| **UI**             | Mantine only  | Mantine + Tailwind    |
| **State**          | Props/Context | Jotai atoms           |
| **Collaboration**  | Basic         | Full Yjs + WebSocket  |
| **Extensions**     | Limited       | 8 custom extensions   |

## Step-by-Step Migration

### 1. Update Package Dependency

```diff
// package.json
{
  "dependencies": {
-   "@repo/editor": "*",
+   "@repo/editing": "*"
  }
}
```

### 2. Update Imports

```diff
// Old: @repo/editor with build outputs
- import { NotionEditor } from '@repo/editor/components';
- import { useEditor } from '@repo/editor/hooks';

// New: @repo/editing with granular exports
+ import { NotionEditor } from '@repo/editing/mantine';
+ import { editorAtom } from '@repo/editing/state';
+ import { useAtomValue } from 'jotai';
```

### 3. Component Updates

#### NotionEditor

**Before (@repo/editor):**

```tsx
import { NotionEditor } from "@repo/editor/components";

function MyEditor() {
  return (
    <NotionEditor
      initialContent="<p>Hello</p>"
      onChange={(html) => console.log(html)}
    />
  );
}
```

**After (@repo/editing):**

```tsx
import { NotionEditor } from "@repo/editing/mantine";
import { createRichPreset } from "@repo/editing/presets";

function MyEditor() {
  const extensions = createRichPreset();

  return (
    <NotionEditor
      extensions={extensions}
      content="<p>Hello</p>"
      onUpdate={({ html, json }) => console.log(html)}
    />
  );
}
```

#### MinimalEditor

**Before (@repo/editor):**

```tsx
import { MinimalEditor } from "@repo/editor/components";

function CommentEditor() {
  return <MinimalEditor placeholder="Add a comment..." />;
}
```

**After (@repo/editing):**

```tsx
import { MinimalEditor } from "@repo/editing/mantine";
import { createBasicPreset } from "@repo/editing/presets";

function CommentEditor() {
  const extensions = createBasicPreset({
    placeholder: "Add a comment..."
  });

  return (
    <MinimalEditor
      extensions={extensions}
      showCharacterCount
      maxCharacters={500}
    />
  );
}
```

### 4. State Management Migration

**Before (@repo/editor) - Props drilling:**

```tsx
function EditorWrapper() {
  const [content, setContent] = useState("");

  return (
    <>
      <Editor content={content} onChange={setContent} />
      <Preview content={content} />
    </>
  );
}
```

**After (@repo/editing) - Jotai atoms:**

```tsx
import { EditorRoot, EditorContent } from "@repo/editing/light";
import { useAtomValue } from "jotai";
import { editorAtom } from "@repo/editing/state";

function EditorWrapper() {
  const extensions = createBasicPreset();

  return (
    <EditorRoot>
      <EditorContent extensions={extensions} />
      <Preview />
    </EditorRoot>
  );
}

function Preview() {
  const editor = useAtomValue(editorAtom);
  const html = editor?.getHTML() || "";

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### 5. Collaboration Migration

**Before (@repo/editor) - Limited:**

```tsx
// Not available or very basic
import { CollabEditor } from "@repo/editor/collaboration";
```

**After (@repo/editing) - Full featured:**

```tsx
import { CollaborativeEditor } from "@repo/editing/collaboration";

function RealtimeEditor() {
  return (
    <CollaborativeEditor
      documentId="doc-123"
      user={{
        id: "user-1",
        name: "John Doe",
        color: "#3b82f6"
      }}
      serverUrl="wss://collab.example.com"
      showPresence
    />
  );
}
```

### 6. Extensions Migration

**Before (@repo/editor):**

```tsx
// Limited to StarterKit
import { StarterKit } from "@tiptap/starter-kit";
```

**After (@repo/editing):**

```tsx
// Use presets for common configurations
import { createFullPreset } from "@repo/editing/presets";

// Or import individual extensions
import { AIHighlight, Markdown, Mathematics } from "@repo/editing/extensions";

const extensions = [
  AIHighlight.configure({ defaultColor: "#3b82f6" }),
  Markdown,
  Mathematics
];
```

### 7. Export/Import Utilities

**Before (@repo/editor):**

```tsx
// Manual implementation
const html = editor.getHTML();
const blob = new Blob([html], { type: "text/html" });
// ... manual download logic
```

**After (@repo/editing):**

```tsx
import {
  exportAsHTML,
  exportAsJSON,
  exportAsMarkdown
} from "@repo/editing/utils";

// Simple one-liners
exportAsHTML(editor, "document", { includeStyles: true });
exportAsJSON(editor, "document", { includeMetadata: true });
exportAsMarkdown(editor, "document");
```

### 8. Media Upload

**Before (@repo/editor):**

```tsx
// Custom implementation required
```

**After (@repo/editing):**

```tsx
import { createImageUploadHandler } from "@repo/editing/utils";

const handleImageUpload = createImageUploadHandler(editor, {
  uploadUrl: "https://api.example.com/upload",
  maxSize: 5 * 1024 * 1024, // 5MB
  onProgress: (progress) => console.log(`${progress}%`)
});

<input type="file" accept="image/*" onChange={handleImageUpload} />;
```

## Breaking Changes

### 1. No Default Export

```diff
// Old
- import Editor from '@repo/editor';

// New - Named exports only
+ import { EditorContent } from '@repo/editing/light';
```

### 2. Extensions Required

```diff
// Old - Extensions were optional
<NotionEditor />

// New - Extensions must be provided
+ const extensions = createRichPreset();
<NotionEditor extensions={extensions} />
```

### 3. Callback Signatures

```diff
// Old
- onChange={(html: string) => void}

// New
+ onUpdate={({ editor, html, json }) => void}
```

### 4. Removed Features

- ❌ Built dist files (use TypeScript source directly)
- ❌ CommonJS support (ESM only)
- ❌ Default configurations (use presets instead)

## New Features Available

✅ **AI Extensions** - AIHighlight, SlashCommand ✅ **Enhanced Media** -
Twitter, YouTube, Math rendering ✅ **Collaboration** - Full Yjs + WebSocket
support ✅ **Document Management** - Store, export, import utilities ✅ **Dual
UI** - Tailwind (Light) + Mantine components ✅ **Better Tree-shaking** -
Granular exports ✅ **Type Safety** - Full TypeScript support

## Migration Checklist

- [ ] Update package.json dependency
- [ ] Update all imports to new paths
- [ ] Add extension presets to components
- [ ] Update onChange → onUpdate callbacks
- [ ] Migrate to Jotai atoms for state (optional but recommended)
- [ ] Test all editor functionality
- [ ] Update tests if needed
- [ ] Remove old @repo/editor package

## Need Help?

- Check the main [README.md](./README.md) for usage examples
- Review the [TypeScript types](./src/types/) for API reference
- See example implementations in [**tests**](./__tests__/)
