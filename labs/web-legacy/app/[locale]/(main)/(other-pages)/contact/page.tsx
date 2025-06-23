import { type Metadata } from 'next';
import { Container, Title, Grid, Text, Stack, Card } from '@mantine/core';
import { SectionPromo1, SocialsList } from '@/components/ui';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  description: 'Contact us for any inquiries or support',
  title: 'Contact',
};

const info = [
  {
    desc: 'Photo booth tattooed prism, portland taiyaki hoodie neutra typewriter',
    title: '🗺 ADDRESS',
  },
  {
    desc: 'nc.example@example.com',
    title: '💌 EMAIL',
  },
  {
    desc: '000-123-456-7890',
    title: '☎ PHONE',
  },
];

const PageContact = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={1} ta="center" fw={600}>
          Contact
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                {info.map((item: any) => (
                  <div key={item.title}>
                    <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb="xs">
                      {item.title}
                    </Text>
                    <Text c="dimmed">{item.desc}</Text>
                  </div>
                ))}
                <div>
                  <Text size="sm" fw={600} tt="uppercase" c="dimmed" mb="xs">
                    🌏 SOCIALS
                  </Text>
                  <SocialsList />
                </div>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <ContactForm />
          </Grid.Col>
        </Grid>
      </Stack>

      <Container pt="xl">
        <SectionPromo1 />
      </Container>
    </Container>
  );
};

export default PageContact;
