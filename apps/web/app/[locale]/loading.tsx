"use client";

import { Loader, Container, Center, Stack, Text } from "@mantine/core";

/**
 * Loading page for locale-specific routes
 *
 * This shows a consistent loading state while pages are being generated
 * or data is being fetched.
 *
 * Note: Loading components can't access params or use hooks, so we use
 * a hardcoded fallback. The proper localized text is shown in actual pages.
 */
export default function Loading(): React.JSX.Element {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="md">
          <Loader size="lg" type="bars" />
          <Text c="dimmed" size="sm">
            Loading...
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
