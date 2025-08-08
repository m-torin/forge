'use client';

import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUIComponents } from '../ui-components';

// Create cn utility function for this package
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

// Fallback Button component if not provided by useUIComponents
const DefaultButton = ({ children, className: btnClassName, ...props }: any) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
      btnClassName,
    )}
    {...props}
  >
    {children}
  </button>
);

export function EnhancedThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { Button, Tooltip, TooltipContent, TooltipTrigger } = useUIComponents();

  // Use provided Button or fallback
  const SafeButton = Button || DefaultButton;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={cn('h-9 w-9 p-0', className)}>
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SafeButton
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={cn(
            'relative h-9 w-9 overflow-hidden rounded-full p-0 transition-all duration-300',
            'hover:bg-muted hover:scale-110 active:scale-95',
            className,
          )}
        >
          <AnimatePresence mode="wait">
            {resolvedTheme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-300"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-500"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background:
                resolvedTheme === 'dark'
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
            }}
            transition={{ duration: 0.3 }}
          />
        </SafeButton>
      </TooltipTrigger>
      <TooltipContent>Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode</TooltipContent>
    </Tooltip>
  );
}

export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { Button } = useUIComponents();

  // Use provided Button or fallback
  const SafeButton = Button || DefaultButton;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SafeButton variant="outline" size="sm" className={cn('w-32', className)}>
        <div className="h-4 w-16" />
      </SafeButton>
    );
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className={cn('relative', className)}>
      <SafeButton
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-32 justify-between"
      >
        <div className="flex items-center gap-2">
          <span>{themeOptions.find(t => t.value === theme)?.icon}</span>
          <span className="text-sm">{themeOptions.find(t => t.value === theme)?.label}</span>
        </div>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6,9 12,15 18,9" />
        </motion.svg>
      </SafeButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="bg-popover absolute left-0 top-full z-50 mt-1 w-32 rounded-lg border shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-1">
                {themeOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    className={cn(
                      'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                      'hover:bg-muted focus:bg-muted focus:outline-none',
                      theme === option.value && 'bg-muted',
                    )}
                    onClick={() => {
                      setTheme(option.value);
                      setIsOpen(false);
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.05 }}
                    whileHover={{ x: 2 }}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <button
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme selector"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
