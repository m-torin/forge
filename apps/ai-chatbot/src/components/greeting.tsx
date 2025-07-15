import { RESPONSIVE } from '#/lib/ui-constants';
import { motion } from 'framer-motion';

/**
 * Greeting component displayed when starting a new chat
 */
export const Greeting = () => {
  return (
    <div
      key="overview"
      className={`mx-auto flex size-full max-w-3xl flex-col justify-center ${RESPONSIVE.LAYOUT.CONTENT_MOBILE} md:mt-20`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className={`${RESPONSIVE.TYPOGRAPHY.HEADING.LG} font-semibold`}
      >
        Hello there!
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className={`${RESPONSIVE.TYPOGRAPHY.HEADING.LG} text-zinc-500`}
      >
        How can I help you today?
      </motion.div>
    </div>
  );
};
