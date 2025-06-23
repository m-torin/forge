'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconCalendar,
  IconChartLine,
  IconEdit,
  IconEye,
  IconFileAnalytics,
  IconFlag,
  IconHeart,
  IconPlus,
  IconRecycle,
  IconRocket,
  IconShield,
  IconStar,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

// Product lifecycle and advanced features data structures (UI only)
interface ProductLifecycleStage {
  description: string;
  endDate?: Date;
  id: string;
  isActive: boolean;
  keyMetrics: {
    salesVolume?: number;
    marketShare?: number;
    profitability?: number;
    customerAcquisitionCost?: number;
  };
  milestones: {
    id: string;
    title: string;
    description: string;
    completedDate?: Date;
    isCompleted: boolean;
  }[];
  stage: 'development' | 'introduction' | 'growth' | 'maturity' | 'decline' | 'discontinuation';
  startDate: Date;
}

interface ProductQualityCheck {
  checkDate: Date;
  checkedBy: string;
  correctiveActions?: {
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: 'open' | 'in_progress' | 'completed';
  }[];
  criteria: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    value?: string;
    requirement?: string;
  }[];
  id: string;
  notes?: string;
  score?: number; // 0-100
  status: 'passed' | 'failed' | 'pending' | 'requires_action';
  type:
    | 'incoming_inspection'
    | 'production_test'
    | 'final_inspection'
    | 'customer_feedback'
    | 'compliance_check';
}

interface ProductCompliance {
  certificateNumber?: string;
  certificationBody: string;
  certificationDate?: Date;
  expiryDate?: Date;
  id: string;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  region: string;
  requirements: {
    requirement: string;
    status: 'met' | 'not_met' | 'partial';
    evidence?: string;
  }[];
  standard: string; // ISO, FDA, CE, etc.
  status: 'compliant' | 'non_compliant' | 'pending' | 'expired';
}

interface ProductSustainability {
  carbonFootprint: {
    manufacturing: number; // kg CO2
    transportation: number;
    packaging: number;
    disposal: number;
    total: number;
  };
  certifications: {
    name: string; // Energy Star, EPEAT, etc.
    level?: string;
    validUntil: Date;
  }[];
  id: string;
  improvements: {
    area: string;
    currentValue: number;
    targetValue: number;
    deadline: Date;
    status: 'planned' | 'in_progress' | 'completed';
  }[];
  recyclability: {
    percentage: number;
    materials: {
      material: string;
      percentage: number;
      recyclable: boolean;
    }[];
  };
  sustainabilityScore: number; // 0-100
}

interface ProductAnalytics {
  metrics: {
    sales: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    customerSatisfaction: number;
    returnRate: number;
    reviewRating: number;
  };
  trends: {
    salesTrend: 'up' | 'down' | 'stable';
    priceOptimization: 'optimal' | 'too_high' | 'too_low';
    inventoryStatus: 'healthy' | 'overstock' | 'understock';
    competitorPosition: 'leading' | 'competitive' | 'lagging';
  };
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  performance: {
    sales: number;
    revenue: number;
    profit: number;
    marketShare: number;
  };
  predictions: {
    seasonalForecast: Array<{
      month: string;
      predictedSales: number;
      confidence: number;
    }>;
    recommendedActions: string[];
  };
}

interface ProductBundle {
  id: string;
  name: string;
  conversionRate: number;
}

interface ProductLifecycleFormData {
  lifecycleStages: ProductLifecycleStage[];
  qualityChecks: ProductQualityCheck[];
  compliance: ProductCompliance[];
  analytics: ProductAnalytics;
  milestoneForm: {
    title: string;
    description: string;
  };
  bundles: ProductBundle[];
}

interface ProductLifecycleProps {
  onUpdate?: () => void;
  productId: string;
  productName: string;
}

export function ProductLifecycle({ onUpdate, productId, productName }: ProductLifecycleProps) {
  // Initialize form with Mantine's useForm
  const form = useForm<ProductLifecycleFormData>({
    initialValues: {
      lifecycleStages: [],
      qualityChecks: [],
      compliance: [],
      analytics: {
        metrics: {
          sales: 0,
          revenue: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          customerSatisfaction: 0,
          returnRate: 0,
          reviewRating: 0,
        },
        trends: {
          salesTrend: 'stable',
          priceOptimization: 'optimal',
          inventoryStatus: 'healthy',
          competitorPosition: 'competitive',
        },
        timeframe: 'monthly',
        performance: {
          sales: 0,
          revenue: 0,
          profit: 0,
          marketShare: 0,
        },
        predictions: {
          seasonalForecast: [],
          recommendedActions: [],
        },
      },
      milestoneForm: {
        title: '',
        description: '',
      },
      bundles: [],
    },
  });

  // Get data from form values
  const lifecycleStages = form.values.lifecycleStages;
  const qualityChecks = form.values.qualityChecks;
  const compliance = form.values.compliance;
  const analytics = form.values.analytics;
  const bundles = form.values.bundles;

  // Keep sustainability as local state (reference data)
  const [sustainability] = useState<ProductSustainability>({
    id: 'sust-1',
    carbonFootprint: {
      disposal: 8.1,
      manufacturing: 45.2,
      packaging: 3.4,
      total: 69.5,
      transportation: 12.8,
    },
    certifications: [
      { validUntil: new Date('2026-12-31'), name: 'EPEAT Gold', level: 'Gold' },
      { validUntil: new Date('2027-06-30'), name: 'ENERGY STAR' },
    ],
    improvements: [
      {
        area: 'Carbon Footprint Reduction',
        currentValue: 69.5,
        deadline: new Date('2025-12-31'),
        status: 'in_progress',
        targetValue: 55.0,
      },
      {
        area: 'Recyclability Increase',
        currentValue: 78,
        deadline: new Date('2026-06-30'),
        status: 'planned',
        targetValue: 85,
      },
    ],
    recyclability: {
      materials: [
        { material: 'Aluminum', percentage: 35, recyclable: true },
        { material: 'Plastic (ABS)', percentage: 25, recyclable: true },
        { material: 'Steel', percentage: 18, recyclable: true },
        { material: 'Electronics', percentage: 15, recyclable: false },
        { material: 'Other', percentage: 7, recyclable: false },
      ],
      percentage: 78,
    },
    sustainabilityScore: 82,
  });

  const [activeTab, setActiveTab] = useState<
    'lifecycle' | 'quality' | 'compliance' | 'sustainability' | 'analytics' | 'create'
  >('lifecycle');

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'development':
        return 'blue';
      case 'introduction':
        return 'green';
      case 'growth':
        return 'teal';
      case 'maturity':
        return 'yellow';
      case 'decline':
        return 'orange';
      case 'discontinuation':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'compliant':
      case 'completed':
        return 'green';
      case 'failed':
      case 'non_compliant':
      case 'open':
        return 'red';
      case 'pending':
      case 'in_progress':
        return 'yellow';
      case 'requires_action':
      case 'expired':
        return 'orange';
      case 'warning':
      case 'partial':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <IconTrendingUp color="green" size={16} />;
      case 'down':
        return <IconTrendingDown color="red" size={16} />;
      case 'stable':
        return <IconChartLine color="blue" size={16} />;
      default:
        return <IconChartLine size={16} />;
    }
  };

  const getCurrentStage = () => {
    return (
      lifecycleStages.find((stage: ProductLifecycleStage) => stage.isActive) ||
      lifecycleStages[0] || {
        id: 'default',
        description: 'Product is in development phase',
        isActive: true,
        keyMetrics: {},
        milestones: [],
        stage: 'development',
        startDate: new Date(),
      }
    );
  };

  const getAverageBundleConversion = () => {
    if (!bundles.length) return 0;
    const bundleTotal = bundles.reduce((sum, bundle) => sum + (bundle.conversionRate ?? 0), 0);
    return bundleTotal / bundles.length;
  };

  const handleCreateMilestone = () => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      title: form.values.milestoneForm.title || '',
      description: form.values.milestoneForm.description || '',
      isCompleted: false,
    };

    const currentStage = getCurrentStage();
    if (currentStage) {
      const updatedStages = lifecycleStages.map((stage) =>
        stage.id === currentStage.id
          ? {
              ...stage,
              milestones: [...stage.milestones, newMilestone],
            }
          : stage,
      );
      form.setFieldValue('lifecycleStages', updatedStages);
      // Reset milestone form
      form.setFieldValue('milestoneForm.title', '');
      form.setFieldValue('milestoneForm.description', '');
    }
  };

  const handleUpdateStage = (stageId: string, updates: Partial<ProductLifecycleStage>) => {
    const updatedStages = lifecycleStages.map((stage) =>
      stage.id === stageId ? { ...stage, ...updates } : stage,
    );
    form.setFieldValue('lifecycleStages', updatedStages);
  };

  const handleUpdateQualityCheck = (checkId: string, updates: Partial<ProductQualityCheck>) => {
    const updatedChecks = qualityChecks.map((check) =>
      check.id === checkId ? { ...check, ...updates } : check,
    );
    form.setFieldValue('qualityChecks', updatedChecks);
  };

  const handleUpdateCompliance = (complianceId: string, updates: Partial<ProductCompliance>) => {
    const updatedCompliance = compliance.map((comp) =>
      comp.id === complianceId ? { ...comp, ...updates } : comp,
    );
    form.setFieldValue('compliance', updatedCompliance);
  };

  const handleUpdateAnalytics = (updates: Partial<ProductAnalytics>) => {
    form.setFieldValue('analytics', { ...analytics, ...updates });
  };

  const handleUpdateField = (field: keyof ProductLifecycleFormData, value: any) => {
    form.setFieldValue(field, value);
  };

  const handleUpdatePerformance = (updates: Partial<ProductAnalytics['performance']>) => {
    form.setFieldValue('analytics', {
      ...analytics,
      performance: {
        ...analytics.performance,
        ...updates,
      },
    });
  };

  const handleUpdatePredictions = (updates: Partial<ProductAnalytics['predictions']>) => {
    form.setFieldValue('analytics', {
      ...analytics,
      predictions: {
        ...analytics.predictions,
        ...updates,
      },
    });
  };

  return (
    <Stack>
      {/* Tab Navigation */}
      <Group>
        <Button
          leftSection={<IconRocket size={16} />}
          onClick={() => setActiveTab('lifecycle')}
          variant={activeTab === 'lifecycle' ? 'filled' : 'light'}
        >
          Lifecycle
        </Button>
        <Button
          leftSection={<IconShield size={16} />}
          onClick={() => setActiveTab('quality')}
          variant={activeTab === 'quality' ? 'filled' : 'light'}
        >
          Quality ({qualityChecks.length})
        </Button>
        <Button
          leftSection={<IconFlag size={16} />}
          onClick={() => setActiveTab('compliance')}
          variant={activeTab === 'compliance' ? 'filled' : 'light'}
        >
          Compliance ({compliance.length})
        </Button>
        <Button
          leftSection={<IconRecycle size={16} />}
          onClick={() => setActiveTab('sustainability')}
          variant={activeTab === 'sustainability' ? 'filled' : 'light'}
        >
          Sustainability
        </Button>
        <Button
          leftSection={<IconFileAnalytics size={16} />}
          onClick={() => setActiveTab('analytics')}
          variant={activeTab === 'analytics' ? 'filled' : 'light'}
        >
          Analytics
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setActiveTab('create')}
          variant={activeTab === 'create' ? 'filled' : 'light'}
        >
          Create
        </Button>
      </Group>

      {/* Lifecycle Tab */}
      {activeTab === 'lifecycle' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Product Lifecycle Management
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Add Milestone
            </Button>
          </Group>

          {/* Current Stage Overview */}
          <Card withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Group justify="space-between">
              <div>
                <Group gap="sm">
                  <Text fw={600} size="lg">
                    Current Stage: {getCurrentStage().stage.toUpperCase()}
                  </Text>
                  <Badge color={getStageColor(getCurrentStage().stage)} size="sm" variant="filled">
                    ACTIVE
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  {getCurrentStage().description}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={500}>Started: {formatDate(getCurrentStage().startDate)}</Text>
                <Text c="dimmed" size="sm">
                  Duration:{' '}
                  {Math.floor(
                    (new Date().getTime() - getCurrentStage().startDate.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{' '}
                  days
                </Text>
              </div>
            </Group>
          </Card>

          {/* Key Metrics */}
          {getCurrentStage().keyMetrics && Object.keys(getCurrentStage().keyMetrics).length > 0 && (
            <SimpleGrid cols={4} spacing="md">
              {getCurrentStage().keyMetrics.salesVolume != null && (
                <Card withBorder>
                  <Text c="dimmed" size="sm">
                    Sales Volume
                  </Text>
                  <Text fw={700} size="xl">
                    {(getCurrentStage().keyMetrics.salesVolume ?? 0).toLocaleString()}
                  </Text>
                  <Text c="dimmed" size="xs">
                    units sold
                  </Text>
                </Card>
              )}
              {getCurrentStage().keyMetrics.marketShare != null && (
                <Card withBorder>
                  <Text c="dimmed" size="sm">
                    Market Share
                  </Text>
                  <Text fw={700} size="xl">
                    {formatPercentage(getCurrentStage().keyMetrics.marketShare ?? 0)}
                  </Text>
                  <Text c="dimmed" size="xs">
                    of total market
                  </Text>
                </Card>
              )}
              {getCurrentStage().keyMetrics.profitability != null && (
                <Card withBorder>
                  <Text c="dimmed" size="sm">
                    Profitability
                  </Text>
                  <Text fw={700} size="xl">
                    {formatPercentage(getCurrentStage().keyMetrics.profitability ?? 0)}
                  </Text>
                  <Text c="dimmed" size="xs">
                    profit margin
                  </Text>
                </Card>
              )}
              {getCurrentStage().keyMetrics.customerAcquisitionCost != null && (
                <Card withBorder>
                  <Text c="dimmed" size="sm">
                    CAC
                  </Text>
                  <Text fw={700} size="xl">
                    {formatCurrency(getCurrentStage().keyMetrics.customerAcquisitionCost ?? 0)}
                  </Text>
                  <Text c="dimmed" size="xs">
                    per customer
                  </Text>
                </Card>
              )}
            </SimpleGrid>
          )}

          {/* Lifecycle Timeline */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Lifecycle Timeline
            </Text>
            <Timeline
              active={lifecycleStages.findIndex((stage: ProductLifecycleStage) => stage.isActive)}
            >
              {lifecycleStages.map((stage: ProductLifecycleStage, index: number) => (
                <Timeline.Item
                  key={stage.id}
                  bullet={
                    stage.isActive ? (
                      <IconStar size={12} />
                    ) : stage.endDate ? (
                      <IconUsers size={12} />
                    ) : (
                      <IconHeart size={12} />
                    )
                  }
                  title={stage.stage.toUpperCase()}
                >
                  <Text size="sm">{stage.description}</Text>
                  <Text c="dimmed" size="xs">
                    {formatDate(stage.startDate)} -{' '}
                    {stage.endDate ? formatDate(stage.endDate) : 'Ongoing'}
                  </Text>

                  {/* Stage Milestones */}
                  <Stack gap="xs" mt="sm">
                    {stage.milestones.map(
                      (milestone: {
                        id: string;
                        title: string;
                        description: string;
                        completedDate?: Date;
                        isCompleted: boolean;
                      }) => (
                        <Group key={milestone.id} gap="xs">
                          <Badge
                            color={milestone.isCompleted ? 'green' : 'gray'}
                            size="xs"
                            variant={milestone.isCompleted ? 'filled' : 'outline'}
                          >
                            {milestone.isCompleted ? '✓' : '○'}
                          </Badge>
                          <Text fw={milestone.isCompleted ? 400 : 500} size="xs">
                            {milestone.title}
                          </Text>
                          {milestone.completedDate && (
                            <Text c="dimmed" size="xs">
                              ({formatDate(milestone.completedDate)})
                            </Text>
                          )}
                        </Group>
                      ),
                    )}
                  </Stack>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Stack>
      )}

      {/* Quality Tab */}
      {activeTab === 'quality' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Quality Assurance
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              New Quality Check
            </Button>
          </Group>

          <Stack>
            {qualityChecks.map((check: ProductQualityCheck) => (
              <Card key={check.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{check.type.replace(/_/g, ' ').toUpperCase()}</Text>
                      <Badge color={getStatusColor(check.status)} size="sm" variant="light">
                        {check.status.toUpperCase()}
                      </Badge>
                      {check.score && (
                        <Badge color="blue" size="sm" variant="outline">
                          Score: {check.score}/100
                        </Badge>
                      )}
                    </Group>
                    <Text c="dimmed" size="sm">
                      Checked by {check.checkedBy} on {formatDate(check.checkDate)}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                {/* Criteria Results */}
                <SimpleGrid cols={2} mb="md" spacing="md">
                  {check.criteria.map(
                    (
                      criterion: {
                        name: string;
                        status: 'pass' | 'fail' | 'warning';
                        value?: string;
                        requirement?: string;
                      },
                      index: number,
                    ) => (
                      <Group key={index} justify="space-between">
                        <Text size="sm">{criterion.name}</Text>
                        <Group gap="xs">
                          <Badge color={getStatusColor(criterion.status)} size="xs" variant="light">
                            {criterion.status.toUpperCase()}
                          </Badge>
                          {criterion.value && <Text size="xs">{criterion.value}</Text>}
                        </Group>
                      </Group>
                    ),
                  )}
                </SimpleGrid>

                {check.notes && (
                  <Text c="dimmed" mb="md" size="sm">
                    <Text fw={500} span>
                      Notes:
                    </Text>{' '}
                    {check.notes}
                  </Text>
                )}

                {/* Corrective Actions */}
                {check.correctiveActions && check.correctiveActions.length > 0 && (
                  <Card withBorder>
                    <Text fw={500} mb="sm" size="sm">
                      Corrective Actions
                    </Text>
                    <Stack gap="xs">
                      {check.correctiveActions.map(
                        (
                          action: {
                            action: string;
                            assignedTo: string;
                            dueDate: Date;
                            status: 'open' | 'in_progress' | 'completed';
                          },
                          index: number,
                        ) => (
                          <Group key={index} justify="space-between">
                            <div>
                              <Text size="sm">{action.action}</Text>
                              <Text c="dimmed" size="xs">
                                Assigned to {action.assignedTo} - Due {formatDate(action.dueDate)}
                              </Text>
                            </div>
                            <Badge color={getStatusColor(action.status)} size="xs" variant="light">
                              {action.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </Group>
                        ),
                      )}
                    </Stack>
                  </Card>
                )}
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Regulatory Compliance
            </Text>
            <Button leftSection={<IconPlus size={16} />} size="sm">
              Add Compliance
            </Button>
          </Group>

          <Stack>
            {compliance.map((comp: ProductCompliance) => (
              <Card key={comp.id} withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Group gap="sm">
                      <Text fw={600}>{comp.standard}</Text>
                      <Badge color={getStatusColor(comp.status)} size="sm" variant="light">
                        {comp.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge color="blue" size="sm" variant="outline">
                        {comp.region}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                      Certified by {comp.certificationBody}
                      {comp.certificateNumber && ` (${comp.certificateNumber})`}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon variant="subtle">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <SimpleGrid cols={2} mb="md" spacing="md">
                  {comp.certificationDate && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Certification Date
                      </Text>
                      <Text fw={500} size="sm">
                        {formatDate(comp.certificationDate)}
                      </Text>
                    </div>
                  )}
                  {comp.expiryDate && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Expiry Date
                      </Text>
                      <Text
                        c={new Date(comp.expiryDate) < new Date() ? 'red' : undefined}
                        fw={500}
                        size="sm"
                      >
                        {formatDate(comp.expiryDate)}
                      </Text>
                    </div>
                  )}
                  {comp.lastAuditDate && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Last Audit
                      </Text>
                      <Text fw={500} size="sm">
                        {formatDate(comp.lastAuditDate)}
                      </Text>
                    </div>
                  )}
                  {comp.nextAuditDate && (
                    <div>
                      <Text c="dimmed" size="xs">
                        Next Audit
                      </Text>
                      <Text fw={500} size="sm">
                        {formatDate(comp.nextAuditDate)}
                      </Text>
                    </div>
                  )}
                </SimpleGrid>

                {/* Requirements */}
                <Card withBorder>
                  <Text fw={500} mb="sm" size="sm">
                    Requirements
                  </Text>
                  <Stack gap="xs">
                    {comp.requirements.map(
                      (
                        req: {
                          requirement: string;
                          status: 'met' | 'not_met' | 'partial';
                          evidence?: string;
                        },
                        index: number,
                      ) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Text size="sm">{req.requirement}</Text>
                            {req.evidence && (
                              <Text c="dimmed" size="xs">
                                Evidence: {req.evidence}
                              </Text>
                            )}
                          </div>
                          <Badge color={getStatusColor(req.status)} size="xs" variant="light">
                            {req.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Group>
                      ),
                    )}
                  </Stack>
                </Card>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Sustainability Tab */}
      {activeTab === 'sustainability' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Sustainability & Environmental Impact
            </Text>
            <Text c="green" fw={600} size="lg">
              Score: {sustainability.sustainabilityScore}/100
            </Text>
          </Group>

          {/* Carbon Footprint */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Carbon Footprint
            </Text>
            <SimpleGrid cols={5} mb="md" spacing="md">
              <div>
                <Text c="dimmed" size="xs">
                  Manufacturing
                </Text>
                <Text fw={600}>{sustainability.carbonFootprint.manufacturing} kg CO₂</Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  Transportation
                </Text>
                <Text fw={600}>{sustainability.carbonFootprint.transportation} kg CO₂</Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  Packaging
                </Text>
                <Text fw={600}>{sustainability.carbonFootprint.packaging} kg CO₂</Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  Disposal
                </Text>
                <Text fw={600}>{sustainability.carbonFootprint.disposal} kg CO₂</Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  Total
                </Text>
                <Text c="orange" fw={700} size="lg">
                  {sustainability.carbonFootprint.total} kg CO₂
                </Text>
              </div>
            </SimpleGrid>
            <Progress
              color="orange"
              size="md"
              value={(sustainability.carbonFootprint.total / 100) * 100}
            />
          </Card>

          {/* Recyclability */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Material Recyclability ({formatPercentage(sustainability.recyclability.percentage)})
            </Text>
            <Stack gap="xs">
              {sustainability.recyclability.materials.map((material, index) => (
                <Group key={index} justify="space-between">
                  <Group gap="sm">
                    <Text size="sm">{material.material}</Text>
                    <Badge color={material.recyclable ? 'green' : 'red'} size="xs" variant="light">
                      {material.recyclable ? 'Recyclable' : 'Non-recyclable'}
                    </Badge>
                  </Group>
                  <Text size="sm">{formatPercentage(material.percentage)}</Text>
                </Group>
              ))}
            </Stack>
          </Card>

          {/* Certifications */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Environmental Certifications
            </Text>
            <SimpleGrid cols={2} spacing="md">
              {sustainability.certifications.map((cert, index) => (
                <Group key={index} justify="space-between">
                  <div>
                    <Text fw={500} size="sm">
                      {cert.name}
                    </Text>
                    {cert.level && (
                      <Badge color="green" size="xs" variant="light">
                        {cert.level}
                      </Badge>
                    )}
                  </div>
                  <Text c="dimmed" size="sm">
                    Valid until {formatDate(cert.validUntil)}
                  </Text>
                </Group>
              ))}
            </SimpleGrid>
          </Card>

          {/* Improvement Plans */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Sustainability Improvements
            </Text>
            <Stack gap="md">
              {sustainability.improvements.map((improvement, index) => (
                <div key={index}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {improvement.area}
                    </Text>
                    <Badge color={getStatusColor(improvement.status)} size="sm" variant="light">
                      {improvement.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </Group>
                  <Group gap="md" mb="xs">
                    <Text size="sm">Current: {improvement.currentValue}</Text>
                    <Text size="sm">Target: {improvement.targetValue}</Text>
                    <Text size="sm">Due: {formatDate(improvement.deadline)}</Text>
                  </Group>
                  <Progress
                    color="green"
                    size="sm"
                    value={(improvement.currentValue / improvement.targetValue) * 100}
                  />
                </div>
              ))}
            </Stack>
          </Card>
        </Stack>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Stack>
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Product Analytics & Insights
            </Text>
            <Select
              onChange={(value) => {
                if (value) {
                  form.setFieldValue('analytics.timeframe', value as ProductAnalytics['timeframe']);
                }
              }}
              data={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Quarterly', value: 'quarterly' },
                { label: 'Yearly', value: 'yearly' },
              ]}
              size="sm"
              value={analytics?.timeframe || 'monthly'}
            />
          </Group>

          {!analytics && (
            <Text c="dimmed" py="xl" ta="center">
              No analytics data available yet
            </Text>
          )}

          {/* Key Metrics */}
          {analytics && (
            <SimpleGrid cols={4} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">
                  Sales
                </Text>
                <Text fw={700} size="xl">
                  {analytics.metrics.sales.toLocaleString()}
                </Text>
                <Text c="dimmed" size="xs">
                  units sold
                </Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">
                  Revenue
                </Text>
                <Text fw={700} size="xl">
                  {formatCurrency(analytics.metrics.revenue)}
                </Text>
                <Text c="dimmed" size="xs">
                  total revenue
                </Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">
                  Conversion Rate
                </Text>
                <Text fw={700} size="xl">
                  {formatPercentage(analytics.metrics.conversionRate)}
                </Text>
                <Text c="dimmed" size="xs">
                  views to sales
                </Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">
                  AOV
                </Text>
                <Text fw={700} size="xl">
                  {formatCurrency(analytics.metrics.averageOrderValue)}
                </Text>
                <Text c="dimmed" size="xs">
                  avg order value
                </Text>
              </Card>
            </SimpleGrid>
          )}

          {/* Trends */}
          <Card withBorder>
            <Text fw={500} mb="md">
              Current Trends
            </Text>
            <SimpleGrid cols={2} spacing="md">
              <Group justify="space-between">
                <Text size="sm">Sales Trend</Text>
                <Group gap="xs">
                  {getTrendIcon(analytics.trends.salesTrend)}
                  <Text fw={500} size="sm">
                    {analytics.trends.salesTrend.toUpperCase()}
                  </Text>
                </Group>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Price Optimization</Text>
                <Badge
                  color={analytics.trends.priceOptimization === 'optimal' ? 'green' : 'yellow'}
                  size="sm"
                  variant="light"
                >
                  {analytics.trends.priceOptimization.replace('_', ' ').toUpperCase()}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Inventory Status</Text>
                <Badge
                  color={analytics.trends.inventoryStatus === 'healthy' ? 'green' : 'yellow'}
                  size="sm"
                  variant="light"
                >
                  {analytics.trends.inventoryStatus.toUpperCase()}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Competitor Position</Text>
                <Badge
                  color={analytics.trends.competitorPosition === 'leading' ? 'green' : 'blue'}
                  size="sm"
                  variant="light"
                >
                  {analytics.trends.competitorPosition.toUpperCase()}
                </Badge>
              </Group>
            </SimpleGrid>
          </Card>

          {/* Predictions */}
          <Card withBorder>
            <Text fw={500} mb="md">
              AI Predictions & Recommendations
            </Text>
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text fw={500} mb="sm" size="sm">
                  Seasonal Forecast
                </Text>
                <Stack gap="xs">
                  {analytics.predictions.seasonalForecast.map(
                    (
                      forecast: { month: string; predictedSales: number; confidence: number },
                      index: number,
                    ) => (
                      <Group key={index} justify="space-between">
                        <Text size="sm">{forecast.month}</Text>
                        <Group gap="xs">
                          <Text size="sm">{forecast.predictedSales}</Text>
                          <Text c="dimmed" size="xs">
                            ({forecast.confidence}% confidence)
                          </Text>
                        </Group>
                      </Group>
                    ),
                  )}
                </Stack>
              </div>
              <div>
                <Text fw={500} mb="sm" size="sm">
                  Recommended Actions
                </Text>
                <Stack gap="xs">
                  {analytics.predictions.recommendedActions.map((action: string, index: number) => (
                    <Text key={index} size="sm">
                      • {action}
                    </Text>
                  ))}
                </Stack>
              </div>
            </SimpleGrid>
          </Card>

          {/* Customer Metrics */}
          <SimpleGrid cols={3} spacing="md">
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Customer Satisfaction
              </Text>
              <Group gap="xs">
                <Text fw={700} size="xl">
                  {analytics.metrics.customerSatisfaction}/5
                </Text>
                <Progress
                  style={{ flex: 1 }}
                  size="md"
                  value={analytics.metrics.customerSatisfaction * 20}
                />
              </Group>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Return Rate
              </Text>
              <Text fw={700} size="xl">
                {formatPercentage(analytics.metrics.returnRate)}
              </Text>
              <Text c="dimmed" size="xs">
                of total sales
              </Text>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Review Rating
              </Text>
              <Group gap="xs">
                <Text fw={700} size="xl">
                  {analytics.metrics.reviewRating}/5
                </Text>
                <Progress
                  color="yellow"
                  style={{ flex: 1 }}
                  size="md"
                  value={analytics.metrics.reviewRating * 20}
                />
              </Group>
            </Card>
          </SimpleGrid>
        </Stack>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <Stack>
          <Text fw={600} size="lg">
            Create New Lifecycle Item
          </Text>

          <SimpleGrid cols={2} spacing="xl">
            {/* Create Milestone */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Create Milestone</Text>
                <TextInput
                  placeholder="e.g., Beta Testing Complete"
                  label="Milestone Title"
                  required
                  {...form.getInputProps('milestoneForm.title')}
                />
                <Textarea
                  placeholder="Describe the milestone"
                  rows={3}
                  label="Description"
                  {...form.getInputProps('milestoneForm.description')}
                />
                <DatePickerInput
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Select target date"
                  label="Target Date"
                />
                <Select
                  data={[
                    { label: 'Development', value: 'development' },
                    { label: 'Introduction', value: 'introduction' },
                    { label: 'Growth', value: 'growth' },
                    { label: 'Maturity', value: 'maturity' },
                    { label: 'Decline', value: 'decline' },
                  ]}
                  label="Lifecycle Stage"
                  required
                />
                <Button fullWidth onClick={handleCreateMilestone}>
                  Create Milestone
                </Button>
              </Stack>
            </Card>

            {/* Create Quality Check */}
            <Card withBorder>
              <Stack>
                <Text fw={500}>Schedule Quality Check</Text>
                <Select
                  data={[
                    { label: 'Incoming Inspection', value: 'incoming_inspection' },
                    { label: 'Production Test', value: 'production_test' },
                    { label: 'Final Inspection', value: 'final_inspection' },
                    { label: 'Customer Feedback Review', value: 'customer_feedback' },
                    { label: 'Compliance Check', value: 'compliance_check' },
                  ]}
                  label="Check Type"
                  required
                />
                <TextInput placeholder="Quality team or person" label="Assigned To" required />
                <DatePickerInput
                  leftSection={<IconCalendar size={16} />}
                  placeholder="Select check date"
                  label="Check Date"
                />
                <Textarea placeholder="Additional notes or requirements" rows={3} label="Notes" />
                <Button fullWidth>Schedule Quality Check</Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      )}
    </Stack>
  );
}
