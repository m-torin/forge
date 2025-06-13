'use client';

import { Button, Container, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingStore, IconGift, IconMail, IconSparkles, IconStar } from '@tabler/icons-react';
import { useState } from 'react';

interface MaintenancePageProps {
  locale?: string;
}

export function MaintenancePage({ locale = 'en' }: MaintenancePageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success notification
      notifications.show({
        title: 'Welcome to LetsFindMy!',
        message: "You're on the list! We'll notify you as soon as we launch.",
        color: 'green',
      });

      setHasSubmitted(true);
      form.reset();
    } catch (error: any) {
      notifications.show({
        title: 'Oops!',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements - slower, gentler */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 opacity-20 blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 opacity-10 blur-3xl animate-pulse-slow animation-delay-4000" />
      </div>

      {/* Floating icons - slower animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <IconGift
          className="absolute top-20 left-10 text-purple-400 opacity-60 animate-float-gentle"
          size={24}
        />
        <IconBuildingStore
          className="absolute top-40 right-20 text-pink-400 opacity-60 animate-float-gentle animation-delay-2000"
          size={28}
        />
        <IconSparkles
          className="absolute bottom-40 left-20 text-blue-400 opacity-60 animate-float-gentle animation-delay-4000"
          size={32}
        />
        <IconStar
          className="absolute bottom-20 right-10 text-orange-400 opacity-60 animate-float-gentle animation-delay-1000"
          size={20}
        />
      </div>

      {/* Main content */}
      <Container className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-75 animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
                <IconGift className="text-white" size={48} />
              </div>
            </div>
          </div>

          {/* Brand name */}
          <Title
            className="mb-2 text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100"
            order={2}
          >
            LetsFindMy
          </Title>

          {/* Hero text */}
          <Title
            className="mb-6 text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-gradient"
            order={1}
          >
            Something Amazing is Coming
          </Title>

          {/* Anticipation dots */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce-subtle" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce-subtle animation-delay-200" />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce-subtle animation-delay-400" />
          </div>

          <Text
            className="mb-8 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
            size="xl"
          >
            We're building the future of ecommerce and universal gift registries. One platform to
            find, save, and share everything you love.
          </Text>

          {/* Email signup form */}
          {!hasSubmitted ? (
            <form onSubmit={form.onSubmit(handleSubmit)} className="max-w-md mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-3">
                <TextInput
                  {...form.getInputProps('email')}
                  className="flex-1"
                  disabled={isSubmitting}
                  leftSection={<IconMail size={20} />}
                  placeholder="Enter your email"
                  radius="xl"
                  size="lg"
                  styles={{
                    input: {
                      borderWidth: '2px',
                      transition: 'all 0.3s ease',
                      '&:focus': {
                        borderColor: 'var(--mantine-color-purple-5)',
                        animation: 'inputGlow 2s ease-in-out infinite',
                      },
                    },
                  }}
                />
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  loading={isSubmitting}
                  radius="xl"
                  size="lg"
                  type="submit"
                >
                  Get Early Access
                </Button>
              </div>
              <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Be the first to know when we launch. No spam, ever.
              </Text>
            </form>
          ) : (
            <div className="max-w-md mx-auto mb-12 p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Title className="mb-2 text-green-700 dark:text-green-400" order={3}>
                You're on the list! 🎉
              </Title>
              <Text className="text-green-600 dark:text-green-500">
                We'll send you an exclusive invite as soon as we're ready.
              </Text>
            </div>
          )}

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="group p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white transition-transform duration-300 group-hover:rotate-[360deg]">
                <IconBuildingStore size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                Universal Shopping
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                Shop from any store, save to one place. Your universal cart awaits.
              </Text>
            </div>

            <div className="group p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-pink-500 to-orange-600 text-white transition-transform duration-300 group-hover:rotate-[360deg]">
                <IconGift size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                Smart Registries
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                Create registries for any occasion. Wedding, baby, or just because.
              </Text>
            </div>

            <div className="group p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-transform duration-300 group-hover:rotate-[360deg]">
                <IconSparkles size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                AI-Powered Discovery
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                Find perfect gifts with AI recommendations tailored just for you.
              </Text>
            </div>
          </div>

          {/* Footer text */}
          <Text className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            © 2024 LetsFindMy. Building something special in{' '}
            {locale === 'en' ? 'stealth mode' : 'mode furtif'}.
          </Text>
        </div>
      </Container>

      {/* Custom styles for animations */}
      <style jsx>{`
        /* Gentler floating animation */
        @keyframes floatGentle {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        /* Slower pulse animation */
        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        /* Subtle bounce for dots */
        @keyframes bounceSubtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Email input glow */
        @keyframes inputGlow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
          50% {
            box-shadow: 0 0 20px 2px rgba(147, 51, 234, 0.15);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float-gentle {
          animation: floatGentle 10s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulseSlow 8s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounceSubtle 1.5s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
