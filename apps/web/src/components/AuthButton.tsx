"use client";

import { Button } from "@mantine/core";
import { IconLogin, IconLogout } from "@tabler/icons-react";
import { useAuth } from "@repo/auth/client/next";
import { signOut } from "@/app/actions/auth";
import { useEffect, useState } from "react";

export function AuthButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't use auth context during SSR
  if (!mounted) {
    return (
      <Button
        component="a"
        href="/auth/signin"
        variant="filled"
        leftSection={<IconLogin size={16} />}
        data-testid="auth-signin-button"
      >
        Sign In
      </Button>
    );
  }

  return <AuthButtonClient />;
}

function AuthButtonClient() {
  const { user, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return <Button loading>Loading...</Button>;
  }

  if (user) {
    return (
      <Button
        variant="outline"
        leftSection={<IconLogout size={16} />}
        onClick={handleSignOut}
        data-testid="auth-signout-button"
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      component="a"
      href="/auth/signin"
      variant="filled"
      leftSection={<IconLogin size={16} />}
      data-testid="auth-signin-button"
    >
      Sign In
    </Button>
  );
}
