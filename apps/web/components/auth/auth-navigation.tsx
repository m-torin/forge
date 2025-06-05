"use client";

import { Button, Group } from "@mantine/core";
import Link from "next/link";

import { useSession } from "@repo/auth-new/client";
import { UserButton } from "@repo/design-system/uix";

export const AuthNavigation = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return null;
  }

  if (session?.user) {
    return (
      <Group gap="sm">
        <Button
          href={"/dashboard" as any}
          component={Link}
          size="compact-sm"
          variant="subtle"
        >
          Dashboard
        </Button>
        <UserButton showName />
      </Group>
    );
  }

  return (
    <Group gap="sm">
      <Button
        href={"/sign-in" as any}
        component={Link}
        size="compact-sm"
        variant="subtle"
      >
        Sign in
      </Button>
      <Button href={"/sign-up" as any} component={Link} size="compact-sm">
        Sign up
      </Button>
    </Group>
  );
};
