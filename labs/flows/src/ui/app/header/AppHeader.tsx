import {
  Group,
  Button,
  UnstyledButton,
  Text,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
  AppShell,
  Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import classes from './AppHeader.module.scss';
import { AppHeaderUserMenu } from './AppHeaderUserMenu';
import { AnimatedAnchorMemo } from '../Logo';
import { AppHeaderMenuBar, linkData } from './FlowsDropdown';

export const AppLayoutHeader = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();

  return (
    <Box>
      <AppShell.Header className={classes.header}>
        <Container size="lg" h="100%" px={{ base: '0', sm: rem(15) }}>
          <Group gap="sm" h="100%">
            <AnimatedAnchorMemo href="/" text="Flowbuilder" />
            <Divider size="xs" orientation="vertical" ml="sm" />

            <AppHeaderMenuBar />

            <Box style={{ flexGrow: 1 }} visibleFrom="sm" />
            <Box
              id="applayout-header-right-mobile"
              style={{ flexGrow: 1 }}
              hiddenFrom="sm"
            />

            <Box id="applayout-header-right-s1" visibleFrom="sm" />
            <Box id="applayout-header-right-s2" visibleFrom="sm" />

            <Divider size="xs" orientation="vertical" />
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
            />
            <Box visibleFrom="sm">
              <AppHeaderUserMenu />
            </Box>
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Box>
          <AppHeaderUserMenu />
        </Box>

        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Box id="applayout-mobile-menu" />

          <Divider my="sm" />

          <Text className={classes.link} fw={700}>
            Global Navigation
          </Text>

          <Link href="/" className={classes.link}>
            Dashboard
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Flows
              </Box>
              <IconChevronDown
                style={{ width: rem(16), height: rem(16) }}
                color={theme.colors.cyan[6]}
              />
            </Center>
          </UnstyledButton>

          <Collapse in={linksOpened} ml={rem(15)}>
            {linkData.map((link, _index) => (
              <Button key={`link-${link.href || link.title}`} component="a" href={link.href}>
                <link.icon /> {link.title}
              </Button>
            ))}
          </Collapse>

          <Link href="/monitoring" className={classes.link}>
            Monitoring
          </Link>
          <Link href="/auditing" className={classes.link}>
            Auditing
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};
