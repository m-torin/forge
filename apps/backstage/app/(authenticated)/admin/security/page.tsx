import {
  Alert,
  Badge,
  Box,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconDatabase,
  IconEye,
  IconKey,
  IconLock,
  IconShield,
  IconUsers,
} from '@tabler/icons-react';
import { Suspense } from 'react';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database/prisma';

import { AuditLogViewer } from '../components/AuditLogViewer';
import { Security } from '../lib/security-middleware';

async function getSecurityStats() {
  try {
    // Get recent audit logs for statistics
    const auditLogs = Security.getRecentAuditLogs(500);

    // Get database stats
    const [apiKeyCount, twoFactorCount, sessionCount, userCount] = await Promise.all([
      database.apiKey.count(),
      database.twoFactor.count(),
      database.session.count({ where: { expiresAt: { gt: new Date() } } }),
      database.user.count(),
    ]);

    // Calculate security metrics
    const failedLogins = auditLogs.filter((log) => log.action === 'login' && !log.success).length;

    const highSeverityEvents = auditLogs.filter((log) => log.severity === 'high').length;

    const sensitiveFieldAccess = auditLogs.filter(
      (log) =>
        log.fieldName &&
        ['key', 'secret', 'token', 'password'].some((sensitive) =>
          log.fieldName?.toLowerCase().includes(sensitive),
        ),
    ).length;

    const uniqueUsers = new Set(auditLogs.map((log) => log.userId)).size;

    const recentEvents = auditLogs.filter(
      (log) => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    ).length;

    return {
      alerts: [
        ...(failedLogins > 10
          ? [
              {
                type: 'warning' as const,
                icon: IconAlertTriangle,
                message: `${failedLogins} failed login attempts detected`,
                title: 'Multiple Failed Logins',
              },
            ]
          : []),
        ...(highSeverityEvents > 5
          ? [
              {
                type: 'error' as const,
                icon: IconShield,
                message: `${highSeverityEvents} high severity security events`,
                title: 'High Severity Events',
              },
            ]
          : []),
        ...(sensitiveFieldAccess > 20
          ? [
              {
                type: 'info' as const,
                icon: IconEye,
                message: `${sensitiveFieldAccess} sensitive field access events`,
                title: 'Sensitive Data Access',
              },
            ]
          : []),
      ],
      audit: {
        failedLogins,
        highSeverityEvents,
        recentEvents,
        sensitiveFieldAccess,
        totalEvents: auditLogs.length,
        uniqueUsers,
      },
      database: {
        activeSessions: sessionCount,
        apiKeys: apiKeyCount,
        twoFactor: twoFactorCount,
        users: userCount,
      },
    };
  } catch (error) {
    console.error('Failed to get security stats:', error);
    return {
      alerts: [],
      audit: {
        failedLogins: 0,
        highSeverityEvents: 0,
        recentEvents: 0,
        sensitiveFieldAccess: 0,
        totalEvents: 0,
        uniqueUsers: 0,
      },
      database: { activeSessions: 0, apiKeys: 0, twoFactor: 0, users: 0 },
    };
  }
}

interface SecurityStatsCardProps {
  color: string;
  description?: string;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  value: number;
}

function SecurityStatsCard({
  color,
  description,
  icon: Icon,
  title,
  value,
}: SecurityStatsCardProps) {
  return (
    <Card withBorder p="lg">
      <Group justify="space-between">
        <Box>
          <Text c={color} fw={700} size="xl">
            {value.toLocaleString()}
          </Text>
          <Text fw={500} mt={4} size="sm">
            {title}
          </Text>
          {description && (
            <Text c="dimmed" mt={2} size="xs">
              {description}
            </Text>
          )}
        </Box>
        <ThemeIcon color={color} size="lg" variant="light">
          <Icon size={24} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

async function SecurityDashboard() {
  const session = await auth.api.getSession();

  if (!session) {
    return (
      <Alert color="red" title="Access Denied">
        You must be logged in to view this page.
      </Alert>
    );
  }

  // Check if user has admin permissions
  const hasAdminAccess = session.user.role === 'admin';

  if (!hasAdminAccess) {
    return (
      <Alert color="orange" title="Insufficient Permissions">
        You need administrator privileges to access the security dashboard.
      </Alert>
    );
  }

  const stats = await getSecurityStats();

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Text fw={700} size="xl">
              Security Dashboard
            </Text>
            <Text c="dimmed" mt={4} size="sm">
              Monitor security events and system access
            </Text>
          </Box>
          <Badge color="green" size="lg" variant="light">
            Real-time
          </Badge>
        </Group>

        {/* Security Alerts */}
        {stats.alerts.length > 0 && (
          <Stack gap="sm">
            <Text fw={600} size="lg">
              Security Alerts
            </Text>
            {stats.alerts.map((alert, index) => (
              <Alert
                key={index}
                color={
                  alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'
                }
                icon={<alert.icon size={16} />}
                title={alert.title}
              >
                {alert.message}
              </Alert>
            ))}
          </Stack>
        )}

        {/* Statistics Grid */}
        <Stack gap="md">
          <Text fw={600} size="lg">
            Database Security
          </Text>
          <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="md">
            <SecurityStatsCard
              color="blue"
              description="Total API keys in system"
              icon={IconKey}
              title="API Keys"
              value={stats.database.apiKeys}
            />
            <SecurityStatsCard
              color="green"
              description="Users with two-factor auth"
              icon={IconLock}
              title="2FA Enabled"
              value={stats.database.twoFactor}
            />
            <SecurityStatsCard
              color="orange"
              description="Currently active user sessions"
              icon={IconActivity}
              title="Active Sessions"
              value={stats.database.activeSessions}
            />
            <SecurityStatsCard
              color="violet"
              description="Registered users in system"
              icon={IconUsers}
              title="Total Users"
              value={stats.database.users}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Text fw={600} size="lg">
            Audit Statistics
          </Text>
          <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="md">
            <SecurityStatsCard
              color="blue"
              description="All recorded audit events"
              icon={IconDatabase}
              title="Total Events"
              value={stats.audit.totalEvents}
            />
            <SecurityStatsCard
              color="red"
              description="Failed authentication attempts"
              icon={IconAlertTriangle}
              title="Failed Logins"
              value={stats.audit.failedLogins}
            />
            <SecurityStatsCard
              color="red"
              description="Critical security events"
              icon={IconShield}
              title="High Severity"
              value={stats.audit.highSeverityEvents}
            />
            <SecurityStatsCard
              color="orange"
              description="Sensitive field access events"
              icon={IconEye}
              title="Sensitive Access"
              value={stats.audit.sensitiveFieldAccess}
            />
            <SecurityStatsCard
              color="green"
              description="Users with recent activity"
              icon={IconUsers}
              title="Active Users"
              value={stats.audit.uniqueUsers}
            />
            <SecurityStatsCard
              color="blue"
              description="Events in last 24 hours"
              icon={IconActivity}
              title="Recent Events"
              value={stats.audit.recentEvents}
            />
          </SimpleGrid>
        </Stack>

        {/* Audit Log Tabs */}
        <Paper withBorder>
          <Tabs defaultValue="all">
            <Tabs.List>
              <Tabs.Tab value="all">All Events</Tabs.Tab>
              <Tabs.Tab value="failed">Failed Actions</Tabs.Tab>
              <Tabs.Tab value="high-severity">High Severity</Tabs.Tab>
              <Tabs.Tab value="sensitive">Sensitive Data</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="all">
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="failed">
              <Alert color="red" icon={<IconAlertTriangle size={16} />} mb="md">
                Showing only failed security actions
              </Alert>
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="high-severity">
              <Alert color="orange" icon={<IconShield size={16} />} mb="md">
                Showing only high severity security events
              </Alert>
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="sensitive">
              <Alert color="blue" icon={<IconEye size={16} />} mb="md">
                Showing only sensitive data access events
              </Alert>
              <AuditLogViewer />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <SecurityDashboard />
    </Suspense>
  );
}
