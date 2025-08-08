# @labs/monaco-editor

- _Can build:_ **YES** (Package)

- _AI Hints:_

  ```typescript
  // Primary: Monaco Editor integration with Mantine - multi-language code editor
  // Import: import { MonacoEditor } from "@labs/monaco-editor"
  // Languages: javascript, typescript, python, r, sql, json support
  // Themes: vs-dark, light, dracula themes available
  // ❌ NEVER: Use without proper worker configuration or skip language registration
  ```

- _Key Features:_
  - **Monaco Editor Integration**: Full Microsoft Monaco Editor with Mantine Box wrapper
  - **Multi-Language Support**: JavaScript, TypeScript, Python, R, SQL, JSON with syntax highlighting
  - **Language Validation**: Built-in validators for each supported language
  - **Code Formatting**: Automatic formatting for SQL, Python, R languages
  - **Custom Themes**: Dracula theme plus VS Code light/dark themes
  - **Worker Configuration**: Proper web worker setup for language services

- _Supported Languages:_
  - **JavaScript**: Syntax highlighting, validation, IntelliSense
  - **TypeScript**: Full TypeScript support with type checking
  - **Python**: Syntax highlighting with format validation
  - **R**: Statistical language support with formatting
  - **SQL**: SQL formatting and validation with sql-formatter
  - **JSON**: Built-in JSON language support

- _Environment Variables:_
  ```bash
  # Optional: Custom worker paths
  NEXT_PUBLIC_MONACO_WORKER_PATH=/monaco-workers
  
  # Optional: Theme preference
  NEXT_PUBLIC_DEFAULT_THEME=dracula
  ```

- _Quick Setup:_
  ```typescript
  import { MonacoEditor } from "@labs/monaco-editor";
  
  function CodeEditor() {
    const [code, setCode] = useState('console.log("Hello World");');
    
    return (
      <MonacoEditor
        defaultValue={code}
        onChange={setCode}
        language="javascript"
        theme="dracula"
        height={400}
        readOnly={false}
        onMount={(editor) => {
          console.log('Editor mounted:', editor);
        }}
      />
    );
  }
  
  // Language-specific setup
  <MonacoEditor
    defaultValue="SELECT * FROM users WHERE id = 1;"
    onChange={setCode}
    language="sql"
    theme="vs-dark"
  />
  ```

- _Worker Configuration:_
  - Requires Monaco Editor workers in public/monaco-workers/ directory
  - Workers handle language services (TypeScript, JavaScript, JSON)
  - Automatic worker loading based on language selection
  - ESM module imports for optimal bundle size

- _Peer Dependencies:_
  - **Required**: @mantine/core, @mantine/hooks, react, react-dom
  - **Languages**: monaco-editor (0.52.0+), sql-formatter, lodash
  - **Build**: tsup for ESM package building

- _Language Features:_
  - **Syntax Highlighting**: All languages with proper tokenization
  - **Code Validation**: Real-time error detection and reporting
  - **Auto-formatting**: SQL, Python, R with format-on-save
  - **IntelliSense**: TypeScript/JavaScript autocompletion
  - **Error Markers**: Visual error indicators with hover details

- _Storybook Integration:_
  - Interactive documentation with live examples
  - All language demos with sample code
  - Theme switching examples
  - Performance testing scenarios

- _Testing Coverage:_
  - Comprehensive Vitest test suite
  - Component mounting and interaction tests
  - Language validation testing
  - Worker configuration verification

- _Build Output:_
  - **Format**: ESM only with TypeScript declarations
  - **Bundle**: Optimized for tree-shaking
  - **External**: React dependencies externalized
  - **Types**: Full TypeScript support with .d.ts files

- _Documentation:_ **[Monaco Editor Lab](../../apps/docs/labs/monaco-editor/)**