"use client";

import { Center, Loader, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@repo/auth-new/client";

import type React from "react";

export default function ProtectedRoute({
  children,
  locale: _locale,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <Center h="50vh">
        <Loader />
      </Center>
    );
  }

  if (!session) {
    return (
      <Center h="50vh">
        <Text>Please sign in to access this page.</Text>
      </Center>
    );
  }

  return children;
}
