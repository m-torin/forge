"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  Button,
  Menu,
  Avatar,
  Text,
} from "@mantine/core";
import {
  IconUser,
  IconLogout,
  IconLogin,
  IconSettings,
} from "@tabler/icons-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { ExtendedDictionary } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import { useAuth, signOut } from "@repo/auth/client/next";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface AppLayoutProps {
  children: React.ReactNode;
  locale: string;
  dictionary: ExtendedDictionary;
  "data-testid"?: string;
}

/**
 * AppLayout component that provides the main application shell
 *
 * This component handles the header, navigation, and main content area.
 * It includes the theme switcher, language switcher, and auth status in the header.
 */
export function AppLayout({
  children,
  locale,
  dictionary,
  "data-testid": testId = "app-layout",
}: AppLayoutProps): React.JSX.Element {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      notifications.show({
        title: "Success",
        message: "Logged out successfully",
        color: "blue",
      });
      router.push("/");
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to log out",
        color: "red",
      });
    }
  };

  return (
    <div data-testid={testId}>
      <AppShell
        header={{ height: { base: 60, sm: 70 } }}
        padding={{ base: "xs", sm: "md" }}
      >
        <AppShellHeader className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
          <Group className="h-full px-3 sm:px-6 justify-between">
            {/* Logo - Mobile optimized */}
            <Link href="/" className="no-underline group">
              <div className="flex items-center">
                <div className="relative">
                  <Image
                    className="dark:invert transition-transform group-hover:scale-105"
                    src="https://nextjs.org/icons/next.svg"
                    alt="logo"
                    width={80}
                    height={30}
                    style={{ width: "auto", height: "24px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
                </div>
              </div>
            </Link>

            {/* Mobile-first Navigation */}
            <Group gap="md">
              {/* Authentication Controls - Mobile First */}
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-6 w-6 sm:h-8 sm:w-8"></div>
                    <div className="hidden sm:block rounded-md bg-gray-300 dark:bg-gray-600 h-8 w-16"></div>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <Group gap="xs">
                  {/* Desktop Theme/Language Controls */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <LanguageSwitcher
                      currentLocale={locale}
                      dictionary={dictionary}
                    />
                    <ThemeSwitcher dictionary={dictionary} />
                  </div>

                  {/* User Menu - Responsive */}
                  <Menu
                    position="bottom-end"
                    shadow="xl"
                    offset={5}
                    classNames={{
                      dropdown:
                        "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 min-w-48",
                    }}
                  >
                    <Menu.Target>
                      <Button
                        variant="subtle"
                        size="sm"
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md"
                        leftSection={
                          <Avatar
                            size="xs"
                            radius="xl"
                            className="ring-1 ring-blue-100 dark:ring-blue-900"
                          >
                            <IconUser size={12} />
                          </Avatar>
                        }
                      >
                        <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm max-w-20 sm:max-w-none truncate">
                          {user?.name || user?.email?.split("@")[0] || "User"}
                        </span>
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <Text
                            size="xs"
                            className="text-gray-500 dark:text-gray-400 font-medium truncate"
                          >
                            {user?.email || "No email"}
                          </Text>
                        </div>
                      </Menu.Label>

                      {/* Mobile Theme/Language in menu */}
                      <div className="lg:hidden px-2 py-1 border-b border-gray-200 dark:border-gray-700 mb-2">
                        <div className="space-y-2">
                          <LanguageSwitcher
                            currentLocale={locale}
                            dictionary={dictionary}
                          />
                          <ThemeSwitcher dictionary={dictionary} />
                        </div>
                      </div>

                      <Menu.Item
                        component={Link}
                        href={
                          locale === "en" ? "/account" : `/${locale}/account`
                        }
                        leftSection={
                          <IconUser size={14} className="text-blue-600" />
                        }
                        className="rounded-lg mx-1 my-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {dictionary.common?.myAccount || "My Account"}
                        </span>
                      </Menu.Item>
                      <Menu.Divider className="my-2 border-gray-200 dark:border-gray-700" />
                      <Menu.Item
                        leftSection={
                          <IconLogout size={14} className="text-red-500" />
                        }
                        onClick={handleLogout}
                        className="rounded-lg mx-1 my-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {dictionary.common?.logout || "Logout"}
                        </span>
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              ) : (
                <Group gap="xs">
                  {/* Mobile Theme/Language Menu for unauth users */}
                  <div className="lg:hidden">
                    <Menu position="bottom-end" shadow="xl">
                      <Menu.Target>
                        <Button variant="subtle" size="xs" className="p-1">
                          <IconSettings size={16} />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <div className="p-2 space-y-2">
                          <LanguageSwitcher
                            currentLocale={locale}
                            dictionary={dictionary}
                          />
                          <ThemeSwitcher dictionary={dictionary} />
                        </div>
                      </Menu.Dropdown>
                    </Menu>
                  </div>

                  {/* Desktop Theme/Language */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <LanguageSwitcher
                      currentLocale={locale}
                      dictionary={dictionary}
                    />
                    <ThemeSwitcher dictionary={dictionary} />
                  </div>

                  {/* Auth Buttons - Mobile First */}
                  <Button
                    component={Link}
                    href={locale === "en" ? "/auth" : `/${locale}/auth`}
                    size="sm"
                    leftSection={<IconLogin size={14} />}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-xs sm:text-sm"
                  >
                    {dictionary.common?.login || "Get Started"}
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </AppShellHeader>
        <AppShellMain className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </AppShellMain>
      </AppShell>
    </div>
  );
}
