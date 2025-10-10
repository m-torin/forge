'use client';

import { motion } from 'framer-motion';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ShimmerText({ children, className = '', speed = 3 }: ShimmerTextProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: speed,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
      style={{
        background:
          'linear-gradient(90deg, currentColor 0%, rgba(255, 255, 255, 0.8) 50%, currentColor 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      {children}
    </motion.div>
  );
}

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ShimmerCard({ children, className = '', speed = 2 }: ShimmerCardProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: [-300, 300],
        }}
        transition={{
          duration: speed,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 3,
          ease: 'linear',
        }}
      />
    </div>
  );
}
