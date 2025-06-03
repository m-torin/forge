"use client";

import { Container } from "@mantine/core";

import { EmailVerificationPage } from "@repo/design-system/uix";

export default function VerifyEmailPage() {
  return (
    <Container py="xl" size="sm">
      <EmailVerificationPage />
    </Container>
  );
}
