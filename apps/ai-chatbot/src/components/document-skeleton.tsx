'use client';

import { ArtifactKind } from '#/components/artifact';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { motion } from 'framer-motion';

/**
 * Document skeleton component with animated loading states
 * @param artifactKind - Type of artifact to show appropriate skeleton
 */
export const DocumentSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => {
  const { variants } = useAnimationSystem();

  return artifactKind === 'image' ? (
    <div className="flex h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4">
      <motion.div
        className="size-96 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
    </div>
  ) : (
    <motion.div
      className="flex w-full flex-col gap-4"
      variants={variants.staggerContainerFast}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="h-12 w-1/2 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-5 w-full rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-5 w-full rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-5 w-1/3 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-5 w-52 rounded-lg bg-transparent"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-8 w-52 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-5 w-2/3 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
    </motion.div>
  );
};

/**
 * Inline document skeleton component for smaller loading states
 */
export const InlineDocumentSkeleton = () => {
  const { variants } = useAnimationSystem();

  return (
    <motion.div
      className="flex w-full flex-col gap-4"
      variants={variants.staggerContainerFast}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="h-4 w-48 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-3/4 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-1/2 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-64 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-40 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-36 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
      <motion.div
        className="h-4 w-64 rounded-lg bg-muted-foreground/20"
        variants={variants.pulseSubtleVariants}
        animate="pulse"
      />
    </motion.div>
  );
};
