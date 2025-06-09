import {
  Badge,
  Box,
  Card,
  Container,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArticle,
  IconBarcode,
  IconBrandAirtable,
  IconBuilding,
  IconCategory,
  IconClock,
  IconDatabase,
  IconFolder,
  IconGift,
  IconHeart,
  IconKey,
  IconLink,
  IconList,
  IconPhoto as IconMedia,
  IconPackage,
  IconPhoto,
  IconScan,
  IconSettings,
  IconShoppingCart,
  IconStars,
  IconTags,
  IconUsers,
  IconUserShield,
  IconGitBranch,
} from '@tabler/icons-react';
import Link from 'next/link';

import { database } from '@repo/database/prisma';
import { FeatureFlagDemo } from '../../components/feature-flag-demo';

async function getModelCounts() {
  const [
    // Content Models
    productCategories,
    articles,
    brands,
    collections,
    products,
    taxonomies,
    reviews,
    registries,
    registryItems,
    media,
    // Junction Models
    pdpJoins,
    favoriteJoins,
    registryPurchases,
    registryUsers,
    reviewVotes,
    // Auth & User Models
    users,
    sessions,
    accounts,
    verifications,
    organizations,
    members,
    teams,
    teamMembers,
    invitations,
    // Security Models
    apiKeys,
    twoFactor,
    backupCodes,
    passkeys,
    // Workflow Models
    workflows,
    executions,
    schedules,
    // Legacy PIM Models
    barcodes,
    assets,
    scans,
  ] = await Promise.all([
    // Content Models
    database.productCategory.count(),
    database.article.count(),
    database.brand.count(),
    database.collection.count(),
    database.product.count(),
    database.taxonomy.count(),
    database.review.count(),
    database.registry.count(),
    database.registryItem.count(),
    database.media.count(),
    // Junction Models
    database.pdpJoin.count(),
    database.favoriteJoin.count(),
    database.registryPurchaseJoin.count(),
    database.registryUserJoin.count(),
    database.reviewVoteJoin.count(),
    // Auth & User Models
    database.user.count(),
    database.session.count(),
    database.account.count(),
    database.verification.count(),
    database.organization.count(),
    database.member.count(),
    database.team.count(),
    database.teamMember.count(),
    database.invitation.count(),
    // Security Models
    database.apiKey.count(),
    database.twoFactor.count(),
    database.backupCode.count(),
    database.passkey.count(),
    // Workflow Models
    database.workflowConfig.count(),
    database.workflowExecution.count(),
    database.workflowSchedule.count(),
    // Legacy PIM Models
    database.productBarcode.count(),
    database.productAsset.count(),
    database.scanHistory.count(),
  ]);

  return {
    accounts,
    // Security Models
    apiKeys,
    articles,
    // Legacy PIM Models
    assets,
    backupCodes,
    barcodes,
    brands,
    collections,
    executions,
    favoriteJoins,
    invitations,
    media,
    members,
    organizations,
    passkeys,
    // Junction Models
    pdpJoins,
    // Content Models
    productCategories,
    products,
    registries,
    registryItems,
    registryPurchases,
    registryUsers,
    reviews,
    reviewVotes,
    scans,
    schedules,
    sessions,
    taxonomies,
    teamMembers,
    teams,
    twoFactor,
    // Auth & User Models
    users,
    verifications,
    // Workflow Models
    workflows,
  };
}

const modelCategories = [
  {
    category: 'Content Management',
    icon: IconArticle,
    models: [
      {
        name: 'Product Categories',
        color: 'blue',
        countKey: 'productCategories' as const,
        description: 'Manage product category hierarchy',
        href: '/admin/productCategory',
        icon: IconCategory,
      },
      {
        name: 'Articles',
        color: 'green',
        countKey: 'articles' as const,
        description: 'Manage blog posts and content',
        href: '/admin/article',
        icon: IconArticle,
      },
      {
        name: 'Brands',
        color: 'orange',
        countKey: 'brands' as const,
        description: 'Manage brands and manufacturers',
        href: '/admin/brand',
        icon: IconBrandAirtable,
      },
      {
        name: 'Collections',
        color: 'purple',
        countKey: 'collections' as const,
        description: 'Manage product collections',
        href: '/admin/collection',
        icon: IconFolder,
      },
      {
        name: 'Products',
        color: 'pink',
        countKey: 'products' as const,
        description: 'Manage product catalog',
        href: '/admin/product',
        icon: IconPackage,
      },
      {
        name: 'Taxonomies',
        color: 'indigo',
        countKey: 'taxonomies' as const,
        description: 'Manage tags and attributes',
        href: '/admin/taxonomy',
        icon: IconTags,
      },
    ],
  },
  {
    category: 'User Generated Content',
    icon: IconUsers,
    models: [
      {
        name: 'Reviews',
        color: 'yellow',
        countKey: 'reviews' as const,
        description: 'Manage product reviews',
        href: '/admin/review',
        icon: IconStars,
      },
      {
        name: 'Review Votes',
        color: 'orange',
        countKey: 'reviewVotes' as const,
        description: 'Track review helpfulness votes',
        href: '/admin/reviewVoteJoin',
        icon: IconStars,
      },
      {
        name: 'Registries',
        color: 'red',
        countKey: 'registries' as const,
        description: 'Manage wishlists and gift registries',
        href: '/admin/registry',
        icon: IconGift,
      },
      {
        name: 'Registry Items',
        color: 'teal',
        countKey: 'registryItems' as const,
        description: 'Manage items in registries',
        href: '/admin/registryItem',
        icon: IconShoppingCart,
      },
      {
        name: 'Registry Purchases',
        color: 'green',
        countKey: 'registryPurchases' as const,
        description: 'Track registry item purchases',
        href: '/admin/registryPurchaseJoin',
        icon: IconShoppingCart,
      },
      {
        name: 'Registry Users',
        color: 'purple',
        countKey: 'registryUsers' as const,
        description: 'Manage registry sharing permissions',
        href: '/admin/registryUserJoin',
        icon: IconUserShield,
      },
    ],
  },
  {
    category: 'Media & Assets',
    icon: IconPhoto,
    models: [
      {
        name: 'Media Library',
        color: 'cyan',
        countKey: 'media' as const,
        description: 'Manage images, videos, and documents',
        href: '/admin/media',
        icon: IconMedia,
      },
    ],
  },
  {
    category: 'Relationships',
    icon: IconLink,
    models: [
      {
        name: 'Product-Brand Links',
        color: 'grape',
        countKey: 'pdpJoins' as const,
        description: 'Manage product and brand associations',
        href: '/admin/pdpJoin',
        icon: IconLink,
      },
      {
        name: 'Favorites',
        color: 'red',
        countKey: 'favoriteJoins' as const,
        description: 'Manage user favorites',
        href: '/admin/favoriteJoin',
        icon: IconHeart,
      },
    ],
  },
  {
    category: 'Authentication & Sessions',
    icon: IconUserShield,
    models: [
      {
        name: 'Users',
        color: 'blue',
        countKey: 'users' as const,
        description: 'Manage user accounts and permissions',
        href: '/admin/user',
        icon: IconUsers,
      },
      {
        name: 'Sessions',
        color: 'cyan',
        countKey: 'sessions' as const,
        description: 'Monitor active user sessions',
        href: '/admin/session',
        icon: IconClock,
      },
      {
        name: 'Accounts',
        color: 'green',
        countKey: 'accounts' as const,
        description: 'OAuth provider connections',
        href: '/admin/account',
        icon: IconKey,
      },
      {
        name: 'Verifications',
        color: 'yellow',
        countKey: 'verifications' as const,
        description: 'Email/phone verification codes',
        href: '/admin/verification',
        icon: IconSettings,
      },
    ],
  },
  {
    category: 'Organizations & Teams',
    icon: IconBuilding,
    models: [
      {
        name: 'Organizations',
        color: 'blue',
        countKey: 'organizations' as const,
        description: 'Manage organizations',
        href: '/admin/organization',
        icon: IconBuilding,
      },
      {
        name: 'Members',
        color: 'green',
        countKey: 'members' as const,
        description: 'Organization membership',
        href: '/admin/member',
        icon: IconUsers,
      },
      {
        name: 'Teams',
        color: 'purple',
        countKey: 'teams' as const,
        description: 'Team management',
        href: '/admin/team',
        icon: IconUsers,
      },
      {
        name: 'Team Members',
        color: 'orange',
        countKey: 'teamMembers' as const,
        description: 'Team membership',
        href: '/admin/teamMember',
        icon: IconUserShield,
      },
      {
        name: 'Invitations',
        color: 'pink',
        countKey: 'invitations' as const,
        description: 'Pending invitations',
        href: '/admin/invitation',
        icon: IconUsers,
      },
    ],
  },
  {
    category: 'Security & Access',
    icon: IconKey,
    models: [
      {
        name: 'API Keys',
        color: 'red',
        countKey: 'apiKeys' as const,
        description: 'Manage API access keys',
        href: '/admin/apiKey',
        icon: IconKey,
      },
      {
        name: 'Two Factor Auth',
        color: 'blue',
        countKey: 'twoFactor' as const,
        description: '2FA configuration',
        href: '/admin/twoFactor',
        icon: IconUserShield,
      },
      {
        name: 'Backup Codes',
        color: 'yellow',
        countKey: 'backupCodes' as const,
        description: '2FA backup codes',
        href: '/admin/backupCode',
        icon: IconKey,
      },
      {
        name: 'Passkeys',
        color: 'green',
        countKey: 'passkeys' as const,
        description: 'WebAuthn passkeys',
        href: '/admin/passkey',
        icon: IconKey,
      },
    ],
  },
  {
    category: 'Workflow Management',
    icon: IconGitBranch,
    models: [
      {
        name: 'Workflow Configs',
        color: 'teal',
        countKey: 'workflows' as const,
        description: 'Configure automated workflows',
        href: '/admin/workflowConfig',
        icon: IconGitBranch,
      },
      {
        name: 'Workflow Executions',
        color: 'violet',
        countKey: 'executions' as const,
        description: 'Monitor workflow runs',
        href: '/admin/workflowExecution',
        icon: IconClock,
      },
      {
        name: 'Workflow Schedules',
        color: 'indigo',
        countKey: 'schedules' as const,
        description: 'Cron-based scheduling',
        href: '/admin/workflowSchedule',
        icon: IconClock,
      },
    ],
  },
  {
    category: 'Legacy PIM Models',
    icon: IconDatabase,
    models: [
      {
        name: 'Product Barcodes',
        color: 'purple',
        countKey: 'barcodes' as const,
        description: 'Manage product barcodes and SKUs',
        href: '/admin/productBarcode',
        icon: IconBarcode,
      },
      {
        name: 'Product Assets',
        color: 'pink',
        countKey: 'assets' as const,
        description: 'Manage product images and documents',
        href: '/admin/productAsset',
        icon: IconPhoto,
      },
      {
        name: 'Scan History',
        color: 'indigo',
        countKey: 'scans' as const,
        description: 'View barcode scan history',
        href: '/admin/scanHistory',
        icon: IconScan,
      },
    ],
  },
];

function AdminDashboardClient({ counts }: { counts: Record<string, number> }) {
  return (
    <Container px={{ base: 'xs', sm: 'md' }} size="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} size={{ base: 'h2', sm: 'h1' }}>
            Database Admin
          </Title>
          <Text c="dimmed" mt="xs" size={{ base: 'sm', sm: 'md' }}>
            Complete CRUD operations for all database models
          </Text>
        </div>

        <FeatureFlagDemo />

        <Tabs defaultValue="all" variant="outline">
          <Tabs.List>
            <ScrollArea scrollbarSize={4} type="hover">
              <Group gap={0}>
                <Tabs.Tab leftSection={<IconList size={16} />} value="all">
                  All Models
                </Tabs.Tab>
                {modelCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Tabs.Tab
                      key={cat.category}
                      leftSection={<Icon size={16} />}
                      value={cat.category}
                    >
                      <Text size={{ base: 'xs', sm: 'sm' }}>{cat.category}</Text>
                    </Tabs.Tab>
                  );
                })}
              </Group>
            </ScrollArea>
          </Tabs.List>

          <Tabs.Panel pt="md" value="all">
            <Stack gap="xl">
              {modelCategories.map((category) => (
                <div key={category.category}>
                  <Group gap="xs" mb="md">
                    <category.icon size={20} />
                    <Title order={3} size={{ base: 'h4', sm: 'h3' }}>
                      {category.category}
                    </Title>
                  </Group>
                  <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing={{ base: 'sm', sm: 'lg' }}>
                    {category.models.map((model) => {
                      const Icon = model.icon;
                      const count = counts[model.countKey] || 0;

                      return (
                        <Card
                          key={model.href}
                          href={model.href}
                          component={Link}
                          withBorder
                          className="hover:shadow-lg transition-shadow"
                          style={{ cursor: 'pointer' }}
                          p={{ base: 'sm', sm: 'lg' }}
                        >
                          <Group align="flex-start" justify="space-between" wrap="nowrap">
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <Group gap="xs" mb="xs" wrap="nowrap">
                                <Box style={{ flexShrink: 0 }}>
                                  <Icon color={`var(--mantine-color-${model.color}-6)`} size={20} />
                                </Box>
                                <Text fw={600} size={{ base: 'sm', sm: 'md' }} truncate>
                                  {model.name}
                                </Text>
                              </Group>
                              <Text c="dimmed" mb="xs" size={{ base: 'xs', sm: 'sm' }}>
                                {model.description}
                              </Text>
                            </div>
                            <Badge
                              color={model.color}
                              style={{ flexShrink: 0 }}
                              size={{ base: 'sm', sm: 'lg' }}
                              variant="light"
                            >
                              {count.toLocaleString()}
                            </Badge>
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </div>
              ))}
            </Stack>
          </Tabs.Panel>

          {modelCategories.map((category) => (
            <Tabs.Panel key={category.category} pt="md" value={category.category}>
              <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing={{ base: 'sm', sm: 'lg' }}>
                {category.models.map((model) => {
                  const Icon = model.icon;
                  const count = counts[model.countKey] || 0;

                  return (
                    <Card
                      key={model.href}
                      href={model.href}
                      component={Link}
                      withBorder
                      className="hover:shadow-lg transition-shadow"
                      style={{ cursor: 'pointer' }}
                      p={{ base: 'sm', sm: 'lg' }}
                    >
                      <Group align="flex-start" justify="space-between" wrap="nowrap">
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Group gap="xs" mb="xs" wrap="nowrap">
                            <Box style={{ flexShrink: 0 }}>
                              <Icon color={`var(--mantine-color-${model.color}-6)`} size={20} />
                            </Box>
                            <Text fw={600} size={{ base: 'sm', sm: 'md' }} truncate>
                              {model.name}
                            </Text>
                          </Group>
                          <Text c="dimmed" mb="xs" size={{ base: 'xs', sm: 'sm' }}>
                            {model.description}
                          </Text>
                        </div>
                        <Badge
                          color={model.color}
                          style={{ flexShrink: 0 }}
                          size={{ base: 'sm', sm: 'lg' }}
                          variant="light"
                        >
                          {count.toLocaleString()}
                        </Badge>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </Container>
  );
}

export default async function AdminDashboard() {
  const counts = await getModelCounts();

  return <AdminDashboardClient counts={counts} />;
}
