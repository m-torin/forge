'use client';

import {
  Button,
  Container,
  FileInput,
  Grid,
  List,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconCalendar, IconCheck, IconUpload } from '@tabler/icons-react';

import type { Dictionary } from '@repo/internationalization';

interface ContactFormProps {
  dictionary: Dictionary;
}

export const ContactForm = ({ dictionary }: ContactFormProps) => {
  const form = useForm({
    validate: {
      firstName: (value) => (value.trim().length === 0 ? 'First name is required' : null),
      lastName: (value) => (value.trim().length === 0 ? 'Last name is required' : null),
    },
    initialValues: {
      date: new Date(),
      firstName: '',
      lastName: '',
      resume: null as File | null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log('Form values:', values);
    // Handle form submission here
  };

  return (
    <Container py={{ base: 40, lg: 80 }} size="xl">
      <Grid gutter={{ base: 40, lg: 60 }}>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="xl">
            <div>
              <Title order={1} fw={400} mb="sm" size="h1">
                {dictionary.web.contact.meta.title}
              </Title>
              <Text c="dimmed" maw={400} size="lg">
                {dictionary.web.contact.meta.description}
              </Text>
            </div>

            <List
              icon={
                <ThemeIcon color="blue" radius="xl" size={24}>
                  <IconCheck size={16} />
                </ThemeIcon>
              }
              size="md"
              spacing="lg"
            >
              {dictionary.web.contact.hero.benefits.map((benefit, index) => (
                <List.Item key={index}>
                  <Text fw={500}>{benefit.title}</Text>
                  <Text c="dimmed" size="sm">
                    {benefit.description}
                  </Text>
                </List.Item>
              ))}
            </List>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Paper withBorder p="xl" radius="md">
            <Text fw={500} mb="lg" size="lg">
              {dictionary.web.contact.hero.form.title}
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <DatePickerInput
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Pick date"
                  label={dictionary.web.contact.hero.form.date}
                  {...form.getInputProps('date')}
                />

                <TextInput
                  placeholder="John"
                  label={dictionary.web.contact.hero.form.firstName}
                  required
                  {...form.getInputProps('firstName')}
                />

                <TextInput
                  placeholder="Doe"
                  label={dictionary.web.contact.hero.form.lastName}
                  required
                  {...form.getInputProps('lastName')}
                />

                <FileInput
                  leftSection={<IconUpload size={16} />}
                  placeholder="Upload resume"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  label={dictionary.web.contact.hero.form.resume}
                  {...form.getInputProps('resume')}
                />

                <Button
                  fullWidth
                  rightSection={<IconArrowRight size={16} />}
                  mt="md"
                  size="md"
                  type="submit"
                >
                  {dictionary.web.contact.hero.form.cta}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
