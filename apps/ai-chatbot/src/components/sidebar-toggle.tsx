import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '#/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';

import { SidebarLeftIcon, SidebarRightIcon } from '#/components/icons';
import { KeyboardHint } from '#/components/keyboard-navigation';
import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { RESPONSIVE } from '#/lib/ui-constants';

/**
 * Sidebar toggle button with animated icon transitions
 * @param _className - CSS class name (unused)
 */
export function SidebarToggle({ className: _className }: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open } = useSidebar();
  const { variants, performance } = useAnimationSystem();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={() => {
            performance.batchUpdates([toggleSidebar]);
          }}
          variant="outline"
          className={`group relative md:h-fit md:px-2 ${RESPONSIVE.TOUCH_TARGET.SMALL}`}
          // Disable the new button animation for this specific case to control it manually
          disableAnimation={true}
        >
          {/* Enhanced icon with state transition animation */}
          <motion.span
            className="relative flex items-center justify-center"
            animate={{
              color: open ? 'rgb(59 130 246)' : 'currentColor', // blue-500
              scale: open ? 1.1 : 1,
            }}
            transition={{
              duration: performance.optimizedDuration(0.2),
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              willChange: 'transform, color',
            }}
          >
            {/* Icon transition with rotation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={open ? 'open' : 'closed'}
                variants={variants.rotateVariants}
                initial={{
                  rotate: open ? -90 : 90,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  rotate: open ? 90 : -90,
                  opacity: 0,
                  scale: 0.8,
                }}
                transition={{
                  type: performance.isHighPerformanceDevice ? 'spring' : 'tween',
                  stiffness: performance.isHighPerformanceDevice ? 300 : undefined,
                  damping: performance.isHighPerformanceDevice ? 25 : undefined,
                  duration: performance.isHighPerformanceDevice
                    ? undefined
                    : performance.optimizedDuration(0.2),
                  ease: performance.isHighPerformanceDevice ? undefined : [0.4, 0.0, 0.2, 1],
                }}
                style={{
                  willChange: 'transform, opacity',
                }}
              >
                {open ? <SidebarRightIcon size={16} /> : <SidebarLeftIcon size={16} />}
              </motion.div>
            </AnimatePresence>

            {/* Active state indicator */}
            <AnimatePresence>
              {open && (
                <motion.div
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500"
                  variants={variants.scaleVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    willChange: 'transform, opacity',
                  }}
                />
              )}
            </AnimatePresence>
          </motion.span>

          {/* Enhanced keyboard hint with fade animation */}
          <AnimatePresence>
            <motion.div
              variants={variants.fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: performance.optimizedDuration(0.5) }}
            >
              <KeyboardHint shortcut="⌘/" className="absolute -bottom-6 left-0" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">
        {/* Dynamic tooltip with state indication */}
        <motion.span
          key={open ? 'close' : 'open'}
          variants={variants.slideUpVariants}
          initial="hidden"
          animate="visible"
        >
          {open ? 'Close' : 'Open'} Sidebar
        </motion.span>
      </TooltipContent>
    </Tooltip>
  );
}
