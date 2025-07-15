'use client';

import { clsx } from 'clsx';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Create cn utility function for this package
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

// Re-export TypingAnimation from its dedicated file
export { TypingAnimation } from './typing-animation';

// Staggered children animation
export function StaggeredContainer({
  children,
  staggerDelay = 0.1,
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered animation
export function ScrollReveal({
  children,
  direction = 'up',
  className,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  threshold?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration: 0.6,
        ease: 'anticipate',
      }}
    >
      {children}
    </motion.div>
  );
}

// Magnetic button effect
export function MagneticButton({
  children,
  className,
  strength = 0.2,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'
>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setMousePosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}

// Floating animation
export function FloatingElement({
  children,
  className,
  amplitude = 10,
  duration = 3,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
export function PulseElement({
  children,
  className,
  scale = 1.05,
  duration = 2,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll effect
export function ParallaxElement({
  children,
  className,
  speed = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// Morphing icon animation
export function MorphingIcon({
  icons,
  currentIndex = 0,
  className,
}: {
  icons: React.ReactNode[];
  currentIndex?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          {icons[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Loading dots animation
export function LoadingDots({
  className,
  dotClassName = 'w-1 h-1 bg-current rounded-full',
}: {
  className?: string;
  dotClassName?: string;
}) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className={dotClassName}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Ripple effect
export function RippleButton({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'
>) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    props.onClick?.(e);
  };

  return (
    <button className={cn('relative overflow-hidden', className)} onClick={handleClick} {...props}>
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 1,
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            width: 400,
            height: 400,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'anticipate',
          }}
        />
      ))}
    </button>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Attention-seeking animation
export function AttentionSeeker({
  children,
  type = 'bounce',
  trigger = false,
  className,
}: {
  children: React.ReactNode;
  type?: 'bounce' | 'shake' | 'pulse' | 'wobble';
  trigger?: boolean;
  className?: string;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      const animations = {
        bounce: {
          y: [0, -10, 0, -5, 0],
          transition: { duration: 0.6 },
        },
        shake: {
          x: [0, -5, 5, -5, 5, 0],
          transition: { duration: 0.5 },
        },
        pulse: {
          scale: [1, 1.1, 1, 1.05, 1],
          transition: { duration: 0.6 },
        },
        wobble: {
          rotate: [0, -5, 5, -3, 3, 0],
          transition: { duration: 0.8 },
        },
      };

      controls.start(animations[type]);
    }
  }, [trigger, type, controls]);

  return (
    <motion.div className={className} animate={controls}>
      {children}
    </motion.div>
  );
}
