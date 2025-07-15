'use client';

import { useFormStatus } from 'react-dom';

import { LoaderIcon } from '#/components/icons';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';

import { Button } from '#/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Submit button component with loading and success states
 * @param children - Button content
 * @param isSuccessful - Whether the submission was successful
 */
export function SubmitButton({
  children,
  isSuccessful,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
}) {
  const { pending } = useFormStatus();
  const { variants } = useAnimationSystem();

  return (
    <motion.div
      variants={variants.hoverVariants}
      initial="rest"
      whileHover={!pending && !isSuccessful ? 'hover' : 'rest'}
      whileTap={!pending && !isSuccessful ? 'tap' : 'rest'}
    >
      <Button
        type={pending ? 'button' : 'submit'}
        aria-disabled={pending || isSuccessful}
        disabled={pending || isSuccessful}
        className="relative overflow-hidden"
      >
        <motion.span
          variants={variants.fadeVariants}
          animate={pending || isSuccessful ? 'hidden' : 'visible'}
        >
          {children}
        </motion.span>

        {/* Loading State */}
        <AnimatePresence>
          {pending && (
            <motion.div
              variants={variants.scaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <LoaderIcon />
              </motion.div>
              <span className="ml-2">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {isSuccessful && (
            <motion.div
              variants={variants.bounceScaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center text-green-600"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                ✓
              </motion.span>
              <span className="ml-2">Success!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <output aria-live="polite" className="sr-only">
          {pending ? 'Processing...' : isSuccessful ? 'Success!' : 'Submit form'}
        </output>
      </Button>
    </motion.div>
  );
}
