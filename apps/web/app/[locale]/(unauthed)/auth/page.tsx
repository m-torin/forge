"use client";

import {
  Button,
  Card,
  Divider,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
  Group,
  Loader,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconMail,
  IconBrandGithub,
  IconBrandGoogle,
  IconSparkles,
  IconArrowRight,
} from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  sendMagicLink,
  signInWithGoogle,
  signInWithGitHub,
} from "@repo/auth/client/next";
import { getDictionary } from "@/i18n";
import type { ExtendedDictionary } from "@/i18n";
import { checkUserExists } from "../../../actions/auth-check";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  name: z.string().optional(),
});

type EmailForm = z.infer<typeof emailSchema>;

function UnifiedAuthPageContent() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [dictionary, setDictionary] = useState<ExtendedDictionary | null>(null);
  const locale = params.locale as string;

  const form = useForm<EmailForm>({
    validate: zodResolver(emailSchema),
    initialValues: {
      email: "",
      name: "",
    },
  });

  const [debouncedEmail] = useDebouncedValue(form.values.email, 500);

  useEffect(() => {
    getDictionary(locale).then(setDictionary);
  }, [locale]);

  // Check if user exists when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (
        debouncedEmail &&
        z.string().email().safeParse(debouncedEmail).success
      ) {
        setCheckingUser(true);
        try {
          const result = await checkUserExists(debouncedEmail);
          setUserExists(result.exists);
        } catch (error) {
          console.error("Error checking user:", error);
        } finally {
          setCheckingUser(false);
        }
      } else {
        setUserExists(null);
      }
    };

    checkUser();
  }, [debouncedEmail]);

  const handleMagicLink = async (values: EmailForm) => {
    setLoading(true);
    try {
      const result = await sendMagicLink(values.email);

      if (result.success) {
        setMagicLinkSent(true);
        notifications.show({
          title: dictionary?.auth.unified.magicLinkSent || "Magic link sent!",
          message:
            dictionary?.auth.unified.checkEmail ||
            "Check your email to continue",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Failed to send magic link",
          message: result.error || "Unable to send magic link",
          color: "red",
        });
      }
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Unable to send magic link",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!dictionary) {
    return (
      <div className="w-full">
        <Card
          p="xl"
          shadow="xl"
          radius="xl"
          withBorder
          className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Text className="text-gray-600 dark:text-gray-300">Loading...</Text>
          </Stack>
        </Card>
      </div>
    );
  }

  if (magicLinkSent) {
    return (
      <div className="w-full">
        <Stack gap="xl" align="center">
          <div className="text-center space-y-2">
            <Title
              order={1}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
            >
              {dictionary.auth.unified?.magicLinkSent || "Check your email!"}
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-2">
              {dictionary.auth.unified?.magicLinkInstructions ||
                "We've sent you a magic link to sign in"}
            </Text>
          </div>

          <Card
            w="100%"
            p="xl"
            shadow="xl"
            radius="xl"
            withBorder
            className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <Stack gap="lg" align="center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <IconMail
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div className="text-center space-y-2">
                <Text className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  We sent a magic link to
                </Text>
                <Text className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-all">
                  {form.values.email}
                </Text>
              </div>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  setMagicLinkSent(false);
                  setUserExists(null);
                  form.reset();
                }}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-11 sm:h-12"
              >
                {dictionary.auth.unified?.tryAgain || "Try again"}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Stack gap="xl" align="center">
        {/* Dynamic Header */}
        <div className="text-center space-y-2">
          <Title
            order={1}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2"
          >
            {userExists === null && (
              <>
                <IconSparkles className="text-yellow-500" size={32} />
                {dictionary.auth.unified?.welcome || "Welcome"}
              </>
            )}
            {userExists === true &&
              (dictionary.auth.unified?.welcomeBack || "Welcome back!")}
            {userExists === false &&
              (dictionary.auth.unified?.letsGetStarted || "Let's get started")}
          </Title>
          <Text className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-2">
            {userExists === null &&
              (dictionary.auth.unified?.continueWith ||
                "Continue with your email or social account")}
            {userExists === true &&
              (dictionary.auth.unified?.signInToContinue ||
                "Sign in to continue")}
            {userExists === false &&
              (dictionary.auth.unified?.createAccount ||
                "Create your account in seconds")}
          </Text>
        </div>

        {/* Main Card */}
        <Card
          w="100%"
          p="xl"
          shadow="xl"
          radius="xl"
          withBorder
          className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <Stack gap="lg">
            {/* Social Login Buttons */}
            <Stack gap="sm">
              <Button
                fullWidth
                size="lg"
                variant="default"
                leftSection={<IconBrandGithub size={20} />}
                onClick={() => {
                  try {
                    signInWithGitHub();
                  } catch (error) {
                    notifications.show({
                      title: "Configuration Error",
                      message: "GitHub login is not configured",
                      color: "red",
                    });
                  }
                }}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 sm:h-14"
              >
                Continue with GitHub
              </Button>

              <Button
                fullWidth
                size="lg"
                variant="default"
                leftSection={<IconBrandGoogle size={20} />}
                onClick={() => {
                  try {
                    signInWithGoogle();
                  } catch (error) {
                    notifications.show({
                      title: "Configuration Error",
                      message: "Google login is not configured",
                      color: "red",
                    });
                  }
                }}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 sm:h-14"
              >
                Continue with Google
              </Button>
            </Stack>

            <Divider
              label={dictionary.auth.unified?.or || "or"}
              labelPosition="center"
              className="text-gray-500 dark:text-gray-400"
            />

            {/* Email Form */}
            <form onSubmit={form.onSubmit(handleMagicLink)}>
              <Stack gap="md">
                <TextInput
                  label={dictionary.auth.unified?.emailLabel || "Email address"}
                  placeholder="you@example.com"
                  leftSection={
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900">
                      <IconMail
                        size={16}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                  }
                  rightSection={checkingUser && <Loader size="xs" />}
                  required
                  size="lg"
                  className="[&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:bg-gray-50 dark:[&_input]:bg-gray-700/50 [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:ring-2 focus:[&_input]:ring-blue-500 focus:[&_input]:border-blue-500 [&_input]:text-base"
                  classNames={{
                    label:
                      "text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm sm:text-base",
                  }}
                  {...form.getInputProps("email")}
                />

                {/* Show name field for new users */}
                <Transition
                  mounted={userExists === false}
                  transition="slide-down"
                  duration={300}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <div style={styles}>
                      <TextInput
                        label={
                          dictionary.auth.unified?.nameLabel ||
                          "Your name (optional)"
                        }
                        placeholder="John Doe"
                        size="lg"
                        className="[&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:bg-gray-50 dark:[&_input]:bg-gray-700/50 [&_input]:transition-all [&_input]:duration-200 focus:[&_input]:ring-2 focus:[&_input]:ring-blue-500 focus:[&_input]:border-blue-500 [&_input]:text-base"
                        classNames={{
                          label:
                            "text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm sm:text-base",
                        }}
                        {...form.getInputProps("name")}
                      />
                    </div>
                  )}
                </Transition>

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="xl"
                  rightSection={<IconArrowRight size={20} />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 h-12 sm:h-14 text-base font-semibold mt-2"
                >
                  {userExists === false
                    ? dictionary.auth.unified?.createAccountButton ||
                      "Create account & continue"
                    : dictionary.auth.unified?.continueButton ||
                      "Continue with email"}
                </Button>
              </Stack>
            </form>

            {/* Privacy Notice */}
            <Text
              size="xs"
              className="text-center text-gray-500 dark:text-gray-400 mt-2"
            >
              {dictionary.auth.unified?.privacyNotice ||
                "By continuing, you agree to our Terms of Service and Privacy Policy"}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

// Wrap with error boundary
export default function UnifiedAuthPage() {
  return (
    <ErrorBoundary>
      <UnifiedAuthPageContent />
    </ErrorBoundary>
  );
}

// Static route configuration for PPR optimization
export const dynamic = "auto";
