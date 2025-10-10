/**
 * Profile Page UI Component
 *
 * Displays user profile with Tailwind styling
 */

"use client";

import { signOutAction } from "#/app/actions/auth";
import type { User } from "#/lib/auth-context";
import type { Locale } from "#/lib/i18n";
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconMail,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

interface ProfilePageUiProps {
  locale: Locale;
  dict: {
    header: { title: string };
  };
  user: User;
}

export default function ProfilePageUi({ locale, user }: ProfilePageUiProps) {
  const handleSignOut = () => {
    signOutAction();
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Unknown";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="harmony-bg-background min-h-screen">
      {/* Header */}
      <div className="harmony-bg-surface harmony-shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Group justify="space-between" py="lg">
            <Group>
              <Link
                href={`/${locale}` as Route}
                className="harmony-text-primary hover:harmony-text-secondary harmony-transition mr-6 inline-flex items-center"
              >
                <IconArrowLeft size={20} className="mr-2" />
                Back to Home
              </Link>
              <Title order={2} className="harmony-text-primary">
                Profile
              </Title>
            </Group>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="harmony-transition"
            >
              Sign Out
            </Button>
          </Group>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Stack gap="lg">
          {/* Profile Header */}
          <Card shadow="md" className="bg-white">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.image ? (
                  <Image
                    className="h-20 w-20 rounded-full ring-2 ring-blue-500"
                    src={user.image}
                    alt={user.name}
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <IconUser size={32} className="text-blue-600" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm capitalize text-gray-500">{user.role}</p>

                {/* Role Badge */}
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <IconShield size={12} className="mr-1" />
                    {user.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Details */}
          <Card withBorder shadow="md" padding="lg" className="harmony-card">
            <Title order={3} className="harmony-text-primary mb-4">
              Account Details
            </Title>

            <Stack gap="md">
              {/* Email */}
              <Group gap="md">
                <IconMail size={20} className="harmony-text-muted" />
                <div>
                  <Text size="sm" fw={500} className="harmony-text-primary">
                    Email
                  </Text>
                  <Text size="sm" className="harmony-text-secondary">
                    {user.email}
                  </Text>
                </div>
              </Group>

              {/* User ID */}
              <Group gap="md">
                <IconUser size={20} className="harmony-text-muted" />
                <div>
                  <Text size="sm" fw={500} className="harmony-text-primary">
                    User ID
                  </Text>
                  <Text
                    size="sm"
                    ff="monospace"
                    className="harmony-text-secondary"
                  >
                    {user.id}
                  </Text>
                </div>
              </Group>

              {/* Member Since */}
              <Group gap="md">
                <IconCalendar size={20} className="harmony-text-muted" />
                <div>
                  <Text size="sm" fw={500} className="harmony-text-primary">
                    Member Since
                  </Text>
                  <Text size="sm" className="harmony-text-secondary">
                    {formatDate(user.createdAt)}
                  </Text>
                </div>
              </Group>
            </Stack>
          </Card>

          {/* Admin Features */}
          {user.role === "admin" && (
            <Card
              withBorder
              shadow="md"
              padding="lg"
              className="harmony-card bg-gradient-to-r from-purple-50 to-pink-50"
            >
              <Group mb="md">
                <IconShield size={20} />
                <Title order={3} c="violet.9">
                  Administrator Features
                </Title>
              </Group>

              <Stack gap="md">
                <Text size="sm" c="violet.7">
                  As an administrator, you have access to:
                </Text>

                <Stack gap="xs">
                  <Text size="sm" c="violet.6">
                    • Enhanced feature flags and beta features
                  </Text>
                  <Text size="sm" c="violet.6">
                    • Extended analytics and usage insights
                  </Text>
                  <Text size="sm" c="violet.6">
                    • Administrative dashboard (coming soon)
                  </Text>
                  <Text size="sm" c="violet.6">
                    • User management capabilities (coming soon)
                  </Text>
                </Stack>

                <Button
                  variant="outline"
                  size="sm"
                  color="violet"
                  className="harmony-transition"
                >
                  View Admin Dashboard
                </Button>
              </Stack>
            </Card>
          )}

          {/* Demo Notice */}
          <Card withBorder padding="lg" className="harmony-card bg-yellow-50">
            <Group gap="md" align="flex-start">
              <div className="mt-1 flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <Text size="sm" fw={500} c="yellow.8" mb="xs">
                  Demo Account
                </Text>
                <Text size="sm" c="yellow.7">
                  This is a demonstration profile. No real user data is stored
                  or processed. All authentication is handled in-memory for this
                  template.
                </Text>
              </div>
            </Group>
          </Card>
        </Stack>
      </div>
    </div>
  );
}
