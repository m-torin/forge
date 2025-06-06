'use client'

import { AppShell, Burger, Group, Title, ScrollArea, Stack, NavLink, Badge, ThemeIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { 
  IconHome, IconCode, IconClock, IconStar, IconStarFilled, 
  IconShield, IconBrain, IconServer, IconRoute, IconClockPlay,
  IconSettings, IconDeviceDesktop, IconCloud, IconWifi, IconWifiOff
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWorkflows } from '../contexts/WorkflowsContext'
import type { WorkflowInfo } from '../lib/workflows'

// Icon mapping for workflows
const iconMap: Record<string, React.ComponentType<any>> = {
  route: IconRoute,
  clock: IconClock,
  'clock-play': IconClockPlay,
  star: IconStar,
  'star-filled': IconStarFilled,
  shield: IconShield,
  brain: IconBrain,
  server: IconServer,
  code: IconCode,
  settings: IconSettings
}

// Color mapping for Mantine theme colors
const colorMap: Record<string, string> = {
  blue: 'blue',
  green: 'green', 
  yellow: 'yellow',
  orange: 'orange',
  red: 'red',
  violet: 'violet',
  pink: 'pink',
  teal: 'teal',
  gray: 'gray'
}

interface AppLayoutProps {
  children: React.ReactNode
  workflows: WorkflowInfo[]
}

export function AppLayout({ children, workflows }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const pathname = usePathname()
  const { config, sseConnected } = useWorkflows()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Upstash Workflows</Title>
          </Group>
          <Group gap="sm">
            {/* SSE Connection Status */}
            <Badge 
              color={sseConnected ? 'green' : 'red'} 
              variant="light"
              size="sm"
              leftSection={sseConnected ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
            >
              {sseConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            
            {/* Environment Badge */}
            {config && (
              <Badge 
                variant="light" 
                color={config.mode === 'local' ? 'blue' : 'orange'}
                leftSection={config.mode === 'local' ? <IconDeviceDesktop size={12} /> : <IconCloud size={12} />}
              >
                {config.environment}
              </Badge>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          <Stack gap="xs">
            {/* Home Link */}
            <NavLink
              component={Link}
              href="/"
              label="Dashboard"
              leftSection={<IconHome size={20} />}
              active={pathname === '/'}
              variant="filled"
            />
            
            {/* Workflows Section */}
            <div style={{ marginTop: 16 }}>
              <Title order={5} size="sm" c="dimmed" mb="xs" px="xs">
                Workflows ({workflows.length})
              </Title>
              
              {workflows.map((workflow) => {
                const IconComponent = iconMap[workflow.icon] || IconCode
                const isActive = pathname === `/workflows/${workflow.slug}`
                
                return (
                  <NavLink
                    key={workflow.slug}
                    component={Link}
                    href={`/workflows/${workflow.slug}`}
                    label={workflow.name}
                    description={workflow.description}
                    leftSection={
                      <ThemeIcon 
                        size="sm" 
                        variant="light" 
                        color={colorMap[workflow.color] || 'gray'}
                      >
                        <IconComponent size={16} />
                      </ThemeIcon>
                    }
                    active={isActive}
                    variant="subtle"
                  />
                )
              })}
            </div>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}