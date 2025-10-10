import type { Editor } from '@tiptap/core';
import { Fragment, type Node } from '@tiptap/pm/model';

/**
 * Get the text before a given position in markdown format
 *
 * @param editor - TipTap editor instance
 * @param position - Position to get text before
 * @returns Markdown text before the position
 */
export const getPrevText = (editor: Editor, position: number): string => {
  const nodes: Node[] = [];
  editor.state.doc.forEach((node, pos) => {
    if (pos >= position) return false;
    nodes.push(node);
    return true;
  });
  const fragment = Fragment.fromArray(nodes);
  const doc = editor.state.doc.copy(fragment);

  return ((editor.storage as any).markdown as any).serializer.serialize(doc) as string;
};

/**
 * Get all content from the editor in markdown format
 *
 * @param editor - TipTap editor instance
 * @returns All content as markdown
 */
export const getAllContent = (editor: Editor): string => {
  const fragment = editor.state.doc.content;
  const doc = editor.state.doc.copy(fragment);

  return ((editor.storage as any).markdown as any).serializer.serialize(doc) as string;
};

/**
 * Check if URL is valid
 *
 * @param url - URL to validate
 * @returns true if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Get URL from string (adds https:// if needed)
 *
 * @param str - String to convert to URL
 * @returns URL or null if invalid
 */
export function getUrlFromString(str: string): string | null {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
  return null;
}
