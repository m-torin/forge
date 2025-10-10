import { useAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { aiCompletionAtom, aiHighlightAtom, editorAtom } from '../state/atoms';

export interface UseAICompletionOptions {
  /** Callback when AI completion is generated */
  onCompletion?: (text: string) => void;
  /** Callback when AI completion fails */
  onError?: (error: Error) => void;
}

/**
 * Hook for AI-powered text completion and highlighting
 *
 * @param options - AI completion options
 * @returns AI state and actions
 *
 * @example
 * ```tsx
 * function AIToolbar() {
 *   const {
 *     highlightText,
 *     removeHighlight,
 *     isHighlightActive,
 *     highlightColor,
 *     setHighlightColor
 *   } = useAICompletion();
 *
 *   return (
 *     <div>
 *       <button onClick={() => highlightText('#3b82f6')}>
 *         Highlight AI Text
 *       </button>
 *       <button onClick={removeHighlight} disabled={!isHighlightActive}>
 *         Remove Highlight
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAICompletion(options: UseAICompletionOptions = {}) {
  const { onCompletion, onError } = options;

  const editor = useAtomValue(editorAtom);
  const [aiHighlight, setAIHighlight] = useAtom(aiHighlightAtom);
  const [aiCompletion, setAICompletion] = useAtom(aiCompletionAtom);

  /**
   * Highlight selected text with AI color
   */
  const highlightText = useCallback(
    (color?: string) => {
      if (!editor) return;

      const highlightColor = color || aiHighlight.defaultColor || '#fef3c7';

      editor.chain().focus().setAIHighlight({ color: highlightColor }).run();

      setAIHighlight(prev => ({
        ...prev,
        isActive: true,
        color: highlightColor,
      }));
    },
    [editor, aiHighlight.defaultColor, setAIHighlight],
  );

  /**
   * Remove AI highlight from selected text
   */
  const removeHighlight = useCallback(() => {
    if (!editor) return;

    editor.chain().focus().unsetAIHighlight().run();

    setAIHighlight(prev => ({
      ...prev,
      isActive: false,
    }));
  }, [editor, setAIHighlight]);

  /**
   * Set default highlight color
   */
  const setHighlightColor = useCallback(
    (color: string) => {
      setAIHighlight(prev => ({
        ...prev,
        defaultColor: color,
      }));
    },
    [setAIHighlight],
  );

  /**
   * Generate AI completion (placeholder for future AI integration)
   */
  const generateCompletion = useCallback(
    async (prompt: string) => {
      setAICompletion(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Placeholder for AI API call
        // In production, this would call an AI service
        const completion = `AI completion for: ${prompt}`;

        setAICompletion({
          isLoading: false,
          text: completion,
          error: null,
        });

        onCompletion?.(completion);

        return completion;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('AI completion failed');

        setAICompletion({
          isLoading: false,
          text: '',
          error: err.message,
        });

        onError?.(err);
        throw err;
      }
    },
    [setAICompletion, onCompletion, onError],
  );

  /**
   * Insert AI completion at cursor
   */
  const insertCompletion = useCallback(
    (text: string) => {
      if (!editor) return;

      editor.chain().focus().insertContent(text).run();
    },
    [editor],
  );

  /**
   * Clear AI completion
   */
  const clearCompletion = useCallback(() => {
    setAICompletion({
      isLoading: false,
      text: '',
      error: null,
    });
  }, [setAICompletion]);

  /**
   * Check if cursor is in AI highlighted text
   */
  const isInHighlight = useCallback(() => {
    if (!editor) return false;
    return editor.isActive('aiHighlight');
  }, [editor]);

  return {
    // Highlight state
    /** Whether AI highlight is active */
    isHighlightActive: aiHighlight.isActive,
    /** Current highlight color */
    highlightColor: aiHighlight.color,
    /** Default highlight color */
    defaultHighlightColor: aiHighlight.defaultColor,

    // Completion state
    /** Whether AI is generating completion */
    isGenerating: aiCompletion.isLoading,
    /** Generated completion text */
    completionText: aiCompletion.text,
    /** Completion error message */
    completionError: aiCompletion.error,

    // Highlight actions
    /** Highlight selected text */
    highlightText,
    /** Remove highlight from selection */
    removeHighlight,
    /** Set default highlight color */
    setHighlightColor,
    /** Check if cursor is in highlighted text */
    isInHighlight,

    // Completion actions
    /** Generate AI completion */
    generateCompletion,
    /** Insert completion at cursor */
    insertCompletion,
    /** Clear completion */
    clearCompletion,
  };
}
