'use client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { APPLE_BREAKPOINTS, RESPONSIVE } from '#/lib/ui-constants';
import { useClickOutside, useToggle, useViewportSize } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { nanoid } from 'nanoid';
import {
  type Dispatch,
  memo,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { artifactDefinitions, type ArtifactKind } from '#/components/artifact';
import type { ArtifactToolbarItem } from '#/components/create-artifact';
import { ArrowUpIcon, StopIcon, SummarizeIcon } from '#/components/icons';
import type { UseChatHelpers } from '@ai-sdk/react';

/**
 * Props for Tool component
 */
type ToolProps = {
  description: string;
  icon: ReactNode;
  selectedTool: string | null;
  setSelectedTool: Dispatch<SetStateAction<string | null>>;
  isToolbarVisible?: boolean;
  setIsToolbarVisible?: Dispatch<SetStateAction<boolean>>;
  isAnimating: boolean;
  append: UseChatHelpers['append'];
  onClick: ({ append }: { append: UseChatHelpers['append'] }) => void;
};

/**
 * Individual toolbar tool component with hover and selection states
 * @param description - Tool description/label
 * @param icon - Tool icon component
 * @param selectedTool - Currently selected tool
 * @param setSelectedTool - Function to set selected tool
 * @param isToolbarVisible - Whether toolbar is visible
 * @param setIsToolbarVisible - Function to set toolbar visibility
 * @param isAnimating - Whether tool is animating
 * @param append - Chat append function
 * @param onClick - Tool click handler
 */
const Tool = ({
  description,
  icon,
  selectedTool,
  setSelectedTool,
  isToolbarVisible,
  setIsToolbarVisible,
  isAnimating,
  append,
  onClick,
}: ToolProps) => {
  const [isHovered, toggleHovered] = useToggle([false, true]);
  const { width: windowWidth } = useViewportSize();
  const isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;

  useEffect(() => {
    if (selectedTool !== description) {
      toggleHovered(false);
    }
  }, [selectedTool, description, toggleHovered]);

  const handleSelect = () => {
    if (!isToolbarVisible && setIsToolbarVisible) {
      setIsToolbarVisible(true);
      return;
    }

    if (!selectedTool) {
      toggleHovered(true);
      setSelectedTool(description);
      return;
    }

    if (selectedTool !== description) {
      setSelectedTool(description);
    } else {
      setSelectedTool(null);
      onClick({ append });
    }
  };

  return (
    <Tooltip open={isHovered && !isAnimating && !isMobile}>
      <TooltipTrigger asChild>
        <motion.div
          className={cx(
            'rounded-full',
            // Mobile-optimized touch targets
            isMobile ? 'min-h-[48px] min-w-[48px] p-4' : 'p-3',
            RESPONSIVE.TOUCH_TARGET.MEDIUM,
            {
              'bg-primary !text-primary-foreground': selectedTool === description,
            },
          )}
          onHoverStart={() => {
            if (!isMobile) toggleHovered(true);
          }}
          onHoverEnd={() => {
            if (selectedTool !== description) toggleHovered(false);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSelect();
            }
          }}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          whileHover={{ scale: isMobile ? 1.05 : 1.1 }}
          whileTap={{ scale: 0.92 }}
          exit={{
            scale: 0.9,
            opacity: 0,
            transition: { duration: 0.1 },
          }}
          onClick={() => {
            handleSelect();
          }}
          style={{
            // Enhanced touch feedback for mobile
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {selectedTool === description ? <ArrowUpIcon /> : icon}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        side={isMobile ? 'top' : 'left'}
        sideOffset={isMobile ? 8 : 16}
        className="rounded-2xl bg-foreground p-3 px-4 text-background"
      >
        {description}
      </TooltipContent>
    </Tooltip>
  );
};

const randomArr = [...Array(6)].map(_x => nanoid(5));

/**
 * Reading level selector component with drag interface
 * @param setSelectedTool - Function to set selected tool
 * @param append - Chat append function
 * @param isAnimating - Whether component is animating
 */
const ReadingLevelSelector = ({
  setSelectedTool,
  append,
  isAnimating,
}: {
  setSelectedTool: Dispatch<SetStateAction<string | null>>;
  isAnimating: boolean;
  append: UseChatHelpers['append'];
}) => {
  const LEVELS = [
    'Elementary',
    'Middle School',
    'Keep current level',
    'High School',
    'College',
    'Graduate',
  ];

  const y = useMotionValue(-40 * 2);
  const dragConstraints = 5 * 40 + 2;
  const yToLevel = useTransform(y, [0, -dragConstraints], [0, 5]);

  const [currentLevel, setCurrentLevel] = useState(2);
  const [hasUserSelectedLevel, toggleUserSelectedLevel] = useToggle([false, true]);

  useEffect(() => {
    const unsubscribe = yToLevel.on('change', latest => {
      const level = Math.min(5, Math.max(0, Math.round(Math.abs(latest))));
      setCurrentLevel(level);
    });

    return () => unsubscribe();
  }, [yToLevel]);

  return (
    <div className="relative flex flex-col items-center justify-end">
      {randomArr.map(id => (
        <motion.div
          key={id}
          className="flex size-[40px] flex-row items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="size-2 rounded-full bg-muted-foreground/40" />
        </motion.div>
      ))}

      <TooltipProvider>
        <Tooltip open={!isAnimating}>
          <TooltipTrigger asChild>
            <motion.div
              className={cx(
                'absolute flex flex-row items-center rounded-full border bg-background p-3',
                {
                  'bg-primary text-primary-foreground': currentLevel !== 2,
                  'bg-background text-foreground': currentLevel === 2,
                },
              )}
              style={{ y }}
              drag="y"
              dragElastic={0}
              dragMomentum={false}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              dragConstraints={{ top: -dragConstraints, bottom: 0 }}
              onDragStart={() => {
                toggleUserSelectedLevel(false);
              }}
              onDragEnd={() => {
                if (currentLevel === 2) {
                  setSelectedTool(null);
                } else {
                  toggleUserSelectedLevel(true);
                }
              }}
              onClick={() => {
                if (currentLevel !== 2 && hasUserSelectedLevel) {
                  append({
                    role: 'user',
                    parts: [
                      {
                        type: 'text',
                        text: `Please adjust the reading level to ${LEVELS[currentLevel]} level.`,
                      },
                    ],
                  });

                  setSelectedTool(null);
                }
              }}
            >
              {currentLevel === 2 ? <SummarizeIcon /> : <ArrowUpIcon />}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={16}
            className="rounded-2xl bg-foreground p-3 px-4 text-sm text-background"
          >
            {LEVELS[currentLevel]}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

/**
 * Tools container component managing primary and secondary tools
 * @param isToolbarVisible - Whether toolbar is visible
 * @param selectedTool - Currently selected tool
 * @param setSelectedTool - Function to set selected tool
 * @param append - Chat append function
 * @param isAnimating - Whether tools are animating
 * @param setIsToolbarVisible - Function to set toolbar visibility
 * @param tools - Array of toolbar tool items
 */
export const Tools = ({
  isToolbarVisible,
  selectedTool,
  setSelectedTool,
  append,
  isAnimating,
  setIsToolbarVisible,
  tools,
}: {
  isToolbarVisible: boolean;
  selectedTool: string | null;
  setSelectedTool: Dispatch<SetStateAction<string | null>>;
  append: UseChatHelpers['append'];
  isAnimating: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  tools: Array<ArtifactToolbarItem>;
}) => {
  const [primaryTool, ...secondaryTools] = tools;

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <AnimatePresence>
        {isToolbarVisible &&
          secondaryTools.map(secondaryTool => (
            <Tool
              key={secondaryTool.description}
              description={secondaryTool.description}
              icon={secondaryTool.icon}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              append={append}
              isAnimating={isAnimating}
              onClick={secondaryTool.onClick}
            />
          ))}
      </AnimatePresence>

      <Tool
        description={primaryTool.description}
        icon={primaryTool.icon}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        isToolbarVisible={isToolbarVisible}
        setIsToolbarVisible={setIsToolbarVisible}
        append={append}
        isAnimating={isAnimating}
        onClick={primaryTool.onClick}
      />
    </motion.div>
  );
};

/**
 * Main toolbar component with tools and responsive behavior
 * @param isToolbarVisible - Whether toolbar is visible
 * @param setIsToolbarVisible - Function to set toolbar visibility
 * @param append - Chat append function
 * @param status - Chat streaming status
 * @param stop - Function to stop chat streaming
 * @param setMessages - Function to update messages
 * @param artifactKind - Type of artifact for tool selection
 */
const PureToolbar = ({
  isToolbarVisible,
  setIsToolbarVisible,
  append,
  status,
  stop,
  setMessages,
  artifactKind,
}: {
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  status: UseChatHelpers['status'];
  append: UseChatHelpers<any, any>['append'];
  stop: UseChatHelpers<any, any>['stop'];
  setMessages: UseChatHelpers<any, any>['setMessages'];
  artifactKind: ArtifactKind;
}) => {
  // const toolbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { width: windowWidth } = useViewportSize();

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Responsive configuration
  const isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;
  const _isTablet =
    windowWidth >= APPLE_BREAKPOINTS.IPAD_MINI && windowWidth < APPLE_BREAKPOINTS.IPAD_PRO_12;

  const toolbarRef = useClickOutside(() => {
    setIsToolbarVisible(false);
    setSelectedTool(null);
  });

  const startCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSelectedTool(null);
      setIsToolbarVisible(false);
    }, 2000);
  };

  const cancelCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'streaming') {
      setIsToolbarVisible(false);
    }
  }, [status, setIsToolbarVisible]);

  const artifactDefinition = artifactDefinitions.find(
    definition => definition.kind === artifactKind,
  );

  if (!artifactDefinition) {
    throw new Error('Artifact definition not found!');
  }

  const toolsByArtifactKind = artifactDefinition.toolbar;

  if (toolsByArtifactKind.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={isMobile ? 300 : 0}>
      <motion.div
        className={cx(
          'absolute flex cursor-pointer flex-col justify-end rounded-full border bg-background shadow-lg',
          // Responsive positioning and sizing
          isMobile ? 'bottom-4 right-4 p-2' : 'bottom-6 right-6 p-1.5',
          // Mobile safe area handling
          'pb-safe-bottom pr-safe-right',
        )}
        initial={{ opacity: 0, y: -20, scale: 1 }}
        animate={
          isToolbarVisible
            ? selectedTool === 'adjust-reading-level'
              ? {
                  opacity: 1,
                  y: 0,
                  height: isMobile ? 6 * 56 : 6 * 43,
                  transition: { delay: 0 },
                  scale: isMobile ? 1 : 0.95,
                }
              : {
                  opacity: 1,
                  y: 0,
                  height: isMobile
                    ? toolsByArtifactKind.length * 64
                    : toolsByArtifactKind.length * 50,
                  transition: { delay: 0 },
                  scale: 1,
                }
            : {
                opacity: 1,
                y: 0,
                height: isMobile ? 64 : 54,
                transition: { delay: 0 },
              }
        }
        exit={{ opacity: 0, y: -20, transition: { duration: 0.1 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onHoverStart={() => {
          if (status === 'streaming' || isMobile) return;

          cancelCloseTimer();
          setIsToolbarVisible(true);
        }}
        onHoverEnd={() => {
          if (status === 'streaming' || isMobile) return;

          startCloseTimer();
        }}
        onTouchStart={() => {
          // Mobile touch handling
          if (isMobile && status !== 'streaming') {
            cancelCloseTimer();
            setIsToolbarVisible(true);
          }
        }}
        onAnimationStart={() => {
          setIsAnimating(true);
        }}
        onAnimationComplete={() => {
          setIsAnimating(false);
        }}
        ref={toolbarRef}
        style={{
          // Enhanced touch feedback for mobile
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {status === 'streaming' ? (
          <motion.div
            key="stop-icon"
            initial={{ scale: 1 }}
            animate={{ scale: isMobile ? 1.2 : 1.4 }}
            exit={{ scale: 1 }}
            className={cx(
              // Mobile-optimized padding and touch target
              isMobile ? 'min-h-[48px] min-w-[48px] p-4' : 'p-3',
              RESPONSIVE.TOUCH_TARGET.MEDIUM,
            )}
            onClick={() => {
              stop();
              setMessages(messages => messages);
            }}
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <StopIcon />
          </motion.div>
        ) : selectedTool === 'adjust-reading-level' ? (
          <ReadingLevelSelector
            key="reading-level-selector"
            append={append}
            setSelectedTool={setSelectedTool}
            isAnimating={isAnimating}
          />
        ) : (
          <Tools
            key="tools"
            append={append}
            isAnimating={isAnimating}
            isToolbarVisible={isToolbarVisible}
            selectedTool={selectedTool}
            setIsToolbarVisible={setIsToolbarVisible}
            setSelectedTool={setSelectedTool}
            tools={toolsByArtifactKind}
          />
        )}
      </motion.div>
    </TooltipProvider>
  );
};

/**
 * Memoized toolbar component for performance optimization
 */
export const Toolbar = memo(PureToolbar, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isToolbarVisible !== nextProps.isToolbarVisible) return false;
  if (prevProps.artifactKind !== nextProps.artifactKind) return false;

  return true;
});
