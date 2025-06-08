"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  NumberInput,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Timeline,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
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
  IconSettings,
  IconShield,
  IconStar,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

// Product lifecycle and advanced features data structures (UI only)
interface ProductLifecycleStage {
  id: string;
  stage: "development" | "introduction" | "growth" | "maturity" | "decline" | "discontinuation";
  startDate: Date;
  endDate?: Date;
  description: string;
  keyMetrics: {
    salesVolume?: number;
    marketShare?: number;
    profitability?: number;
    customerAcquisitionCost?: number;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    completedDate?: Date;
    isCompleted: boolean;
  }>;
  isActive: boolean;
}

interface ProductQualityCheck {
  id: string;
  type: "incoming_inspection" | "production_test" | "final_inspection" | "customer_feedback" | "compliance_check";
  status: "passed" | "failed" | "pending" | "requires_action";
  checkDate: Date;
  checkedBy: string;
  score?: number; // 0-100
  criteria: Array<{
    name: string;
    status: "pass" | "fail" | "warning";
    value?: string;
    requirement?: string;
  }>;
  notes?: string;
  correctiveActions?: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: "open" | "in_progress" | "completed";
  }>;
}

interface ProductCompliance {
  id: string;
  standard: string; // ISO, FDA, CE, etc.
  region: string;
  status: "compliant" | "non_compliant" | "pending" | "expired";
  certificationDate?: Date;
  expiryDate?: Date;
  certificationBody: string;
  certificateNumber?: string;
  requirements: Array<{
    requirement: string;
    status: "met" | "not_met" | "partial";
    evidence?: string;
  }>;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
}

interface ProductSustainability {
  id: string;
  carbonFootprint: {
    manufacturing: number; // kg CO2
    transportation: number;
    packaging: number;
    disposal: number;
    total: number;
  };
  recyclability: {
    percentage: number;
    materials: Array<{
      material: string;
      percentage: number;
      recyclable: boolean;
    }>;
  };
  certifications: Array<{
    name: string; // Energy Star, EPEAT, etc.
    level?: string;
    validUntil: Date;
  }>;
  sustainabilityScore: number; // 0-100
  improvements: Array<{
    area: string;
    currentValue: number;
    targetValue: number;
    deadline: Date;
    status: "planned" | "in_progress" | "completed";
  }>;
}

interface ProductAnalytics {
  id: string;
  timeframe: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  metrics: {
    views: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    customerSatisfaction: number;
    returnRate: number;
    reviewRating: number;
  };
  trends: {
    salesTrend: "up" | "down" | "stable";
    priceOptimization: "optimal" | "too_high" | "too_low";
    inventoryStatus: "healthy" | "overstock" | "understock";
    competitorPosition: "leading" | "competitive" | "lagging";
  };
  predictions: {
    nextMonthSales: number;
    seasonalForecast: Array<{
      month: string;
      predictedSales: number;
      confidence: number;
    }>;
    lifecycleStage: string;
    recommendedActions: string[];
  };
}

interface ProductLifecycleModalProps {
  opened: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onUpdate?: () => void;
}

export function ProductLifecycleModal({
  opened,
  onClose,
  productId,
  productName,
  onUpdate,
}: ProductLifecycleModalProps) {
  // Demo data
  const [lifecycleStages] = useState<ProductLifecycleStage[]>([
    {
      id: "stage-1",
      stage: "development",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-30"),
      description: "Initial product development and prototyping phase",
      keyMetrics: {},
      milestones: [
        {
          id: "m1",
          title: "Concept Approval",
          description: "Product concept approved by stakeholders",
          completedDate: new Date("2024-01-15"),
          isCompleted: true,
        },
        {
          id: "m2",
          title: "Prototype Development",
          description: "First working prototype created",
          completedDate: new Date("2024-03-20"),
          isCompleted: true,
        },
        {
          id: "m3",
          title: "Testing Complete",
          description: "All testing phases completed successfully",
          completedDate: new Date("2024-06-15"),
          isCompleted: true,
        },
      ],
      isActive: false,
    },
    {
      id: "stage-2",
      stage: "introduction",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-12-31"),
      description: "Product launch and initial market introduction",
      keyMetrics: {
        salesVolume: 1250,
        marketShare: 0.8,
        profitability: 15.2,
        customerAcquisitionCost: 45.50,
      },
      milestones: [
        {
          id: "m4",
          title: "Market Launch",
          description: "Official product launch in primary markets",
          completedDate: new Date("2024-07-15"),
          isCompleted: true,
        },
        {
          id: "m5",
          title: "Marketing Campaign",
          description: "Launch marketing campaign executed",
          completedDate: new Date("2024-08-01"),
          isCompleted: true,
        },
        {
          id: "m6",
          title: "Customer Feedback Integration",
          description: "First round of customer feedback incorporated",
          isCompleted: false,
        },
      ],
      isActive: false,
    },
    {
      id: "stage-3",
      stage: "growth",
      startDate: new Date("2025-01-01"),
      description: "Rapid sales growth and market expansion phase",
      keyMetrics: {
        salesVolume: 3800,
        marketShare: 2.1,
        profitability: 28.5,
        customerAcquisitionCost: 32.25,
      },
      milestones: [
        {
          id: "m7",
          title: "Market Expansion",
          description: "Expand to secondary markets",
          isCompleted: false,
        },
        {
          id: "m8",
          title: "Feature Enhancement",
          description: "Add new features based on feedback",
          isCompleted: false,
        },
        {
          id: "m9",
          title: "Partnership Development",
          description: "Establish key partnerships for distribution",
          isCompleted: false,
        },
      ],
      isActive: true,
    },
  ]);

  const [qualityChecks] = useState<ProductQualityCheck[]>([
    {
      id: "qc-1",
      type: "final_inspection",
      status: "passed",
      checkDate: new Date("2025-01-15"),
      checkedBy: "Quality Team Alpha",
      score: 94,
      criteria: [
        { name: "Build Quality", status: "pass", value: "Excellent", requirement: "Good or better" },
        { name: "Performance", status: "pass", value: "95%", requirement: ">90%" },
        { name: "Safety", status: "pass", value: "Compliant", requirement: "ISO 9001" },
        { name: "Aesthetics", status: "warning", value: "Minor scratches", requirement: "No defects" },
      ],
      notes: "Minor cosmetic issues noted but within acceptable limits",
      correctiveActions: [
        {
          action: "Improve packaging to prevent scratches",
          assignedTo: "Production Team",
          dueDate: new Date("2025-02-01"),
          status: "in_progress",
        },
      ],
    },
    {
      id: "qc-2",
      type: "compliance_check",
      status: "passed",
      checkDate: new Date("2025-01-10"),
      checkedBy: "Compliance Officer",
      score: 98,
      criteria: [
        { name: "CE Marking", status: "pass", value: "Certified", requirement: "Required for EU" },
        { name: "FCC Compliance", status: "pass", value: "Class B", requirement: "Class B or better" },
        { name: "RoHS Compliance", status: "pass", value: "Compliant", requirement: "Must comply" },
        { name: "Energy Efficiency", status: "pass", value: "A+", requirement: "A or better" },
      ],
      notes: "All regulatory requirements met",
    },
    {
      id: "qc-3",
      type: "customer_feedback",
      status: "requires_action",
      checkDate: new Date("2025-01-12"),
      checkedBy: "Customer Success Team",
      score: 78,
      criteria: [
        { name: "Overall Satisfaction", status: "pass", value: "4.2/5", requirement: ">4.0" },
        { name: "Ease of Use", status: "warning", value: "3.8/5", requirement: ">4.0" },
        { name: "Performance", status: "pass", value: "4.5/5", requirement: ">4.0" },
        { name: "Value for Money", status: "fail", value: "3.2/5", requirement: ">4.0" },
      ],
      notes: "Customers concerned about price point and some usability issues",
      correctiveActions: [
        {
          action: "Review pricing strategy and competitive positioning",
          assignedTo: "Product Marketing",
          dueDate: new Date("2025-02-15"),
          status: "open",
        },
        {
          action: "Improve user interface based on feedback",
          assignedTo: "UX Team",
          dueDate: new Date("2025-03-01"),
          status: "open",
        },
      ],
    },
  ]);

  const [compliance] = useState<ProductCompliance[]>([
    {
      id: "comp-1",
      standard: "ISO 9001:2015",
      region: "Global",
      status: "compliant",
      certificationDate: new Date("2024-03-15"),
      expiryDate: new Date("2027-03-14"),
      certificationBody: "SGS",
      certificateNumber: "ISO-9001-2024-001",
      requirements: [
        { requirement: "Quality Management System", status: "met", evidence: "QMS-DOC-001" },
        { requirement: "Customer Focus", status: "met", evidence: "CRM-PROC-002" },
        { requirement: "Leadership", status: "met", evidence: "LEAD-POLICY-003" },
        { requirement: "Engagement of People", status: "met", evidence: "HR-PROC-004" },
      ],
      lastAuditDate: new Date("2024-12-10"),
      nextAuditDate: new Date("2025-12-10"),
    },
    {
      id: "comp-2",
      standard: "CE Marking",
      region: "European Union",
      status: "compliant",
      certificationDate: new Date("2024-06-20"),
      expiryDate: new Date("2029-06-19"),
      certificationBody: "TÜV SÜD",
      certificateNumber: "CE-2024-EMC-789",
      requirements: [
        { requirement: "EMC Directive", status: "met", evidence: "EMC-TEST-001" },
        { requirement: "Low Voltage Directive", status: "met", evidence: "LVD-TEST-002" },
        { requirement: "RoHS Directive", status: "met", evidence: "ROHS-CERT-003" },
      ],
      lastAuditDate: new Date("2024-06-15"),
      nextAuditDate: new Date("2026-06-15"),
    },
    {
      id: "comp-3",
      standard: "Energy Star",
      region: "North America",
      status: "pending",
      certificationBody: "EPA",
      requirements: [
        { requirement: "Energy Efficiency", status: "met", evidence: "ENERGY-TEST-001" },
        { requirement: "Performance Requirements", status: "partial", evidence: "PERF-TEST-002" },
        { requirement: "Testing Protocols", status: "not_met" },
      ],
      nextAuditDate: new Date("2025-03-01"),
    },
  ]);

  const [sustainability] = useState<ProductSustainability>({
    id: "sust-1",
    carbonFootprint: {
      manufacturing: 45.2,
      transportation: 12.8,
      packaging: 3.4,
      disposal: 8.1,
      total: 69.5,
    },
    recyclability: {
      percentage: 78,
      materials: [
        { material: "Aluminum", percentage: 35, recyclable: true },
        { material: "Plastic (ABS)", percentage: 25, recyclable: true },
        { material: "Steel", percentage: 18, recyclable: true },
        { material: "Electronics", percentage: 15, recyclable: false },
        { material: "Other", percentage: 7, recyclable: false },
      ],
    },
    certifications: [
      { name: "EPEAT Gold", level: "Gold", validUntil: new Date("2026-12-31") },
      { name: "ENERGY STAR", validUntil: new Date("2027-06-30") },
    ],
    sustainabilityScore: 82,
    improvements: [
      {
        area: "Carbon Footprint Reduction",
        currentValue: 69.5,
        targetValue: 55.0,
        deadline: new Date("2025-12-31"),
        status: "in_progress",
      },
      {
        area: "Recyclability Increase",
        currentValue: 78,
        targetValue: 85,
        deadline: new Date("2026-06-30"),
        status: "planned",
      },
    ],
  });

  const [analytics] = useState<ProductAnalytics>({
    id: "analytics-1",
    timeframe: "monthly",
    metrics: {
      views: 15420,
      sales: 892,
      revenue: 258456.78,
      conversionRate: 5.8,
      averageOrderValue: 289.99,
      customerSatisfaction: 4.2,
      returnRate: 2.1,
      reviewRating: 4.3,
    },
    trends: {
      salesTrend: "up",
      priceOptimization: "optimal",
      inventoryStatus: "healthy",
      competitorPosition: "competitive",
    },
    predictions: {
      nextMonthSales: 1050,
      seasonalForecast: [
        { month: "Feb", predictedSales: 950, confidence: 85 },
        { month: "Mar", predictedSales: 1100, confidence: 78 },
        { month: "Apr", predictedSales: 1200, confidence: 72 },
        { month: "May", predictedSales: 1350, confidence: 68 },
      ],
      lifecycleStage: "growth",
      recommendedActions: [
        "Consider expanding to new markets",
        "Increase inventory for expected growth",
        "Develop product variants for different segments",
        "Strengthen customer retention programs",
      ],
    },
  });

  const [activeTab, setActiveTab] = useState<"lifecycle" | "quality" | "compliance" | "sustainability" | "analytics" | "create">("lifecycle");

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "development": return "blue";
      case "introduction": return "green";
      case "growth": return "teal";
      case "maturity": return "yellow";
      case "decline": return "orange";
      case "discontinuation": return "red";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": case "compliant": case "completed": return "green";
      case "failed": case "non_compliant": case "open": return "red";
      case "pending": case "in_progress": return "yellow";
      case "requires_action": case "expired": return "orange";
      case "warning": case "partial": return "yellow";
      default: return "gray";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <IconTrendingUp size={16} color="green" />;
      case "down": return <IconTrendingDown size={16} color="red" />;
      case "stable": return <IconChartLine size={16} color="blue" />;
      default: return <IconChartLine size={16} />;
    }
  };

  const getCurrentStage = () => {
    return lifecycleStages.find(stage => stage.isActive) || lifecycleStages[lifecycleStages.length - 1];
  };

  const handleCreateMilestone = () => {
    notifications.show({
      color: "green",
      message: "Milestone created successfully",
      title: "Success",
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title={`Product Lifecycle & Advanced Features - ${productName}`}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        {/* Tab Navigation */}
        <Group>
          <Button
            variant={activeTab === "lifecycle" ? "filled" : "light"}
            onClick={() => setActiveTab("lifecycle")}
            leftSection={<IconRocket size={16} />}
          >
            Lifecycle
          </Button>
          <Button
            variant={activeTab === "quality" ? "filled" : "light"}
            onClick={() => setActiveTab("quality")}
            leftSection={<IconShield size={16} />}
          >
            Quality ({qualityChecks.length})
          </Button>
          <Button
            variant={activeTab === "compliance" ? "filled" : "light"}
            onClick={() => setActiveTab("compliance")}
            leftSection={<IconFlag size={16} />}
          >
            Compliance ({compliance.length})
          </Button>
          <Button
            variant={activeTab === "sustainability" ? "filled" : "light"}
            onClick={() => setActiveTab("sustainability")}
            leftSection={<IconRecycle size={16} />}
          >
            Sustainability
          </Button>
          <Button
            variant={activeTab === "analytics" ? "filled" : "light"}
            onClick={() => setActiveTab("analytics")}
            leftSection={<IconFileAnalytics size={16} />}
          >
            Analytics
          </Button>
          <Button
            variant={activeTab === "create" ? "filled" : "light"}
            onClick={() => setActiveTab("create")}
            leftSection={<IconPlus size={16} />}
          >
            Create
          </Button>
        </Group>

        {/* Lifecycle Tab */}
        {activeTab === "lifecycle" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Product Lifecycle Management</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Add Milestone
              </Button>
            </Group>

            {/* Current Stage Overview */}
            <Card withBorder style={{ backgroundColor: "var(--mantine-color-blue-0)" }}>
              <Group justify="space-between">
                <div>
                  <Group gap="sm">
                    <Text fw={600} size="lg">Current Stage: {getCurrentStage().stage.toUpperCase()}</Text>
                    <Badge color={getStageColor(getCurrentStage().stage)} variant="filled" size="sm">
                      ACTIVE
                    </Badge>
                  </Group>
                  <Text c="dimmed" size="sm">{getCurrentStage().description}</Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text fw={500}>Started: {formatDate(getCurrentStage().startDate)}</Text>
                  <Text c="dimmed" size="sm">
                    Duration: {Math.floor((new Date().getTime() - getCurrentStage().startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </div>
              </Group>
            </Card>

            {/* Key Metrics */}
            {getCurrentStage().keyMetrics && Object.keys(getCurrentStage().keyMetrics).length > 0 && (
              <SimpleGrid cols={4} spacing="md">
                {getCurrentStage().keyMetrics.salesVolume && (
                  <Card withBorder>
                    <Text c="dimmed" size="sm">Sales Volume</Text>
                    <Text fw={700} size="xl">{getCurrentStage().keyMetrics.salesVolume.toLocaleString()}</Text>
                    <Text c="dimmed" size="xs">units sold</Text>
                  </Card>
                )}
                {getCurrentStage().keyMetrics.marketShare && (
                  <Card withBorder>
                    <Text c="dimmed" size="sm">Market Share</Text>
                    <Text fw={700} size="xl">{formatPercentage(getCurrentStage().keyMetrics.marketShare)}</Text>
                    <Text c="dimmed" size="xs">of total market</Text>
                  </Card>
                )}
                {getCurrentStage().keyMetrics.profitability && (
                  <Card withBorder>
                    <Text c="dimmed" size="sm">Profitability</Text>
                    <Text fw={700} size="xl">{formatPercentage(getCurrentStage().keyMetrics.profitability)}</Text>
                    <Text c="dimmed" size="xs">profit margin</Text>
                  </Card>
                )}
                {getCurrentStage().keyMetrics.customerAcquisitionCost && (
                  <Card withBorder>
                    <Text c="dimmed" size="sm">CAC</Text>
                    <Text fw={700} size="xl">{formatCurrency(getCurrentStage().keyMetrics.customerAcquisitionCost)}</Text>
                    <Text c="dimmed" size="xs">per customer</Text>
                  </Card>
                )}
              </SimpleGrid>
            )}

            {/* Lifecycle Timeline */}
            <Card withBorder>
              <Text fw={500} mb="md">Lifecycle Timeline</Text>
              <Timeline active={lifecycleStages.findIndex(stage => stage.isActive)}>
                {lifecycleStages.map((stage, index) => (
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
                      {formatDate(stage.startDate)} - {stage.endDate ? formatDate(stage.endDate) : "Ongoing"}
                    </Text>
                    
                    {/* Stage Milestones */}
                    <Stack gap="xs" mt="sm">
                      {stage.milestones.map((milestone) => (
                        <Group key={milestone.id} gap="xs">
                          <Badge
                            color={milestone.isCompleted ? "green" : "gray"}
                            variant={milestone.isCompleted ? "filled" : "outline"}
                            size="xs"
                          >
                            {milestone.isCompleted ? "✓" : "○"}
                          </Badge>
                          <Text size="xs" fw={milestone.isCompleted ? 400 : 500}>
                            {milestone.title}
                          </Text>
                          {milestone.completedDate && (
                            <Text c="dimmed" size="xs">
                              ({formatDate(milestone.completedDate)})
                            </Text>
                          )}
                        </Group>
                      ))}
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Stack>
        )}

        {/* Quality Tab */}
        {activeTab === "quality" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Quality Assurance</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                New Quality Check
              </Button>
            </Group>

            <Stack>
              {qualityChecks.map((check) => (
                <Card key={check.id} withBorder>
                  <Group justify="space-between" mb="sm">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>{check.type.replace(/_/g, " ").toUpperCase()}</Text>
                        <Badge color={getStatusColor(check.status)} variant="light" size="sm">
                          {check.status.toUpperCase()}
                        </Badge>
                        {check.score && (
                          <Badge color="blue" variant="outline" size="sm">
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
                  <SimpleGrid cols={2} spacing="md" mb="md">
                    {check.criteria.map((criterion, index) => (
                      <Group key={index} justify="space-between">
                        <Text size="sm">{criterion.name}</Text>
                        <Group gap="xs">
                          <Badge color={getStatusColor(criterion.status)} variant="light" size="xs">
                            {criterion.status.toUpperCase()}
                          </Badge>
                          {criterion.value && (
                            <Text size="xs">{criterion.value}</Text>
                          )}
                        </Group>
                      </Group>
                    ))}
                  </SimpleGrid>

                  {check.notes && (
                    <Text size="sm" c="dimmed" mb="md">
                      <Text fw={500} span>Notes:</Text> {check.notes}
                    </Text>
                  )}

                  {/* Corrective Actions */}
                  {check.correctiveActions && check.correctiveActions.length > 0 && (
                    <Card withBorder>
                      <Text fw={500} mb="sm" size="sm">Corrective Actions</Text>
                      <Stack gap="xs">
                        {check.correctiveActions.map((action, index) => (
                          <Group key={index} justify="space-between">
                            <div>
                              <Text size="sm">{action.action}</Text>
                              <Text c="dimmed" size="xs">
                                Assigned to {action.assignedTo} - Due {formatDate(action.dueDate)}
                              </Text>
                            </div>
                            <Badge color={getStatusColor(action.status)} variant="light" size="xs">
                              {action.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Card>
                  )}
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Regulatory Compliance</Text>
              <Button leftSection={<IconPlus size={16} />} size="sm">
                Add Compliance
              </Button>
            </Group>

            <Stack>
              {compliance.map((comp) => (
                <Card key={comp.id} withBorder>
                  <Group justify="space-between" mb="sm">
                    <div>
                      <Group gap="sm">
                        <Text fw={600}>{comp.standard}</Text>
                        <Badge color={getStatusColor(comp.status)} variant="light" size="sm">
                          {comp.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge color="blue" variant="outline" size="sm">
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

                  <SimpleGrid cols={2} spacing="md" mb="md">
                    {comp.certificationDate && (
                      <div>
                        <Text c="dimmed" size="xs">Certification Date</Text>
                        <Text fw={500} size="sm">{formatDate(comp.certificationDate)}</Text>
                      </div>
                    )}
                    {comp.expiryDate && (
                      <div>
                        <Text c="dimmed" size="xs">Expiry Date</Text>
                        <Text fw={500} size="sm" c={new Date(comp.expiryDate) < new Date() ? "red" : undefined}>
                          {formatDate(comp.expiryDate)}
                        </Text>
                      </div>
                    )}
                    {comp.lastAuditDate && (
                      <div>
                        <Text c="dimmed" size="xs">Last Audit</Text>
                        <Text fw={500} size="sm">{formatDate(comp.lastAuditDate)}</Text>
                      </div>
                    )}
                    {comp.nextAuditDate && (
                      <div>
                        <Text c="dimmed" size="xs">Next Audit</Text>
                        <Text fw={500} size="sm">{formatDate(comp.nextAuditDate)}</Text>
                      </div>
                    )}
                  </SimpleGrid>

                  {/* Requirements */}
                  <Card withBorder>
                    <Text fw={500} mb="sm" size="sm">Requirements</Text>
                    <Stack gap="xs">
                      {comp.requirements.map((req, index) => (
                        <Group key={index} justify="space-between">
                          <div>
                            <Text size="sm">{req.requirement}</Text>
                            {req.evidence && (
                              <Text c="dimmed" size="xs">Evidence: {req.evidence}</Text>
                            )}
                          </div>
                          <Badge color={getStatusColor(req.status)} variant="light" size="xs">
                            {req.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Sustainability Tab */}
        {activeTab === "sustainability" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Sustainability & Environmental Impact</Text>
              <Text fw={600} size="lg" c="green">
                Score: {sustainability.sustainabilityScore}/100
              </Text>
            </Group>

            {/* Carbon Footprint */}
            <Card withBorder>
              <Text fw={500} mb="md">Carbon Footprint</Text>
              <SimpleGrid cols={5} spacing="md" mb="md">
                <div>
                  <Text c="dimmed" size="xs">Manufacturing</Text>
                  <Text fw={600}>{sustainability.carbonFootprint.manufacturing} kg CO₂</Text>
                </div>
                <div>
                  <Text c="dimmed" size="xs">Transportation</Text>
                  <Text fw={600}>{sustainability.carbonFootprint.transportation} kg CO₂</Text>
                </div>
                <div>
                  <Text c="dimmed" size="xs">Packaging</Text>
                  <Text fw={600}>{sustainability.carbonFootprint.packaging} kg CO₂</Text>
                </div>
                <div>
                  <Text c="dimmed" size="xs">Disposal</Text>
                  <Text fw={600}>{sustainability.carbonFootprint.disposal} kg CO₂</Text>
                </div>
                <div>
                  <Text c="dimmed" size="xs">Total</Text>
                  <Text fw={700} size="lg" c="orange">{sustainability.carbonFootprint.total} kg CO₂</Text>
                </div>
              </SimpleGrid>
              <Progress value={(sustainability.carbonFootprint.total / 100) * 100} color="orange" size="md" />
            </Card>

            {/* Recyclability */}
            <Card withBorder>
              <Text fw={500} mb="md">Material Recyclability ({formatPercentage(sustainability.recyclability.percentage)})</Text>
              <Stack gap="xs">
                {sustainability.recyclability.materials.map((material, index) => (
                  <Group key={index} justify="space-between">
                    <Group gap="sm">
                      <Text size="sm">{material.material}</Text>
                      <Badge
                        color={material.recyclable ? "green" : "red"}
                        variant="light"
                        size="xs"
                      >
                        {material.recyclable ? "Recyclable" : "Non-recyclable"}
                      </Badge>
                    </Group>
                    <Text size="sm">{formatPercentage(material.percentage)}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>

            {/* Certifications */}
            <Card withBorder>
              <Text fw={500} mb="md">Environmental Certifications</Text>
              <SimpleGrid cols={2} spacing="md">
                {sustainability.certifications.map((cert, index) => (
                  <Group key={index} justify="space-between">
                    <div>
                      <Text fw={500} size="sm">{cert.name}</Text>
                      {cert.level && (
                        <Badge color="green" variant="light" size="xs">{cert.level}</Badge>
                      )}
                    </div>
                    <Text c="dimmed" size="sm">Valid until {formatDate(cert.validUntil)}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Card>

            {/* Improvement Plans */}
            <Card withBorder>
              <Text fw={500} mb="md">Sustainability Improvements</Text>
              <Stack gap="md">
                {sustainability.improvements.map((improvement, index) => (
                  <div key={index}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500} size="sm">{improvement.area}</Text>
                      <Badge color={getStatusColor(improvement.status)} variant="light" size="sm">
                        {improvement.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </Group>
                    <Group gap="md" mb="xs">
                      <Text size="sm">Current: {improvement.currentValue}</Text>
                      <Text size="sm">Target: {improvement.targetValue}</Text>
                      <Text size="sm">Due: {formatDate(improvement.deadline)}</Text>
                    </Group>
                    <Progress
                      value={(improvement.currentValue / improvement.targetValue) * 100}
                      color="green"
                      size="sm"
                    />
                  </div>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">Product Analytics & Insights</Text>
              <Select
                value={analytics.timeframe}
                data={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "yearly", label: "Yearly" },
                ]}
                size="sm"
              />
            </Group>

            {/* Key Metrics */}
            <SimpleGrid cols={4} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Sales</Text>
                <Text fw={700} size="xl">{analytics.metrics.sales.toLocaleString()}</Text>
                <Text c="dimmed" size="xs">units sold</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Revenue</Text>
                <Text fw={700} size="xl">{formatCurrency(analytics.metrics.revenue)}</Text>
                <Text c="dimmed" size="xs">total revenue</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Conversion Rate</Text>
                <Text fw={700} size="xl">{formatPercentage(analytics.metrics.conversionRate)}</Text>
                <Text c="dimmed" size="xs">views to sales</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">AOV</Text>
                <Text fw={700} size="xl">{formatCurrency(analytics.metrics.averageOrderValue)}</Text>
                <Text c="dimmed" size="xs">avg order value</Text>
              </Card>
            </SimpleGrid>

            {/* Trends */}
            <Card withBorder>
              <Text fw={500} mb="md">Current Trends</Text>
              <SimpleGrid cols={2} spacing="md">
                <Group justify="space-between">
                  <Text size="sm">Sales Trend</Text>
                  <Group gap="xs">
                    {getTrendIcon(analytics.trends.salesTrend)}
                    <Text fw={500} size="sm">{analytics.trends.salesTrend.toUpperCase()}</Text>
                  </Group>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Price Optimization</Text>
                  <Badge
                    color={analytics.trends.priceOptimization === "optimal" ? "green" : "yellow"}
                    variant="light"
                    size="sm"
                  >
                    {analytics.trends.priceOptimization.replace("_", " ").toUpperCase()}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Inventory Status</Text>
                  <Badge
                    color={analytics.trends.inventoryStatus === "healthy" ? "green" : "yellow"}
                    variant="light"
                    size="sm"
                  >
                    {analytics.trends.inventoryStatus.toUpperCase()}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Competitor Position</Text>
                  <Badge
                    color={analytics.trends.competitorPosition === "leading" ? "green" : "blue"}
                    variant="light"
                    size="sm"
                  >
                    {analytics.trends.competitorPosition.toUpperCase()}
                  </Badge>
                </Group>
              </SimpleGrid>
            </Card>

            {/* Predictions */}
            <Card withBorder>
              <Text fw={500} mb="md">AI Predictions & Recommendations</Text>
              <SimpleGrid cols={2} spacing="md">
                <div>
                  <Text fw={500} mb="sm" size="sm">Seasonal Forecast</Text>
                  <Stack gap="xs">
                    {analytics.predictions.seasonalForecast.map((forecast, index) => (
                      <Group key={index} justify="space-between">
                        <Text size="sm">{forecast.month}</Text>
                        <Group gap="xs">
                          <Text size="sm">{forecast.predictedSales}</Text>
                          <Text c="dimmed" size="xs">({forecast.confidence}% confidence)</Text>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </div>
                <div>
                  <Text fw={500} mb="sm" size="sm">Recommended Actions</Text>
                  <Stack gap="xs">
                    {analytics.predictions.recommendedActions.map((action, index) => (
                      <Text key={index} size="sm">• {action}</Text>
                    ))}
                  </Stack>
                </div>
              </SimpleGrid>
              
              <Group justify="center" mt="md">
                <Badge color="blue" variant="light" size="lg">
                  Predicted Lifecycle Stage: {analytics.predictions.lifecycleStage.toUpperCase()}
                </Badge>
              </Group>
            </Card>

            {/* Customer Metrics */}
            <SimpleGrid cols={3} spacing="md">
              <Card withBorder>
                <Text c="dimmed" size="sm">Customer Satisfaction</Text>
                <Group gap="xs">
                  <Text fw={700} size="xl">{analytics.metrics.customerSatisfaction}/5</Text>
                  <Progress value={analytics.metrics.customerSatisfaction * 20} size="md" style={{ flex: 1 }} />
                </Group>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Return Rate</Text>
                <Text fw={700} size="xl">{formatPercentage(analytics.metrics.returnRate)}</Text>
                <Text c="dimmed" size="xs">of total sales</Text>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm">Review Rating</Text>
                <Group gap="xs">
                  <Text fw={700} size="xl">{analytics.metrics.reviewRating}/5</Text>
                  <Progress value={analytics.metrics.reviewRating * 20} color="yellow" size="md" style={{ flex: 1 }} />
                </Group>
              </Card>
            </SimpleGrid>
          </Stack>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <Stack>
            <Text fw={600} size="lg">Create New Lifecycle Item</Text>

            <SimpleGrid cols={2} spacing="xl">
              {/* Create Milestone */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Create Milestone</Text>
                  <TextInput
                    label="Milestone Title"
                    placeholder="e.g., Beta Testing Complete"
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe the milestone"
                    rows={3}
                  />
                  <DatePickerInput
                    label="Target Date"
                    placeholder="Select target date"
                    leftSection={<IconCalendar size={16} />}
                  />
                  <Select
                    label="Lifecycle Stage"
                    data={[
                      { value: "development", label: "Development" },
                      { value: "introduction", label: "Introduction" },
                      { value: "growth", label: "Growth" },
                      { value: "maturity", label: "Maturity" },
                      { value: "decline", label: "Decline" },
                    ]}
                    required
                  />
                  <Button onClick={handleCreateMilestone} fullWidth>
                    Create Milestone
                  </Button>
                </Stack>
              </Card>

              {/* Create Quality Check */}
              <Card withBorder>
                <Stack>
                  <Text fw={500}>Schedule Quality Check</Text>
                  <Select
                    label="Check Type"
                    data={[
                      { value: "incoming_inspection", label: "Incoming Inspection" },
                      { value: "production_test", label: "Production Test" },
                      { value: "final_inspection", label: "Final Inspection" },
                      { value: "customer_feedback", label: "Customer Feedback Review" },
                      { value: "compliance_check", label: "Compliance Check" },
                    ]}
                    required
                  />
                  <TextInput
                    label="Assigned To"
                    placeholder="Quality team or person"
                    required
                  />
                  <DatePickerInput
                    label="Check Date"
                    placeholder="Select check date"
                    leftSection={<IconCalendar size={16} />}
                  />
                  <Textarea
                    label="Notes"
                    placeholder="Additional notes or requirements"
                    rows={3}
                  />
                  <Button fullWidth>
                    Schedule Quality Check
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}