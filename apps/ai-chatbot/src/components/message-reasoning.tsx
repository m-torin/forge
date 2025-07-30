'use client';

import { ChevronDownIcon, LoaderIcon } from '#/components/icons';
import { Markdown } from '#/components/markdown';
import { ANIMATION } from '#/lib/ui-constants';
import { useDisclosure } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Props for MessageReasoning component
 */
interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

/**
 * Message reasoning component with expandable content
 * @param isLoading - Whether reasoning is still loading
 * @param reasoning - Reasoning text content
 */
export function MessageReasoning({ isLoading, reasoning }: MessageReasoningProps) {
  const [isExpanded, { toggle: toggleExpanded }] = useDisclosure(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Reasoned for a few seconds</div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={toggleExpanded}
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: ANIMATION.NORMAL / 1000, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="flex flex-col gap-4 border-l pl-4 text-zinc-600 dark:text-zinc-400"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
