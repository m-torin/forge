'use client';

import { Button, Container, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconRocket, IconSparkles, IconStar } from '@tabler/icons-react';
import { useState } from 'react';

interface SplashPageProps {
  locale?: string;
}

export function SplashPage({ locale: _locale = 'en' }: SplashPageProps) {
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

  const handleSubmit = async (_values: { email: string }) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success notification
      notifications.show({
        title: "You're in! 🎮",
        message: "Get ready to curate your dream collection. We'll send your invite soon!",
        color: 'green',
      });

      setHasSubmitted(true);
      form.reset();
    } catch (_error: any) {
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 h-40 sm:h-80 w-40 sm:w-80 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 h-40 sm:h-80 w-40 sm:w-80 rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 opacity-20 blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 sm:h-96 w-48 sm:w-96 rounded-full bg-gradient-to-br from-green-400 to-blue-400 opacity-10 blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <IconStar
          className="absolute top-20 left-10 text-yellow-400 opacity-60 animate-float"
          size={24}
        />
        <IconSparkles
          className="absolute top-40 right-20 text-purple-400 opacity-60 animate-float animation-delay-2000"
          size={28}
        />
        <IconRocket
          className="absolute bottom-40 left-20 text-blue-400 opacity-60 animate-float animation-delay-4000"
          size={32}
        />
        <IconStar
          className="absolute bottom-20 right-10 text-pink-400 opacity-60 animate-float animation-delay-1000"
          size={20}
        />
      </div>

      {/* Main content */}
      <Container className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 md:py-12">
        <div className="text-center max-w-4xl mx-auto w-full">
          {/* Logo/Brand */}
          <div className="mb-6 md:mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-75 animate-pulse" />
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <IconRocket className="text-white" size={40} />
              </div>
            </div>
          </div>

          {/* Hero text */}
          <Title
            className="mb-4 md:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient"
            order={1}
          >
            Collect What You Love
          </Title>

          <Text
            className="mb-6 md:mb-8 text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
            size="xl"
          >
            Create wishlists for your passions. Share your fandoms. Get the perfect gifts from
            people who truly get you.
          </Text>

          {/* Email signup form */}
          {!hasSubmitted ? (
            <form
              onSubmit={form.onSubmit(handleSubmit)}
              className="max-w-md mx-auto mb-8 md:mb-12 px-4 sm:px-0"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <TextInput
                  {...form.getInputProps('email')}
                  className="flex-1"
                  disabled={isSubmitting}
                  leftSection={<IconMail size={18} />}
                  placeholder="Enter your email"
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      borderWidth: '2px',
                      '&:focus': {
                        borderColor: 'var(--mantine-color-blue-5)',
                      },
                    },
                  }}
                />
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl w-full sm:w-auto"
                  loading={isSubmitting}
                  radius="xl"
                  size="md"
                  type="submit"
                >
                  Get Early Access
                </Button>
              </div>
              <Text className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Join fellow collectors and enthusiasts. Be first to build your dream wishlist.
              </Text>
            </form>
          ) : (
            <div className="max-w-md mx-4 sm:mx-auto mb-8 md:mb-12 p-4 sm:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <Title className="mb-2 text-green-700 dark:text-green-400" order={3}>
                Welcome to the community! 🎉
              </Title>
              <Text className="text-green-600 dark:text-green-500">
                Get ready to share your collections with friends who understand your obsessions.
              </Text>
            </div>
          )}

          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto mb-8 md:mb-12 px-4 sm:px-0">
            <div className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                200K+
              </div>
              <Text className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Products
              </Text>
            </div>
            <div className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                1000s
              </div>
              <Text className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Characters & Films
              </Text>
            </div>
            <div className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                100s
              </div>
              <Text className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Merchants
              </Text>
            </div>
            <div className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                ∞
              </div>
              <Text className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Fandoms
              </Text>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto px-4 sm:px-0">
            <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 md:hover:scale-105 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <IconRocket size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                Universal Wishlists
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                From anime figures to vintage vinyl - save anything from any store in one place
              </Text>
            </div>

            <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 md:hover:scale-105 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <IconSparkles size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                Fandom Communities
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                Connect with collectors who share your passions and discover new treasures
              </Text>
            </div>

            <div className="group p-4 sm:p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 md:hover:scale-105 hover:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <IconStar size={24} />
              </div>
              <Title className="mb-2 text-gray-800 dark:text-gray-100" order={4}>
                Perfect Gifting
              </Title>
              <Text className="text-gray-600 dark:text-gray-400" size="md">
                No more duplicate gifts - share lists for birthdays, holidays, or just because
              </Text>
            </div>
          </div>
        </div>
      </Container>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
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

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
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
