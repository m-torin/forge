'use client';

import { Card } from '@/components/ui/card';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, FileText, MessageSquare, Sparkles, Zap } from 'lucide-react';
import type { User } from 'next-auth';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  accentColor?: string;
  delay?: number;
}

function ModeCard({
  title,
  description,
  icon,
  href,
  gradient,
  accentColor = 'rgba(59, 130, 246',
  delay = 0,
}: ModeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic hover effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    mouseX.set(deltaX);
    mouseY.set(deltaY);
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: [0, -5, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: {
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          delay: delay + 0.6,
          ease: 'easeInOut',
        },
      }}
    >
      <Link href={href}>
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          whileHover={{
            scale: 1.02,
            y: -8,
            transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
          }}
          whileTap={{ scale: 0.98 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="group relative"
        >
          <Card
            className={`relative cursor-pointer border-2 p-8 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 ${gradient} overflow-hidden border-white/60 bg-gradient-to-br from-white/95 to-white/90 shadow-lg hover:border-white/80 hover:shadow-2xl`}
          >
            {/* Spotlight effect */}
            {isHovered && (
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${accentColor}, 0.2), transparent 70%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
              />
            )}

            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-20 w-20 opacity-10">
              <motion.div
                className="h-full w-full bg-current"
                animate={{
                  borderRadius: [
                    '50% 50% 50% 50%',
                    '30% 70% 50% 50%',
                    '50% 30% 70% 50%',
                    '50% 50% 30% 70%',
                    '50% 50% 50% 50%',
                  ],
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Floating particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-white/30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
              {/* Icon with breathing animation */}
              <div className="relative">
                <motion.div
                  className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-sm"
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: `0 10px 30px ${accentColor}, 0.4)`,
                    transition: { duration: 0.3, ease: 'easeOut' },
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  {icon}
                </motion.div>

                {/* Sparkle effect */}
                <motion.div
                  className="absolute -right-1 -top-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-400 opacity-60" />
                </motion.div>
              </div>

              {/* Text content with shimmer */}
              <div className="space-y-3">
                <motion.h2
                  className="relative overflow-hidden text-2xl font-bold text-gray-900 transition-colors group-hover:text-gray-800"
                  whileHover={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: 'linear',
                  }}
                  style={{
                    background:
                      'linear-gradient(90deg, currentColor 0%, rgba(55, 65, 81, 0.8) 50%, currentColor 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </motion.h2>
                <p className="max-w-xs text-sm font-medium leading-relaxed text-gray-700">
                  {description}
                </p>
              </div>

              {/* Enhanced button */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="relative flex items-center gap-2 overflow-hidden rounded-full border-2 border-gray-300/50 bg-white/90 px-8 py-3 font-medium text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-gray-400/50 hover:bg-white hover:shadow-xl"
                  whileHover={{
                    boxShadow: `0 0 20px ${accentColor}, 0.6)`,
                  }}
                >
                  {/* Button shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: [-300, 300],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 3,
                      ease: 'linear',
                    }}
                  />

                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative z-10"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}

interface ModeSelectorProps {
  user: User;
}

export function ModeSelector({ user }: ModeSelectorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Mouse-following gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 50%)`,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 10,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Geometric shapes */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-lg border border-white/10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 80}px`,
                height: `${20 + Math.random() * 80}px`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Enhanced header with cascading animations */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.div
            className="relative mb-6"
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
                scale: 0.9,
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.25, 0.4, 0.25, 1],
                },
              },
            }}
          >
            <motion.h1
              className="mb-6 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            >
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </motion.h1>

            {/* Decorative elements */}
            <motion.div
              className="absolute -right-4 -top-4 opacity-60"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            >
              <Zap className="h-8 w-8 text-yellow-400" />
            </motion.div>
          </motion.div>

          <motion.p
            className="text-xl font-light text-white/80 md:text-2xl"
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
                scale: 0.9,
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.25, 0.4, 0.25, 1],
                },
              },
            }}
          >
            What would you like to create today?
          </motion.p>
        </motion.div>

        {/* Cards grid with staggered animations */}
        <motion.div
          className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.3,
                delayChildren: 1.2,
              },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
              },
            }}
          >
            <ModeCard
              title="Start Chatting"
              description="Engage in intelligent conversations with AI assistants, ask complex questions, and get personalized help with your tasks"
              icon={
                <motion.div
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    repeatDelay: 2,
                  }}
                >
                  <MessageSquare size={36} className="text-blue-300" />
                </motion.div>
              }
              href="/chat"
              gradient="bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-cyan-500/20"
              accentColor="rgba(59, 130, 246"
              delay={1.4}
            />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
              },
            }}
          >
            <ModeCard
              title="Start Writing"
              description="Create and edit documents with advanced AI-powered writing assistance, rich text editing, and collaborative features"
              icon={
                <motion.div
                  animate={{
                    rotateZ: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    repeatDelay: 3,
                  }}
                >
                  <FileText size={36} className="text-emerald-300" />
                </motion.div>
              }
              href="/editor"
              gradient="bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/20"
              accentColor="rgba(34, 197, 94"
              delay={1.8}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
