import { NodeSelection } from '@tiptap/pm/state';
import { useCurrentEditor } from '@tiptap/react';
import type { BubbleMenuProps as TipTapBubbleMenuProps } from '@tiptap/react/menus';
import { BubbleMenu } from '@tiptap/react/menus';
import type { ReactNode } from 'react';
import { forwardRef, useMemo } from 'react';

export interface EditorBubbleProps extends Omit<TipTapBubbleMenuProps, 'editor'> {
  readonly children: ReactNode;
  readonly options?: TipTapBubbleMenuProps['options'];
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
  ({ children, options, shouldShow, ...rest }, ref) => {
    const { editor: currentEditor } = useCurrentEditor();

    const fallbackShouldShow = useMemo<NonNullable<TipTapBubbleMenuProps['shouldShow']>>(() => {
      return ({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;

        if (
          !editor.isEditable ||
          editor.isActive('image') ||
          empty ||
          selection instanceof NodeSelection
        ) {
          return false;
        }

        return true;
      };
    }, []);

    if (!currentEditor) return null;

    return (
      <div ref={ref}>
        <BubbleMenu
          editor={currentEditor}
          options={options}
          shouldShow={shouldShow ?? fallbackShouldShow}
          {...rest}
        >
          {children}
        </BubbleMenu>
      </div>
    );
  },
);

EditorBubble.displayName = 'EditorBubble';

export default EditorBubble;
