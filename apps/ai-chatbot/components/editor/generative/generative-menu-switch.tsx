import { Button } from '@/components/ui/button';
import { EditorBubble, removeAIHighlight, useEditor } from '@repo/editing';
import { type ReactNode, useEffect } from 'react';
import Magic from '../ui/icons/magic';
import { AISelector } from './ai-selector';

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open && editor) removeAIHighlight(editor);
  }, [open, editor]);

  if (!editor) return null;

  return (
    <EditorBubble
      options={{
        placement: open ? 'bottom-start' : 'top',
        onHide: () => {
          onOpenChange(false);
          editor.chain().unsetHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && <AISelector onOpenChange={onOpenChange} />}
      {!open && (
        <>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
