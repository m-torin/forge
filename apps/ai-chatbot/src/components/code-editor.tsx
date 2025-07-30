'use client';

import { Suggestion } from '#/lib/db/schema';
import { RESPONSIVE } from '#/lib/ui-constants';
import { python } from '@codemirror/lang-python';
import { EditorState, Transaction } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Props for CodeEditor component
 */
type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

/**
 * Pure code editor component using CodeMirror
 * @param content - Code content to display
 * @param onSaveContent - Callback for content changes
 * @param status - Editor status (streaming or idle)
 */
function PureCodeEditor({ content, onSaveContent, status }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);

  // Memoize extensions to prevent recreation
  const baseExtensions = useMemo(() => [basicSetup, python(), oneDark], []);

  // Memoize update listener to prevent recreation on every render
  const createUpdateListener = useCallback(() => {
    return EditorView.updateListener.of(update => {
      if (update.docChanged) {
        const transaction = update.transactions.find(tr => !tr.annotation(Transaction.remote));

        if (transaction) {
          const newContent = update.state.doc.toString();
          onSaveContent(newContent, true);
        }
      }
    });
  }, [onSaveContent]);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: baseExtensions,
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = createUpdateListener();
      const currentSelection = editorRef.current.state.selection;

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [...baseExtensions, updateListener],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [baseExtensions, createUpdateListener]);

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div
      className={`not-prose relative w-full ${RESPONSIVE.LAYOUT.CONTENT_MOBILE}`}
      style={{
        // Mobile-optimized code editor height
        height: 'clamp(300px, 70vh, 80vh)',
        fontSize: 'clamp(12px, 2vw, 14px)',
        lineHeight: '1.5',
      }}
      ref={containerRef}
    />
  );
}

/**
 * Comparison function for memoization
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns Whether props are equal
 */
function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
  if (prevProps.content !== nextProps.content) return false;

  return true;
}

/**
 * Memoized code editor component with CodeMirror integration
 */
export const CodeEditor = memo(PureCodeEditor, areEqual);
