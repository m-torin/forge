"use client";

import { Container, Title, Text, Button, Stack, Center } from "@mantine/core";
import { IconArrowLeft, IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary } from "@/i18n";
import type { ExtendedDictionary } from "@/i18n";

/**
 * Custom 404 page for locale-specific routes
 *
 * This provides a user-friendly 404 page with navigation options
 * when users visit a page that doesn't exist.
 *
 * Note: Must be client component for useParams, but loads dictionary async
 */
export default function NotFound(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const [dictionary, setDictionary] = useState<ExtendedDictionary | null>(null);

  useEffect(() => {
    getDictionary(locale).then(setDictionary);
  }, [locale]);

  // Show loading state while dictionary loads
  if (!dictionary) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="lg" maw={500}>
            <div style={{ fontSize: "120px", lineHeight: 1 }}>🔍</div>
            <Title order={1} ta="center" size="h2">
              Page Not Found
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              Loading...
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="lg" maw={500}>
          <div style={{ fontSize: "120px", lineHeight: 1 }}>🔍</div>

          <Stack align="center" gap="sm">
            <Title order={1} ta="center" size="h2">
              {dictionary.common.pageNotFound}
            </Title>
            <Text ta="center" c="dimmed" size="lg">
              {dictionary.common.pageNotFoundDescription}
            </Text>
          </Stack>

          <Stack gap="sm" w="100%" maw={300}>
            <Button
              component={Link}
              href={`/${locale === "en" ? "" : locale}`}
              leftSection={<IconHome size={16} />}
              variant="filled"
              size="md"
              fullWidth
            >
              {dictionary.common.goHome}
            </Button>
            <Button
              onClick={() => router.back()}
              leftSection={<IconArrowLeft size={16} />}
              variant="light"
              size="md"
              fullWidth
            >
              {dictionary.common.goBack}
            </Button>
          </Stack>
        </Stack>
      </Center>
    </Container>
  );
}
