'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Menu,
  Modal,
  Paper,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Timeline,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconCircleDot,
  IconCircleX,
  IconClock,
  IconDots,
  IconEdit,
  IconHistory,
  IconMessage,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface ApprovalWorkflowStep {
  approverRole: string;
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
  description: string;
  id: string;
  isParallel?: boolean;
  name: string;
  order: number;
  requiredApprovals: number;
}

interface ApprovalRequest {
  createdAt: string;
  currentStep: number;
  data: any;
  description: string;
  dueDate?: string;
  id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recordId: string;
  recordType: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submitterId: string;
  submitterName: string;
  tags?: string[];
  title: string;
  updatedAt: string;
}

interface ApprovalAction {
  action: 'approve' | 'reject' | 'request_changes' | 'comment';
  approverId: string;
  approverName: string;
  comment?: string;
  createdAt: string;
  id: string;
  metadata?: Record<string, any>;
  requestId: string;
  stepId: string;
}

interface ApprovalWorkflowProps {
  modelName: string;
  onWorkflowCancel?: () => void;
  onWorkflowComplete?: (approved: boolean) => void;
  record?: any;
  recordId?: string;
  workflowType?: 'create' | 'update' | 'delete' | 'publish';
}

const DEFAULT_WORKFLOWS: Record<string, ApprovalWorkflowStep[]> = {
  'high-value-update': [
    {
      id: 'senior-review',
      name: 'Senior Review',
      approverRole: 'senior',
      conditions: [{ field: 'value', operator: 'gt', value: 10000 }],
      description: 'Senior team member must review high-value changes',
      order: 1,
      requiredApprovals: 1,
    },
    {
      id: 'director-approval',
      name: 'Director Approval',
      approverRole: 'director',
      conditions: [{ field: 'value', operator: 'gt', value: 50000 }],
      description: 'Director approval for significant changes',
      order: 2,
      requiredApprovals: 1,
    },
  ],
  'product-publish': [
    {
      id: 'content-review',
      name: 'Content Review',
      approverRole: 'content_reviewer',
      description: 'Content team reviews product information',
      order: 1,
      requiredApprovals: 1,
    },
    {
      id: 'legal-compliance',
      name: 'Legal Compliance',
      approverRole: 'legal',
      description: 'Legal team ensures compliance',
      isParallel: true,
      order: 2,
      requiredApprovals: 1,
    },
    {
      id: 'marketing-approval',
      name: 'Marketing Approval',
      approverRole: 'marketing',
      description: 'Marketing team approves for publication',
      isParallel: true,
      order: 2,
      requiredApprovals: 1,
    },
    {
      id: 'final-approval',
      name: 'Final Approval',
      approverRole: 'admin',
      description: 'Final approval before publication',
      order: 3,
      requiredApprovals: 1,
    },
  ],
  'user-create': [
    {
      id: 'manager-review',
      name: 'Manager Review',
      approverRole: 'manager',
      description: 'Manager must review new user creation',
      order: 1,
      requiredApprovals: 1,
    },
    {
      id: 'admin-approval',
      name: 'Admin Approval',
      approverRole: 'admin',
      description: 'Admin must approve new user',
      order: 2,
      requiredApprovals: 1,
    },
  ],
  'user-delete': [
    {
      id: 'manager-approval',
      name: 'Manager Approval',
      approverRole: 'manager',
      description: 'Manager must approve user deletion',
      order: 1,
      requiredApprovals: 1,
    },
    {
      id: 'admin-confirmation',
      name: 'Admin Confirmation',
      approverRole: 'admin',
      description: 'Admin must confirm user deletion',
      order: 2,
      requiredApprovals: 1,
    },
  ],
};

export function ApprovalWorkflow({
  modelName,
  onWorkflowCancel,
  onWorkflowComplete,
  record,
  recordId,
  workflowType = 'update',
}: ApprovalWorkflowProps) {
  const [currentRequest, setCurrentRequest] = useState<ApprovalRequest | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<ApprovalWorkflowStep[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [approvalOpened, { close: closeApproval, open: openApproval }] = useDisclosure(false);
  const [rejectionOpened, { close: closeRejection, open: openRejection }] = useDisclosure(false);
  const [commentOpened, { close: closeComment, open: openComment }] = useDisclosure(false);

  // Form states
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_changes'>('approve');

  // Initialize workflow
  useEffect(() => {
    initializeWorkflow();
  }, [modelName, workflowType, recordId]);

  const initializeWorkflow = async () => {
    setIsLoading(true);

    try {
      // Determine workflow based on model and type
      const workflowKey = `${modelName}-${workflowType}`;
      let steps = DEFAULT_WORKFLOWS[workflowKey] || DEFAULT_WORKFLOWS['high-value-update'];

      // Filter steps based on conditions
      if (record) {
        steps = steps.filter((step) => {
          if (!step.conditions) return true;

          return step.conditions.every((condition) => {
            const fieldValue = record[condition.field];
            switch (condition.operator) {
              case 'gt':
                return Number(fieldValue) > Number(condition.value);
              case 'lt':
                return Number(fieldValue) < Number(condition.value);
              case 'equals':
                return fieldValue === condition.value;
              case 'contains':
                return String(fieldValue).includes(String(condition.value));
              default:
                return true;
            }
          });
        });
      }

      setWorkflowSteps(steps);

      // Check if there's an existing approval request
      if (recordId) {
        await loadExistingRequest();
      }
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to initialize approval workflow',
        title: 'Workflow Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingRequest = async () => {
    // In a real implementation, this would fetch from an API
    // For now, we'll simulate with localStorage
    try {
      const stored = localStorage.getItem(`approval-request-${recordId}`);
      if (stored) {
        const request = JSON.parse(stored);
        setCurrentRequest(request);

        // Load approval history
        const historyStored = localStorage.getItem(`approval-history-${request.id}`);
        if (historyStored) {
          setApprovalHistory(JSON.parse(historyStored));
        }
      }
    } catch (error) {
      console.error('Failed to load existing request:', error);
    }
  };

  const submitForApproval = async () => {
    if (!recordId || !record) {
      notifications.show({
        color: 'red',
        message: 'Record information is required',
        title: 'Error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const newRequest: ApprovalRequest = {
        id: `approval-${Date.now()}`,
        createdAt: new Date().toISOString(),
        currentStep: 0,
        data: record,
        description: `Request to ${workflowType} ${modelName} record`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        priority: 'medium',
        recordId,
        recordType: modelName,
        status: 'pending',
        submitterId: 'current-user-id', // In real app, get from session
        submitterName: 'Current User', // In real app, get from session
        title: `${workflowType} ${modelName} - ${record.name || record.title || recordId}`,
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage (in real app, save to database)
      localStorage.setItem(`approval-request-${recordId}`, JSON.stringify(newRequest));

      setCurrentRequest(newRequest);

      notifications.show({
        color: 'green',
        message: 'Your request has been submitted for approval',
        title: 'Approval Requested',
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to submit approval request',
        title: 'Submission Failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = async (
    action: 'approve' | 'reject' | 'request_changes',
    comment: string,
  ) => {
    if (!currentRequest) return;

    setIsLoading(true);

    try {
      const newAction: ApprovalAction = {
        id: `action-${Date.now()}`,
        action,
        approverId: 'current-user-id', // In real app, get from session
        approverName: 'Current User', // In real app, get from session
        comment,
        createdAt: new Date().toISOString(),
        requestId: currentRequest.id,
        stepId: workflowSteps[currentRequest.currentStep]?.id || '',
      };

      const updatedHistory = [...approvalHistory, newAction];
      setApprovalHistory(updatedHistory);

      // Update request status
      const updatedRequest = { ...currentRequest };

      if (action === 'approve') {
        if (currentRequest.currentStep < workflowSteps.length - 1) {
          updatedRequest.currentStep += 1;
          updatedRequest.status = 'pending';
        } else {
          updatedRequest.status = 'approved';
          onWorkflowComplete?.(true);
        }
      } else if (action === 'reject') {
        updatedRequest.status = 'rejected';
        onWorkflowComplete?.(false);
      }

      updatedRequest.updatedAt = new Date().toISOString();

      setCurrentRequest(updatedRequest);

      // Save to localStorage
      localStorage.setItem(`approval-request-${recordId}`, JSON.stringify(updatedRequest));
      localStorage.setItem(`approval-history-${currentRequest.id}`, JSON.stringify(updatedHistory));

      notifications.show({
        color: action === 'approve' ? 'green' : 'red',
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} action has been recorded`,
        title: 'Action Recorded',
      });

      // Close modals
      closeApproval();
      closeRejection();
      closeComment();
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to record approval action',
        title: 'Action Failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStepInfo = () => {
    if (!currentRequest || currentRequest.currentStep >= workflowSteps.length) {
      return null;
    }
    return workflowSteps[currentRequest.currentStep];
  };

  const getStepStatus = (stepIndex: number) => {
    if (!currentRequest) return 'pending';

    if (stepIndex < currentRequest.currentStep) return 'completed';
    if (stepIndex === currentRequest.currentStep && currentRequest.status === 'approved')
      return 'completed';
    if (stepIndex === currentRequest.currentStep && currentRequest.status === 'rejected')
      return 'rejected';
    if (stepIndex === currentRequest.currentStep) return 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    if (!currentRequest || workflowSteps.length === 0) return 0;

    if (currentRequest.status === 'approved') return 100;
    if (currentRequest.status === 'rejected') return 0;

    return Math.round((currentRequest.currentStep / workflowSteps.length) * 100);
  };

  const currentStep = getCurrentStepInfo();
  const canApprove = currentStep && currentRequest?.status === 'pending';

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" size="sm" variant="light">
              <IconHistory size={16} />
            </ThemeIcon>
            <Text fw={600}>Approval Workflow</Text>
            {currentRequest && (
              <Badge
                color={
                  currentRequest.status === 'approved'
                    ? 'green'
                    : currentRequest.status === 'rejected'
                      ? 'red'
                      : currentRequest.status === 'pending'
                        ? 'orange'
                        : 'gray'
                }
                variant="light"
              >
                {currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1)}
              </Badge>
            )}
          </Group>

          {!currentRequest ? (
            <Button
              leftSection={<IconSend size={14} />}
              loading={isLoading}
              onClick={submitForApproval}
              size="sm"
            >
              Submit for Approval
            </Button>
          ) : (
            <Menu width={200} shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {canApprove && (
                  <>
                    <Menu.Item leftSection={<IconCheck size={14} />} onClick={openApproval}>
                      Approve
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconX size={14} />}
                      onClick={openRejection}
                    >
                      Reject
                    </Menu.Item>
                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={openComment}>
                      Request Changes
                    </Menu.Item>
                    <Menu.Divider />
                  </>
                )}
                <Menu.Item leftSection={<IconMessage size={14} />} onClick={openComment}>
                  Add Comment
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {currentRequest && (
          <>
            {/* Progress */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={500} size="sm">
                  Progress
                </Text>
                <Text c="dimmed" size="sm">
                  Step {currentRequest.currentStep + 1} of {workflowSteps.length}
                </Text>
              </Group>
              <Progress
                color={
                  currentRequest.status === 'approved'
                    ? 'green'
                    : currentRequest.status === 'rejected'
                      ? 'red'
                      : 'blue'
                }
                value={getProgressPercentage()}
              />
            </Stack>

            {/* Current Step Info */}
            {currentStep && currentRequest.status === 'pending' && (
              <Alert color="blue" icon={<IconClock size={16} />}>
                <Text fw={500} mb="xs">
                  {currentStep.name}
                </Text>
                <Text size="sm">{currentStep.description}</Text>
                <Text c="dimmed" mt="xs" size="xs">
                  Waiting for {currentStep.approverRole} approval
                </Text>
              </Alert>
            )}

            {/* Workflow Steps */}
            <Stack gap="sm">
              <Text fw={500} size="sm">
                Workflow Steps
              </Text>
              <ScrollArea h={200}>
                <Timeline>
                  {workflowSteps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';
                    const isRejected = status === 'rejected';

                    return (
                      <Timeline.Item
                        key={step.id}
                        color={
                          isCompleted ? 'green' : isRejected ? 'red' : isActive ? 'blue' : 'gray'
                        }
                        bullet={
                          isCompleted ? (
                            <IconCircleCheck size={16} />
                          ) : isRejected ? (
                            <IconCircleX size={16} />
                          ) : isActive ? (
                            <IconCircleDot size={16} />
                          ) : (
                            <IconClock size={16} />
                          )
                        }
                        title={step.name}
                      >
                        <Text c="dimmed" mb="xs" size="sm">
                          {step.description}
                        </Text>
                        <Text c="dimmed" size="xs">
                          Approver: {step.approverRole}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </ScrollArea>
            </Stack>

            {/* Approval History */}
            {approvalHistory.length > 0 && (
              <Stack gap="sm">
                <Divider label="Approval History" />
                <ScrollArea h={150}>
                  <Stack gap="xs">
                    {approvalHistory.map((action) => (
                      <Paper key={action.id} withBorder p="sm">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon
                              color={
                                action.action === 'approve'
                                  ? 'green'
                                  : action.action === 'reject'
                                    ? 'red'
                                    : 'blue'
                              }
                              size="sm"
                              variant="light"
                            >
                              {action.action === 'approve' ? (
                                <IconCheck size={12} />
                              ) : action.action === 'reject' ? (
                                <IconX size={12} />
                              ) : (
                                <IconMessage size={12} />
                              )}
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text fw={500} size="sm">
                                {action.approverName} {action.action}d
                              </Text>
                              {action.comment && (
                                <Text c="dimmed" size="xs">
                                  "{action.comment}"
                                </Text>
                              )}
                            </Stack>
                          </Group>
                          <Text c="dimmed" size="xs">
                            {new Date(action.createdAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            )}
          </>
        )}

        {workflowSteps.length === 0 && !isLoading && (
          <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
            No approval workflow configured for this operation.
          </Alert>
        )}
      </Stack>

      {/* Approval Modal */}
      <Modal onClose={closeApproval} opened={approvalOpened} title="Approve Request">
        <Stack gap="md">
          <Text size="sm">Are you sure you want to approve this request?</Text>

          <Textarea
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="Add any comments about your approval..."
            rows={3}
            label="Comment (optional)"
            value={approvalComment}
          />

          <Group justify="flex-end">
            <Button onClick={closeApproval} variant="light">
              Cancel
            </Button>
            <Button
              color="green"
              loading={isLoading}
              onClick={() => handleApprovalAction('approve', approvalComment)}
            >
              Approve
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Rejection Modal */}
      <Modal onClose={closeRejection} opened={rejectionOpened} title="Reject Request">
        <Stack gap="md">
          <Text size="sm">Please provide a reason for rejecting this request:</Text>

          <Textarea
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why you're rejecting this request..."
            rows={4}
            label="Rejection Reason"
            required
            value={rejectionReason}
          />

          <Group justify="flex-end">
            <Button onClick={closeRejection} variant="light">
              Cancel
            </Button>
            <Button
              color="red"
              loading={isLoading}
              onClick={() => handleApprovalAction('reject', rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Comment Modal */}
      <Modal onClose={closeComment} opened={commentOpened} title="Add Comment">
        <Stack gap="md">
          <Select
            onChange={(value) => setActionType(value as any)}
            data={[
              { label: 'Approve', value: 'approve' },
              { label: 'Request Changes', value: 'request_changes' },
              { label: 'Reject', value: 'reject' },
            ]}
            label="Action Type"
            value={actionType}
          />

          <Textarea
            onChange={(e) => setGeneralComment(e.target.value)}
            placeholder="Add your comment..."
            rows={4}
            label="Comment"
            required
            value={generalComment}
          />

          <Group justify="flex-end">
            <Button onClick={closeComment} variant="light">
              Cancel
            </Button>
            <Button
              loading={isLoading}
              onClick={() => handleApprovalAction(actionType, generalComment)}
              disabled={!generalComment.trim()}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
