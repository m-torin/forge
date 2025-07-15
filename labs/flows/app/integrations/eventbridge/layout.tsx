'use client';

import { Box, Container, Paper, Tabs, Title } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract the active tab from the pathname
  const activeTab = pathname.split('/').pop() || 'bus';

  return (
    <Container>
      <Title mt="lg" order={1}>
        AWS EventBridge
      </Title>

      <Paper shadow="xs" p="0" mt="lg">
        <nav>
          <Tabs
            value={activeTab}
            onChange={(value) =>
              router.push(`/integrations/eventbridge/${value}`)
            }
            defaultValue="bus"
          >
            <Tabs.List>
              <Tabs.Tab p="md" value="bus">
                Bus
              </Tabs.Tab>
              <Tabs.Tab p="md" value="analytics" disabled>
                Analytics
              </Tabs.Tab>
              <Tabs.Tab p="md" value="settings" disabled>
                Settings
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </nav>

        <Box p="md">{children}</Box>
      </Paper>
    </Container>
  );
};

export default DashboardLayout;
