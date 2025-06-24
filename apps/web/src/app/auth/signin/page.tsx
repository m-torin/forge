"use client";

import {
  Paper,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Group,
  Stack,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconMail, IconLock } from "@tabler/icons-react";
import { z } from "zod";
import { signIn } from "@/app/actions/auth";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    validate: zodResolver(signInSchema),
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      if (values.rememberMe) formData.append("rememberMe", "on");

      const result = await signIn(formData);

      if (!result.success) {
        notifications.show({
          title: "Sign in failed",
          message: result.message,
          color: "red",
        });

        if ("errors" in result && result.errors) {
          result.errors.forEach((error) => {
            form.setFieldError(
              error.path as keyof SignInFormValues,
              error.message,
            );
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor href="/auth/signup" size="sm">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              leftSection={<IconMail size={16} />}
              data-testid="signin-email-input"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              leftSection={<IconLock size={16} />}
              data-testid="signin-password-input"
              {...form.getInputProps("password")}
            />

            <Group justify="space-between">
              <Checkbox
                label="Remember me"
                data-testid="signin-remember-checkbox"
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Anchor href="/auth/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button
              fullWidth
              type="submit"
              loading={isLoading}
              data-testid="signin-submit-button"
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
