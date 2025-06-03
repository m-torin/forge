"use client";

import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

import {
  BackButton,
  PasskeyManager,
  usePageTracking,
} from "@repo/design-system/uix";

export default function AccountSecurityPage() {
  usePageTracking("account-security");

  return (
    <Container py="xl" size="md">
      <BackButton href="/account">Back to Account</BackButton>

      <Title order={1} mb="xl">
        Security Settings
      </Title>

      <Stack gap="xl">
        {/* Note: Two-factor authentication is not included for web app per user request */}

        {/* Passkeys */}
        <PasskeyManager />

        {/* The web app specific social accounts management is on the profile page */}
        <Text c="dimmed" size="sm">
          To manage connected social accounts, visit your{" "}
          <Anchor href="/account/profile" component={Link as any}>
            profile settings
          </Anchor>
          .
        </Text>
      </Stack>
    </Container>
  );
}
