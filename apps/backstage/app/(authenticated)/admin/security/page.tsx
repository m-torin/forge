import { Suspense } from 'react';
import {
  Container,
  Stack,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Alert,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Box,
  Tabs,
} from '@mantine/core';
import {
  IconShield,
  IconKey,
  IconUsers,
  IconDatabase,
  IconAlertTriangle,
  IconActivity,
  IconLock,
  IconEye,
} from '@tabler/icons-react';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Security } from '../lib/security-middleware';

async function getSecurityStats() {
  try {
    // Get recent audit logs for statistics
    const auditLogs = Security.getRecentAuditLogs(500);
    
    // Get database stats
    const [
      apiKeyCount,
      twoFactorCount,
      sessionCount,
      userCount,
    ] = await Promise.all([
      database.apiKey.count(),
      database.twoFactor.count(),
      database.session.count({ where: { expiresAt: { gt: new Date() } } }),
      database.user.count(),
    ]);

    // Calculate security metrics
    const failedLogins = auditLogs.filter(log => 
      log.action === 'login' && !log.success
    ).length;
    
    const highSeverityEvents = auditLogs.filter(log => 
      log.severity === 'high'
    ).length;
    
    const sensitiveFieldAccess = auditLogs.filter(log => 
      log.fieldName && ['key', 'secret', 'token', 'password'].some(sensitive => 
        log.fieldName?.toLowerCase().includes(sensitive)
      )
    ).length;
    
    const uniqueUsers = new Set(auditLogs.map(log => log.userId)).size;
    
    const recentEvents = auditLogs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return {
      database: {
        apiKeys: apiKeyCount,
        twoFactor: twoFactorCount,
        activeSessions: sessionCount,
        users: userCount,
      },
      audit: {
        totalEvents: auditLogs.length,
        failedLogins,
        highSeverityEvents,
        sensitiveFieldAccess,
        uniqueUsers,
        recentEvents,
      },
      alerts: [
        ...(failedLogins > 10 ? [{
          type: 'warning' as const,
          title: 'Multiple Failed Logins',
          message: `${failedLogins} failed login attempts detected`,
          icon: IconAlertTriangle,
        }] : []),
        ...(highSeverityEvents > 5 ? [{
          type: 'error' as const,
          title: 'High Severity Events',
          message: `${highSeverityEvents} high severity security events`,
          icon: IconShield,
        }] : []),
        ...(sensitiveFieldAccess > 20 ? [{
          type: 'info' as const,
          title: 'Sensitive Data Access',
          message: `${sensitiveFieldAccess} sensitive field access events`,
          icon: IconEye,
        }] : []),
      ],
    };
  } catch (error) {
    console.error('Failed to get security stats:', error);
    return {
      database: { apiKeys: 0, twoFactor: 0, activeSessions: 0, users: 0 },
      audit: { totalEvents: 0, failedLogins: 0, highSeverityEvents: 0, sensitiveFieldAccess: 0, uniqueUsers: 0, recentEvents: 0 },
      alerts: [],
    };
  }
}

interface SecurityStatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  description?: string;
}

function SecurityStatsCard({ title, value, icon: Icon, color, description }: SecurityStatsCardProps) {
  return (
    <Card withBorder p="lg">
      <Group justify="space-between">
        <Box>
          <Text size="xl" fw={700} c={color}>
            {value.toLocaleString()}
          </Text>
          <Text size="sm" fw={500} mt={4}>
            {title}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </Box>
        <ThemeIcon size="lg" variant="light" color={color}>
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Text size="xl" fw={700}>
              Security Dashboard
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Monitor security events and system access
            </Text>
          </Box>
          <Badge size="lg" variant="light" color="green">
            Real-time
          </Badge>
        </Group>

        {/* Security Alerts */}
        {stats.alerts.length > 0 && (
          <Stack gap="sm">
            <Text size="lg" fw={600}>Security Alerts</Text>
            {stats.alerts.map((alert, index) => (
              <Alert
                key={index}
                icon={<alert.icon size={16} />}
                title={alert.title}
                color={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'}
              >
                {alert.message}
              </Alert>
            ))}
          </Stack>
        )}

        {/* Statistics Grid */}
        <Stack gap="md">
          <Text size="lg" fw={600}>Database Security</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <SecurityStatsCard
              title="API Keys"
              value={stats.database.apiKeys}
              icon={IconKey}
              color="blue"
              description="Total API keys in system"
            />
            <SecurityStatsCard
              title="2FA Enabled"
              value={stats.database.twoFactor}
              icon={IconLock}
              color="green"
              description="Users with two-factor auth"
            />
            <SecurityStatsCard
              title="Active Sessions"
              value={stats.database.activeSessions}
              icon={IconActivity}
              color="orange"
              description="Currently active user sessions"
            />
            <SecurityStatsCard
              title="Total Users"
              value={stats.database.users}
              icon={IconUsers}
              color="violet"
              description="Registered users in system"
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Text size="lg" fw={600}>Audit Statistics</Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            <SecurityStatsCard
              title="Total Events"
              value={stats.audit.totalEvents}
              icon={IconDatabase}
              color="blue"
              description="All recorded audit events"
            />
            <SecurityStatsCard
              title="Failed Logins"
              value={stats.audit.failedLogins}
              icon={IconAlertTriangle}
              color="red"
              description="Failed authentication attempts"
            />
            <SecurityStatsCard
              title="High Severity"
              value={stats.audit.highSeverityEvents}
              icon={IconShield}
              color="red"
              description="Critical security events"
            />
            <SecurityStatsCard
              title="Sensitive Access"
              value={stats.audit.sensitiveFieldAccess}
              icon={IconEye}
              color="orange"
              description="Sensitive field access events"
            />
            <SecurityStatsCard
              title="Active Users"
              value={stats.audit.uniqueUsers}
              icon={IconUsers}
              color="green"
              description="Users with recent activity"
            />
            <SecurityStatsCard
              title="Recent Events"
              value={stats.audit.recentEvents}
              icon={IconActivity}
              color="blue"
              description="Events in last 24 hours"
            />
          </SimpleGrid>
        </Stack>

        {/* Audit Log Tabs */}
        <Paper withBorder>
          <Tabs defaultValue="all">
            <Tabs.List>
              <Tabs.Tab value="all">
                All Events
              </Tabs.Tab>
              <Tabs.Tab value="failed">
                Failed Actions
              </Tabs.Tab>
              <Tabs.Tab value="high-severity">
                High Severity
              </Tabs.Tab>
              <Tabs.Tab value="sensitive">
                Sensitive Data
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all" pt="md">
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel value="failed" pt="md">
              <Alert icon={<IconAlertTriangle size={16} />} color="red" mb="md">
                Showing only failed security actions
              </Alert>
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel value="high-severity" pt="md">
              <Alert icon={<IconShield size={16} />} color="orange" mb="md">
                Showing only high severity security events
              </Alert>
              <AuditLogViewer />
            </Tabs.Panel>

            <Tabs.Panel value="sensitive" pt="md">
              <Alert icon={<IconEye size={16} />} color="blue" mb="md">
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