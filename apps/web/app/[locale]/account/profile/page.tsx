"use client";

import { Container } from "@mantine/core";

import {
  BackButton,
  usePageTracking,
  UserProfile,
} from "@repo/design-system/uix";

export default function ProfilePage() {
  usePageTracking("account-profile");

  return (
    <Container py="xl" size="md">
      <BackButton href="/account">Back to Account</BackButton>

      <UserProfile />
    </Container>
  );
}
