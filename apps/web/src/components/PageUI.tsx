"use client";

import {
  Text,
  Title,
  Container,
  Grid,
  Card,
  Stack,
  Group,
} from "@mantine/core";
import {
  IconCode,
  IconPalette,
  IconLanguage,
  IconBrandTypescript,
} from "@tabler/icons-react";
import type { ExtendedDictionary } from "@/i18n";

interface PageUIProps {
  dictionary?: ExtendedDictionary;
  isLoading?: boolean;
  "data-testid"?: string;
}

/**
 * PageUI component that renders the main homepage content
 *
 * This client component handles all the Mantine UI rendering
 * and can be used by both the root page and locale pages.
 * It also handles loading states to maintain proper server/client boundaries.
 */
export function PageUI({
  dictionary,
  isLoading = false,
  "data-testid": testId = "page-ui",
}: PageUIProps): React.JSX.Element {
  // Show loading state while dictionary loads
  if (isLoading || !dictionary) {
    return (
      <div
        data-testid={`${testId}-loading`}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
      >
        <Container size="lg">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
              </div>
              <Text className="mt-6 text-lg text-gray-600 dark:text-gray-300 font-medium">
                Loading...
              </Text>
              <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      <Container size="lg" className="relative">
        {/* Hero Section */}
        <div className="text-center pt-20 pb-16">
          <div className="relative inline-block">
            <Title className="text-4xl md:text-6xl font-bold mb-6" order={1}>
              <span className="text-gray-900 dark:text-white">
                {dictionary.home.welcome}{" "}
              </span>
              <Text
                inherit
                variant="gradient"
                component="span"
                gradient={{ from: "pink", to: "yellow" }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500"
              >
                Mantine
              </Text>
              <span className="text-gray-900 dark:text-white"> + </span>
              <Text
                inherit
                variant="gradient"
                component="span"
                gradient={{ from: "blue", to: "green" }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500"
              >
                TailwindCSS
              </Text>
            </Title>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-pulse delay-75"></div>
          </div>

          <Text
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
            size="lg"
            mt="xl"
          >
            {dictionary.home.subtitle}
          </Text>

          {/* CTA Buttons */}
          <Group justify="center" mt="xl" gap="md">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              {dictionary.home.getStarted}
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              {dictionary.home.documentation}
            </button>
          </Group>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-16">
            <Title
              order={2}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {dictionary.home.features.title}
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Built with modern technologies for the best developer experience
            </Text>
          </div>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="xl"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <Stack gap="lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 group-hover:scale-110 transition-transform duration-300">
                      <IconPalette
                        size={28}
                        className="text-pink-600 dark:text-pink-400"
                      />
                    </div>
                    <Title
                      order={3}
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {dictionary.home.features.mantine}
                    </Title>
                  </div>
                  <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {dictionary.home.features.mantineDesc}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="xl"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <Stack gap="lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                      <IconCode
                        size={28}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <Title
                      order={3}
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {dictionary.home.features.tailwind}
                    </Title>
                  </div>
                  <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {dictionary.home.features.tailwindDesc}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="xl"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <Stack gap="lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-300">
                      <IconBrandTypescript
                        size={28}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                    <Title
                      order={3}
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {dictionary.home.features.typescript}
                    </Title>
                  </div>
                  <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {dictionary.home.features.typescriptDesc}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="xl"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <Stack gap="lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-300">
                      <IconLanguage
                        size={28}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <Title
                      order={3}
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {dictionary.home.features.i18n}
                    </Title>
                  </div>
                  <Text className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {dictionary.home.features.i18nDesc}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-75"></div>
      </Container>
    </div>
  );
}
