'use client';

import { Button } from '#/components/ui/button';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure, useTimeout } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { motion } from 'framer-motion';
import { Check, Copy, Download, Eye } from 'lucide-react';

/**
 * Props for the CodeBlock component
 */
interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

/**
 * Code block component with syntax highlighting and copy functionality
 * @param node - AST node (unused)
 * @param inline - Whether this is inline code
 * @param className - CSS classes including language info
 * @param children - Code content
 * @param props - Additional props
 */
export function CodeBlock({ node: _node, inline, className, children, ...props }: CodeBlockProps) {
  const [copied, { open: setCopied, close: clearCopied }] = useDisclosure();
  const prototypeMode = isPrototypeMode();

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const language = className?.replace('language-', '') || 'text';
  const codeString = String(children).replace(/\n$/, '');

  const { start: startCopyReset } = useTimeout(() => clearCopied(), 2000);

  const handleCopy = async () => {
    if (!prototypeMode) return;

    await navigator.clipboard.writeText(codeString);
    setCopied();
    startCopyReset();
  };

  const handleDownload = () => {
    if (!prototypeMode) return;

    const blob = new Blob([codeString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!prototypeMode) return;
    logInfo('Preview code', { language, code: codeString });
    // In a real app, this might open a preview modal
  };

  if (!inline) {
    return (
      <div className="not-prose group relative flex flex-col">
        {/* Header with language and actions */}
        <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
          <span className="text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
            {language}
          </span>

          {prototypeMode && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCopy}
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              {(language === 'html' || language === 'javascript' || language === 'jsx') && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={handlePreview}
                  title="Preview code"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleDownload}
                title="Download code"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Code content */}
        <pre
          {...props}
          className="w-full overflow-x-auto rounded-b-xl border border-zinc-200 p-4 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <code className={`language-${language} whitespace-pre-wrap break-words`}>
            {highlightCode(codeString, language)}
          </code>
        </pre>

        {/* Copy feedback */}
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-2 top-8 rounded bg-green-500 px-2 py-1 text-xs text-white"
          >
            Copied!
          </motion.div>
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} rounded-md bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800`}
        {...props}
      >
        {children}
      </code>
    );
  }
}

// Basic syntax highlighting for common languages
function highlightCode(code: string, language: string): React.ReactNode {
  // For prototype mode, we'll do basic highlighting
  // In a real app, you'd use a proper syntax highlighter like Prism or highlight.js

  if (language === 'javascript' || language === 'js' || language === 'jsx') {
    return highlightJavaScript(code);
  }

  if (language === 'python' || language === 'py') {
    return highlightPython(code);
  }

  if (language === 'html') {
    return highlightHTML(code);
  }

  if (language === 'css') {
    return highlightCSS(code);
  }

  // Return plain text for unsupported languages
  return code;
}

function highlightJavaScript(code: string): React.ReactNode {
  // Pre-built regex patterns for keywords to avoid dynamic RegExp construction
  const keywordsPattern =
    /\b(const|let|var|function|if|else|for|while|return|class|import|export|default|async|await)\b/g;
  const typesPattern = /\b(String|Number|Boolean|Array|Object|Promise)\b/g;

  return highlightWithPatterns(code, [
    { pattern: /\/\/.*$/gm, className: 'text-green-600 dark:text-green-400' }, // Comments
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-green-600 dark:text-green-400' }, // Block comments
    {
      pattern: keywordsPattern,
      className: 'text-purple-600 dark:text-purple-400 font-semibold',
    }, // Keywords
    {
      pattern: typesPattern,
      className: 'text-blue-600 dark:text-blue-400',
    }, // Types
    { pattern: /'[^']*'/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Strings
    { pattern: /"[^"]*"/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Strings
    { pattern: /`[^`]*`/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Template literals
  ]);
}

function highlightPython(code: string): React.ReactNode {
  // Pre-built regex pattern for Python keywords to avoid dynamic RegExp construction
  const keywordsPattern =
    /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|lambda)\b/g;

  return highlightWithPatterns(code, [
    { pattern: /#.*$/gm, className: 'text-green-600 dark:text-green-400' }, // Comments
    {
      pattern: keywordsPattern,
      className: 'text-purple-600 dark:text-purple-400 font-semibold',
    }, // Keywords
    { pattern: /'[^']*'/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Strings
    { pattern: /"[^"]*"/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Strings
  ]);
}

function highlightHTML(code: string): React.ReactNode {
  return highlightWithPatterns(code, [
    { pattern: /<!--[\s\S]*?-->/g, className: 'text-green-600 dark:text-green-400' }, // Comments
    { pattern: /<\/?[a-zA-Z][^>]*>/g, className: 'text-blue-600 dark:text-blue-400' }, // Tags
    { pattern: /=\s*"[^"]*"/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Attributes
  ]);
}

function highlightCSS(code: string): React.ReactNode {
  return highlightWithPatterns(code, [
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-green-600 dark:text-green-400' }, // Comments
    {
      pattern: /[.#]?[a-zA-Z][a-zA-Z0-9-]*(?=\s*{)/g,
      className: 'text-blue-600 dark:text-blue-400',
    }, // Selectors
    { pattern: /[a-zA-Z-]+(?=\s*:)/g, className: 'text-purple-600 dark:text-purple-400' }, // Properties
    { pattern: /:\s*[^;]+/g, className: 'text-yellow-600 dark:text-yellow-400' }, // Values
  ]);
}

function highlightWithPatterns(
  code: string,
  patterns: Array<{ pattern: RegExp; className: string }>,
): React.ReactNode {
  let result: React.ReactNode[] = [];
  let lastIndex = 0;

  // Simple highlighting - in a real app you'd want more sophisticated parsing
  for (const { pattern, className } of patterns) {
    const matches = Array.from(code.matchAll(pattern));
    for (const match of matches) {
      if (match.index !== undefined) {
        // Add text before match
        if (match.index > lastIndex) {
          result.push(code.substring(lastIndex, match.index));
        }

        // Add highlighted match
        result.push(
          <span key={`${match.index}-${match[0]}`} className={className}>
            {match[0]}
          </span>,
        );

        lastIndex = match.index + match[0].length;
      }
    }
  }

  // Add remaining text
  if (lastIndex < code.length) {
    result.push(code.substring(lastIndex));
  }

  return result.length > 0 ? result : code;
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    js: 'js',
    jsx: 'jsx',
    typescript: 'ts',
    ts: 'ts',
    tsx: 'tsx',
    python: 'py',
    py: 'py',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yml',
    yml: 'yml',
    sql: 'sql',
    bash: 'sh',
    shell: 'sh',
  };

  return extensions[language.toLowerCase()] || 'txt';
}
