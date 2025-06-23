"use client";

import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Avatar,
  Badge,
  Divider,
  Grid,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconShield,
  IconSettings,
  IconLogout,
  IconCalendar,
  IconBell,
  IconCreditCard,
  IconKey,
  IconActivity,
} from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth, signOut } from "@repo/auth/client/next";
import type { ExtendedDictionary } from "@/i18n";

interface AccountPageUIProps {
  dictionary: ExtendedDictionary;
}

export function AccountPageUI({ dictionary }: AccountPageUIProps) {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const locale = params.locale as string;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const authPath = locale === "en" ? "/auth" : `/${locale}/auth`;
      const currentPath = locale === "en" ? "/account" : `/${locale}/account`;
      router.push(`${authPath}?from=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  const handleSignOut = async () => {
    await signOut();
    const homePath = locale === "en" ? "/" : `/${locale}`;
    router.push(homePath);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Container size="md" py="xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Container>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is handling this)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Container
        size="md"
        py={{ base: "md", sm: "xl" }}
        px={{ base: "xs", sm: "md" }}
      >
        <div className="space-y-6 sm:space-y-8">
          {/* Header with enhanced gradient background - Mobile First */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 py-8 sm:px-8 sm:py-12 shadow-xl">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="text-center sm:text-left">
                  <Title
                    order={1}
                    className="text-white text-2xl sm:text-4xl font-bold mb-2"
                  >
                    {dictionary.common?.myAccount || "My Account"}
                  </Title>
                  <Text className="text-blue-100 text-base sm:text-lg">
                    Manage your account settings and preferences
                  </Text>
                </div>
                <Button
                  variant="white"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleSignOut}
                  size="md"
                  className="shadow-lg hover:shadow-xl transition-shadow self-center sm:self-start"
                >
                  <span className="hidden sm:inline">
                    {dictionary.common.logout}
                  </span>
                  <span className="sm:hidden">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          <Grid gutter="lg">
            {/* Enhanced Profile Information */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card
                shadow="xl"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
              >
                <Stack gap="xl">
                  {/* Profile Header - Mobile First */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                    <div className="relative shrink-0">
                      <Avatar
                        size={80}
                        radius="lg"
                        className="ring-2 sm:ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg"
                      >
                        <IconUser size={40} />
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <Title
                        order={2}
                        className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-1"
                      >
                        {user.name || "User"}
                      </Title>
                      <Text className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-2 break-all">
                        {user.email}
                      </Text>
                      {user.emailVerified && (
                        <Badge
                          color="green"
                          size="md"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          ✓ Verified Account
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Divider className="border-gray-200 dark:border-gray-700" />

                  {/* Account Details Grid - Mobile First */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <Group gap="sm" mb="xs">
                        <IconMail size={18} className="text-blue-600" />
                        <Text
                          fw={600}
                          className="text-gray-900 dark:text-white text-sm sm:text-base"
                        >
                          Email Address
                        </Text>
                      </Group>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm sm:text-base break-all">
                        {user.email}
                      </Text>
                      {!user.emailVerified && (
                        <Text
                          size="xs"
                          className="text-orange-600 dark:text-orange-400 mt-1"
                        >
                          Please verify your email address
                        </Text>
                      )}
                    </div>

                    {user.createdAt && (
                      <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Group gap="sm" mb="xs">
                          <IconCalendar size={18} className="text-purple-600" />
                          <Text
                            fw={600}
                            className="text-gray-900 dark:text-white text-sm sm:text-base"
                          >
                            Member Since
                          </Text>
                        </Group>
                        <Text className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </Text>
                      </div>
                    )}
                  </div>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Enhanced Quick Actions Sidebar */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="lg">
                {/* Quick Actions */}
                <Card
                  shadow="lg"
                  padding="lg"
                  radius="lg"
                  withBorder
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <Stack gap="md">
                    <Text
                      fw={600}
                      className="text-gray-900 dark:text-white text-base sm:text-lg"
                    >
                      Quick Actions
                    </Text>
                    <Stack gap="xs">
                      <Button
                        variant="light"
                        fullWidth
                        leftSection={<IconSettings size={16} />}
                        disabled
                        size="md"
                        className="h-10 sm:h-12 justify-start text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                      >
                        Account Settings
                      </Button>
                      <Button
                        variant="light"
                        fullWidth
                        leftSection={<IconShield size={16} />}
                        disabled
                        size="md"
                        className="h-10 sm:h-12 justify-start text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                      >
                        Security & Privacy
                      </Button>
                      <Button
                        variant="light"
                        fullWidth
                        leftSection={<IconBell size={16} />}
                        disabled
                        size="md"
                        className="h-10 sm:h-12 justify-start text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                      >
                        Notifications
                      </Button>
                      <Button
                        variant="light"
                        fullWidth
                        leftSection={<IconCreditCard size={16} />}
                        disabled
                        size="md"
                        className="h-10 sm:h-12 justify-start text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                      >
                        Billing & Plans
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* Security Status */}
                <Card
                  shadow="lg"
                  padding="lg"
                  radius="lg"
                  withBorder
                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <Stack gap="md">
                    <Group>
                      <IconShield size={20} className="text-green-600" />
                      <Text fw={600} className="text-gray-900 dark:text-white">
                        Security Status
                      </Text>
                    </Group>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Text
                          size="sm"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Email Verified
                        </Text>
                        <Badge
                          color={user.emailVerified ? "green" : "orange"}
                          size="sm"
                          className={
                            user.emailVerified
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          }
                        >
                          {user.emailVerified ? "Yes" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Text
                          size="sm"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Two-Factor Auth
                        </Text>
                        <Badge
                          color="gray"
                          size="sm"
                          className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Disabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <Text
                          size="sm"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Password Strength
                        </Text>
                        <Badge
                          color="blue"
                          size="sm"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          Strong
                        </Badge>
                      </div>
                    </div>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Enhanced Feature Sections */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="lg"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full"
              >
                <Stack gap="lg" className="h-full">
                  <Group>
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <IconActivity
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <Title order={3} className="text-gray-900 dark:text-white">
                      Recent Activity
                    </Title>
                  </Group>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <IconActivity size={32} className="text-gray-400" />
                      </div>
                      <Text className="text-gray-500 dark:text-gray-400 mb-2">
                        No recent activity
                      </Text>
                      <Text
                        size="sm"
                        className="text-gray-400 dark:text-gray-500"
                      >
                        Your account activity will appear here
                      </Text>
                    </div>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="lg"
                padding="xl"
                radius="xl"
                withBorder
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full"
              >
                <Stack gap="lg" className="h-full">
                  <Group>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <IconKey
                        size={24}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <Title order={3} className="text-gray-900 dark:text-white">
                      Preferences
                    </Title>
                  </Group>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <IconSettings size={32} className="text-gray-400" />
                      </div>
                      <Text className="text-gray-500 dark:text-gray-400 mb-2">
                        Customize your experience
                      </Text>
                      <Text
                        size="sm"
                        className="text-gray-400 dark:text-gray-500"
                      >
                        Account preferences coming soon
                      </Text>
                    </div>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </div>
      </Container>
    </div>
  );
}
