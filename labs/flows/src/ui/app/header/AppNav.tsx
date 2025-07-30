import {
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  Anchor,
  Divider,
  Center,
  Box,
  rem,
  useMantineTheme,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconNotification,
  IconTable,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCloudComputing,
  IconChevronDown,
} from '@tabler/icons-react';
import classes from './AppNav.module.scss';
import Link from 'next/link';

const mockdata = [
  { icon: IconTable, title: 'Table of Flows', description: '~~~~' },
  {
    icon: IconCloudComputing,
    title: 'Integrations Catalog',
    description: '~~~~',
  },
  { icon: IconBook, title: '~~~~', description: '~~~~' },
  { icon: IconFingerprint, title: '~~~~', description: '~~~~' },
  { icon: IconChartPie3, title: '~~~~', description: '~~~~' },
  { icon: IconNotification, title: '~~~~', description: '~~~~' },
];

export function AppNav() {
  const [_drawerOpened, { toggle: _toggleDrawer }] = useDisclosure(false);
  const theme = useMantineTheme();

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ActionIcon radius="xl" variant="light" size="lg" aria-label="Settings">
          <item.icon style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Group justify="apart" grow>
        <Group h="100%" gap={0} hiddenFrom="sm">
          <HoverCard
            width={500}
            position="bottom"
            radius="md"
            shadow="md"
            withinPortal
          >
            <HoverCard.Target>
              <Button
                variant="subtle"
                component={Link}
                color="cyan"
                href="/flows"
              >
                <Center inline>
                  <Box component="span" mr={5}>
                    Flows
                  </Box>
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                    color={theme.colors.blue[6]}
                  />
                </Center>
              </Button>
            </HoverCard.Target>

            <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
              <Group justify="space-between" px="md">
                <Text fw={500}>Flows</Text>
                <Anchor href="/flows" fz="xs">
                  View all
                </Anchor>
              </Group>

              <Divider my="sm" />

              <SimpleGrid cols={2} spacing={0}>
                {links}
              </SimpleGrid>

              <div className={classes.dropdownFooter}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500} fz="sm">
                      Get started
                    </Text>
                    <Text size="xs" c="dimmed">
                      Their food sources have decreased, and their numbers
                    </Text>
                  </div>
                  <Button variant="default">Create flow</Button>
                </Group>
              </div>
            </HoverCard.Dropdown>
          </HoverCard>

          <Button
            variant="subtle"
            component={Link}
            color="cyan"
            href="/monitoring"
          >
            Monitoring
          </Button>
          <Button
            variant="subtle"
            component={Link}
            color="cyan"
            href="/auditing"
          >
            Auditing
          </Button>
          <Button variant="subtle" component={Link} color="cyan" href="#">
            Academy
          </Button>
        </Group>
      </Group>
  );
}
