import { textblockTypeInputRule } from 'prosemirror-inputrules';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { MutableRefObject } from 'react';

import { buildContentFromDocument } from './functions';
import { documentSchema } from './schema';

export { documentSchema };

export function headingRule(level: number) {
  // Create safe regex pattern for heading levels
  const levelPattern = Math.min(Math.max(1, level), 6); // Clamp between 1-6
  const pattern = `^(#{1,${levelPattern}})\\s$`;

  return textblockTypeInputRule(
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(pattern),
    documentSchema.nodes.heading,
    () => ({ level }),
  );
}

export const handleTransaction = ({
  transaction,
  editorRef,
  onSaveContent,
}: {
  transaction: Transaction;
  editorRef: MutableRefObject<EditorView | null>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) => {
  if (!editorRef || !editorRef.current) return;

  const newState = editorRef.current.state.apply(transaction);
  editorRef.current.updateState(newState);

  if (transaction.docChanged && !transaction.getMeta('no-save')) {
    const updatedContent = buildContentFromDocument(newState.doc);

    if (transaction.getMeta('no-debounce')) {
      onSaveContent(updatedContent, false);
    } else {
      onSaveContent(updatedContent, true);
    }
  }
};
