'use client';

import { AdvancedBackground } from '@/components/advanced-background';
import { MagneticHover, TiltCard } from '@/components/magnetic-hover';
import {
  BreathingIcon,
  CascadingReveal,
  FloatingAction,
  MorphingShape,
  PulsingGlow,
  RippleEffect,
} from '@/components/micro-animations';
import { ShimmerText } from '@/components/shimmer-effect';
import { SpotlightEffect } from '@/components/spotlight-effect';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, MessageSquare, Sparkles, Zap } from 'lucide-react';
import type { User } from 'next-auth';
import Link from 'next/link';

interface EnhancedModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  delay?: number;
  accentColor: string;
}

function EnhancedModeCard({
  title,
  description,
  icon,
  href,
  gradient,
  delay = 0,
  accentColor,
}: EnhancedModeCardProps) {
  return (
    <FloatingAction delay={delay}>
      <Link href={href}>
        <MagneticHover strength={0.2} range={150}>
          <SpotlightEffect>
            <TiltCard maxTilt={8}>
              <RippleEffect color={`${accentColor}30`}>
                <PulsingGlow glowColor={`${accentColor}50`}>
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      y: -8,
                      transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card
                      className={`relative cursor-pointer border-2 p-8 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 ${gradient} overflow-hidden border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-lg hover:border-white/40 hover:shadow-2xl`}
                    >
                      {/* Background decoration */}
                      <div className="absolute right-0 top-0 h-20 w-20 opacity-10">
                        <MorphingShape size={80} color={accentColor} />
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
                        {/* Icon with advanced animations */}
                        <div className="relative">
                          <motion.div
                            className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-sm"
                            whileHover={{
                              scale: 1.1,
                              rotate: 5,
                              boxShadow: `0 10px 30px ${accentColor}40`,
                              transition: { duration: 0.3, ease: 'easeOut' },
                            }}
                          >
                            <BreathingIcon>{icon}</BreathingIcon>
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

                        {/* Text content */}
                        <div className="space-y-3">
                          <ShimmerText className="text-2xl font-bold text-white transition-colors group-hover:text-white">
                            {title}
                          </ShimmerText>
                          <p className="max-w-xs text-sm leading-relaxed text-white/80">
                            {description}
                          </p>
                        </div>

                        {/* Enhanced button */}
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.button
                            className="relative flex items-center gap-2 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 px-8 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:shadow-xl"
                            whileHover={{
                              boxShadow: `0 0 20px ${accentColor}60`,
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
                          </motion.button>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </PulsingGlow>
              </RippleEffect>
            </TiltCard>
          </SpotlightEffect>
        </MagneticHover>
      </Link>
    </FloatingAction>
  );
}

interface EnhancedModeSelectorProps {
  user: User;
}

export function EnhancedModeSelector({ user }: EnhancedModeSelectorProps) {
  return (
    <AdvancedBackground className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header section with enhanced animations */}
        <CascadingReveal className="mb-16 text-center" stagger={0.2}>
          {[
            <motion.div key="welcome" className="relative">
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
            </motion.div>,

            <motion.p key="subtitle" className="text-xl font-light text-white/80 md:text-2xl">
              What would you like to create today?
            </motion.p>,
          ]}
        </CascadingReveal>

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
            <EnhancedModeCard
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
            <EnhancedModeCard
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
    </AdvancedBackground>
  );
}
