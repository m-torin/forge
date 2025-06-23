'use client';

import { TextInput, Textarea, Button, Card, Stack, Group, Text, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconUser, IconMessage, IconSend } from '@tabler/icons-react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message too long'),
});

export function ContactForm() {
  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(contactSchema),
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // TODO: Implement server action for contact form submission
      console.log('Contact form submission:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notifications.show({
        title: 'Message sent!',
        message: "Thank you for your message. We'll get back to you soon.",
        color: 'green',
      });

      form.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      notifications.show({
        title: 'Failed to send',
        message: 'There was an error sending your message. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <div>
          <Title order={3} mb="xs">
            Send us a message
          </Title>
          <Text c="dimmed" size="sm">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              leftSection={<IconUser size={16} />}
              key={form.key('name')}
              {...form.getInputProps('name')}
              required
            />

            <TextInput
              label="Email Address"
              placeholder="Enter your email address"
              leftSection={<IconMail size={16} />}
              key={form.key('email')}
              {...form.getInputProps('email')}
              required
              type="email"
            />

            <Textarea
              label="Message"
              placeholder="Enter your message..."
              leftSection={<IconMessage size={16} />}
              autosize
              minRows={4}
              maxRows={8}
              key={form.key('message')}
              {...form.getInputProps('message')}
              required
            />

            <Group justify="flex-end" pt="md">
              <Button variant="subtle" onClick={() => form.reset()} disabled={form.submitting}>
                Clear
              </Button>
              <Button
                type="submit"
                loading={form.submitting}
                leftSection={<IconSend size={16} />}
                disabled={!form.isDirty()}
              >
                Send Message
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
