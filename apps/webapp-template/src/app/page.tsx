import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  Text,
  Title,
} from "@mantine/core";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShellHeader>
        <Group className="h-full px-md">
          <Image
            width={100}
            className="dark:invert"
            alt="logo"
            height={100}
            src="https://nextjs.org/icons/next.svg"
          />
        </Group>
      </AppShellHeader>
      <AppShellMain>
        <Title className="text-center mt-20">
          Welcome to{" "}
          <Text
            component="span"
            gradient={{ from: "pink", to: "yellow" }}
            inherit
            variant="gradient"
          >
            Mantine
          </Text>{" "}
          +
          <Text
            component="span"
            gradient={{ from: "blue", to: "green" }}
            inherit
            variant="gradient"
          >
            TailwindCSS
          </Text>
        </Title>
        <Text
          className="text-center text-gray-700 dark:text-gray-300"
          maw={580}
          mt="xl"
          mx="auto"
          size="lg"
          ta="center"
        >
          This starter Next.js project includes a minimal setup for Mantine with
          TailwindCSS. To get started edit page.tsx file.
        </Text>

        <div className="flex justify-center mt-10">
          <ColorSchemesSwitcher />
        </div>
      </AppShellMain>
    </AppShell>
  );
}
