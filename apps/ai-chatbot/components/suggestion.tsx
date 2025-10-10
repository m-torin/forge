'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

import type { UISuggestion } from '@/lib/editor/suggestions';

import { cn } from '@/lib/utils';
import { ChatBubbleIcon, Cross1Icon } from '@radix-ui/react-icons';
import type { ArtifactKind } from './artifact';
import { Button } from './ui/button';

export const Suggestion = ({
  suggestion,
  onApply,
  artifactKind,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
  artifactKind: ArtifactKind;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();

  return (
    <AnimatePresence>
      {!isExpanded ? (
        <motion.div
          className={cn('cursor-pointer p-1 text-muted-foreground', {
            'absolute -right-8': artifactKind === 'text',
            'sticky right-4 top-0': artifactKind === 'code',
          })}
          onClick={() => {
            setIsExpanded(true);
          }}
          whileHover={{ scale: 1.1 }}
        >
          <ChatBubbleIcon
            className={windowWidth && windowWidth < 768 ? 'h-4 w-4' : 'h-[14px] w-[14px]'}
          />
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute -right-12 z-50 flex w-56 flex-col gap-3 rounded-2xl border bg-background p-3 font-sans text-sm shadow-xl md:-right-16"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 rounded-full bg-muted-foreground/25" />
              <div className="font-medium">Assistant</div>
            </div>
            <button
              type="button"
              className="cursor-pointer text-xs text-gray-500"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <Cross1Icon className="h-3 w-3" />
            </button>
          </div>
          <div>{suggestion.description}</div>
          <Button variant="outline" className="w-fit rounded-full px-3 py-1.5" onClick={onApply}>
            Apply
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
