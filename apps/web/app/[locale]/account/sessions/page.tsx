"use client";

import { Container, Title } from "@mantine/core";

import {
  BackButton,
  SessionManagement,
  usePageTracking,
} from "@repo/design-system/uix";

export default function SessionsPage() {
  usePageTracking("account-sessions");

  return (
    <Container py="xl" size="md">
      <BackButton href="/account">Back to Account</BackButton>

      <Title order={1} mb="xl">
        Active Sessions
      </Title>

      <SessionManagement />
    </Container>
  );
}
