import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import { getDictionary } from "@/lib/dictionary";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  Text,
  Title,
} from "@mantine/core";
import Image from "next/image";

import { Link } from "@repo/internationalization/client";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
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
          {dictionary.template?.hero?.title || "Welcome to"}{" "}
          <Text
            component="span"
            gradient={{ from: "pink", to: "yellow" }}
            inherit
            variant="gradient"
          >
            {dictionary.template?.hero?.mantine || "Mantine"}
          </Text>{" "}
          +
          <Text
            component="span"
            gradient={{ from: "blue", to: "green" }}
            inherit
            variant="gradient"
          >
            {dictionary.template?.hero?.tailwind || "TailwindCSS"}
          </Text>
        </Title>
        <Text
          className="text-center text-gray-700 dark:text-gray-300 max-w-[500px] mx-auto mt-xl"
          maw={580}
          mt="xl"
          mx="auto"
          size="lg"
          ta="center"
        >
          {dictionary.template?.hero?.description ||
            "This starter Next.js project includes a minimal setup for Mantine with TailwindCSS. To get started edit page.tsx file."}
        </Text>

        <Text className="text-center mt-4 text-sm text-gray-600">
          Current locale: {locale} | {dictionary.common?.language || "Language"}
          : {dictionary.common?.locale || locale}
        </Text>

        <div className="flex justify-center mt-10 gap-4">
          <ColorSchemesSwitcher />
          <Link
            href="/about"
            locale={locale}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {dictionary.template?.navigation?.visitAbout || "Visit About Page"}
          </Link>
        </div>
      </AppShellMain>
    </AppShell>
  );
}
