"use client";

import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import { NewsletterForm } from "@/components/NewsletterForm";
import { AuthButton } from "@/components/AuthButton";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  Text,
  Title,
  Alert,
  Stack,
  Button,
  Container,
  Grid,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { IconInfoCircle, IconRocket, IconBook } from "@tabler/icons-react";
import Image from "next/image";
import { safeEnv, envError } from "@/env";

/**
 * Homepage component
 *
 * This is the main landing page that demonstrates:
 * - Graceful environment handling
 * - Mantine UI components
 * - Proper error boundaries
 * - Responsive design
 */
export default function Home(): React.JSX.Element {
  const env = safeEnv();
  const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShellHeader>
        <Group className="h-full px-md" justify="space-between">
          <Group>
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/next.svg"
              alt="logo"
              width={100}
              height={100}
            />
            <Text fw={600} size="lg">
              {env.NEXT_PUBLIC_APP_NAME}
            </Text>
          </Group>
          <AuthButton />
        </Group>
      </AppShellHeader>

      <AppShellMain>
        <Container size="md">
          <Stack gap="xl" align="center" py="xl">
            {/* Environment warning for development */}
            {isDevelopment && envError && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Development Mode"
                color="yellow"
                variant="light"
                maw={500}
              >
                <Text size="sm">
                  Running with environment fallbacks. Check the console for
                  configuration details.
                </Text>
              </Alert>
            )}

            {/* Main hero section */}
            <div style={{ textAlign: "center" }}>
              <Title className="text-center mt-10" size="3rem" fw={900}>
                Welcome to{" "}
                <Text
                  inherit
                  variant="gradient"
                  component="span"
                  gradient={{ from: "pink", to: "yellow" }}
                >
                  Mantine
                </Text>{" "}
                +{" "}
                <Text
                  inherit
                  variant="gradient"
                  component="span"
                  gradient={{ from: "blue", to: "green" }}
                >
                  TailwindCSS
                </Text>
              </Title>

              <Text
                className="text-center text-gray-700 dark:text-gray-300 max-w-[600px] mx-auto mt-xl"
                ta="center"
                size="lg"
                maw={600}
                mx="auto"
                mt="xl"
              >
                A modern web application built with Next.js 15, Mantine UI, and
                Tailwind CSS. Designed for reliability with comprehensive error
                handling and graceful fallbacks.
              </Text>
            </div>

            {/* Action buttons */}
            <Group gap="md" justify="center" mt="xl">
              <Button
                component="a"
                href="#newsletter"
                leftSection={<IconRocket size={16} />}
                variant="filled"
                size="lg"
              >
                Get started
              </Button>
              <Button
                component="a"
                href="/docs"
                leftSection={<IconBook size={16} />}
                variant="outline"
                size="lg"
              >
                Documentation
              </Button>
            </Group>

            {/* Color scheme switcher */}
            <div className="flex justify-center mt-10">
              <Stack align="center" gap="sm">
                <Text size="sm" c="dimmed">
                  Theme Switcher
                </Text>
                <ColorSchemesSwitcher />
              </Stack>
            </div>

            {/* Development info */}
            {isDevelopment && (
              <Alert
                color="blue"
                variant="light"
                maw={500}
                title="Development Mode Active"
                mt="xl"
              >
                <Text size="sm">
                  Environment: <strong>{env.NODE_ENV}</strong>
                  <br />
                  Base URL: <strong>{env.NEXT_PUBLIC_BASE_URL}</strong>
                  <br />
                  Error boundaries and graceful fallbacks are active.
                </Text>
              </Alert>
            )}

            {/* Newsletter Section */}
            <Container size="sm" mt="xl" id="newsletter">
              <NewsletterForm />
            </Container>
          </Stack>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}
