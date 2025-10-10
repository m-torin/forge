'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface SpotlightEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function SpotlightEffect({
  children,
  className = '',
  color = 'rgba(59, 130, 246, 0.2)',
}: SpotlightEffectProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };

    const handlePointerEnter = () => setIsHovered(true);
    const handlePointerLeave = () => setIsHovered(false);
    const handleFocus = () => setIsHovered(true);
    const handleBlur = () => setIsHovered(false);

    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('focusin', handleFocus);
    element.addEventListener('focusout', handleBlur);

    return () => {
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('focusin', handleFocus);
      element.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      role="group"
      tabIndex={0}
    >
      {children}

      {/* Spotlight overlay */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${color}, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function GlowEffect({ children, className = '', intensity = 1 }: GlowEffectProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        filter: `drop-shadow(0 0 ${20 * intensity}px rgba(59, 130, 246, 0.5))`,
        transition: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
}
