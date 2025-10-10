import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { MutableRefObject } from 'react';

import { buildContentFromDocument } from './functions';

export const documentSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const HEADING_PATTERNS: Record<number, RegExp> = {
  1: /^(#{1})\s$/,
  2: /^(#{1,2})\s$/,
  3: /^(#{1,3})\s$/,
  4: /^(#{1,4})\s$/,
  5: /^(#{1,5})\s$/,
  6: /^(#{1,6})\s$/,
};

export function headingRule(level: number) {
  const safeLevel = Math.max(1, Math.min(6, Math.floor(level)));
  return textblockTypeInputRule(HEADING_PATTERNS[safeLevel], documentSchema.nodes.heading, () => ({
    level: safeLevel,
  }));
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
