'use client';

import { CheckCircleFillIcon, ChevronDownIcon, GlobeIcon, LockIcon } from '#/components/icons';
import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { useChatVisibility } from '#/hooks/chat/use-chat-visibility';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { cn } from '#/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useMemo, useState } from 'react';

/**
 * Type for chat visibility options
 */
export type VisibilityType = 'private' | 'public';

/**
 * Available visibility options with labels and icons
 */
const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with the link can access this chat',
    icon: <GlobeIcon />,
  },
];

/**
 * Visibility selector component for chat privacy settings
 * @param chatId - Current chat identifier
 * @param className - Additional CSS classes
 * @param selectedVisibilityType - Currently selected visibility
 */
export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { variants, performance } = useAnimationSystem();

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find(visibility => visibility.id === visibilityType),
    [visibilityType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="visibility-selector"
          variant="outline"
          className="hidden md:flex md:h-[34px] md:px-2"
          // Use enhanced button animations
        >
          {/* Enhanced icon with state animation */}
          <motion.span
            key={visibilityType}
            variants={variants.scaleVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: 'transform, opacity' }}
          >
            {selectedVisibility?.icon}
          </motion.span>

          {/* Animated label */}
          <motion.span
            key={`${visibilityType}-label`}
            variants={variants.slideRightVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: 'transform, opacity' }}
          >
            {selectedVisibility?.label}
          </motion.span>

          {/* Animated chevron with open/close state */}
          <motion.span
            animate={{
              rotate: open ? 180 : 0,
              scale: open ? 1.1 : 1,
            }}
            transition={{
              duration: performance.optimizedDuration(0.2),
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{ willChange: 'transform' }}
          >
            <ChevronDownIcon />
          </motion.span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        <motion.div variants={variants.staggerContainerFast} initial="hidden" animate="visible">
          {visibilities.map((visibility, index) => (
            <motion.div
              key={visibility.id}
              variants={variants.slideUpVariants}
              transition={{ delay: performance.optimizedDuration(index * 0.05) }}
              style={{ willChange: 'transform, opacity' }}
            >
              <DropdownMenuItem
                data-testid={`visibility-selector-item-${visibility.id}`}
                onSelect={() => {
                  performance.batchUpdates([
                    () => setVisibilityType(visibility.id),
                    () => setOpen(false),
                  ]);
                }}
                className="group/item flex cursor-pointer flex-row items-center justify-between gap-4"
                data-active={visibility.id === visibilityType}
              >
                {/* Left content with icon and text */}
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ x: 2 }}
                  transition={{ duration: performance.optimizedDuration(0.15) }}
                >
                  {/* Enhanced icon with color animation */}
                  <motion.div
                    className={cn(
                      'flex items-center justify-center transition-colors',
                      visibility.id === visibilityType
                        ? visibility.id === 'private'
                          ? 'text-orange-600'
                          : 'text-blue-600'
                        : 'text-muted-foreground',
                    )}
                    animate={
                      visibility.id === visibilityType
                        ? {
                            scale: [1, 1.1, 1],
                            transition: { duration: performance.optimizedDuration(0.3) },
                          }
                        : {}
                    }
                  >
                    {visibility.icon}
                  </motion.div>

                  <div className="flex flex-col items-start gap-1">
                    <motion.span
                      className="font-medium"
                      animate={
                        visibility.id === visibilityType
                          ? {
                              color: visibility.id === 'private' ? '#ea580c' : '#2563eb',
                            }
                          : {}
                      }
                      transition={{ duration: performance.optimizedDuration(0.2) }}
                    >
                      {visibility.label}
                    </motion.span>
                    {visibility.description && (
                      <motion.div
                        className="text-xs text-muted-foreground"
                        variants={variants.fadeVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {visibility.description}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced check indicator */}
                <AnimatePresence>
                  {visibility.id === visibilityType && (
                    <motion.div
                      className="text-foreground dark:text-foreground"
                      variants={variants.bounceScaleVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <CheckCircleFillIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
