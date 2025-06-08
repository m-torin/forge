'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Modal,
  Textarea,
  Select,
  Alert,
  Timeline,
  Avatar,
  ActionIcon,
  Paper,
  Divider,
  Box,
  ScrollArea,
  ThemeIcon,
  Menu,
  Progress,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconMessage,
  IconAlertTriangle,
  IconEye,
  IconEdit,
  IconHistory,
  IconArrowRight,
  IconCircleCheck,
  IconCircleX,
  IconCircleDot,
  IconSend,
  IconDots,
} from '@tabler/icons-react';

interface ApprovalWorkflowStep {
  id: string;
  name: string;
  description: string;
  approverRole: string;
  requiredApprovals: number;
  order: number;
  isParallel?: boolean;
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
}

interface ApprovalRequest {
  id: string;
  recordId: string;
  recordType: string;
  submitterId: string;
  submitterName: string;
  title: string;
  description: string;
  data: any;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}

interface ApprovalAction {
  id: string;
  requestId: string;
  stepId: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'request_changes' | 'comment';
  comment?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface ApprovalWorkflowProps {
  modelName: string;
  recordId?: string;
  record?: any;
  workflowType?: 'create' | 'update' | 'delete' | 'publish';
  onWorkflowComplete?: (approved: boolean) => void;
  onWorkflowCancel?: () => void;
}

const DEFAULT_WORKFLOWS: Record<string, ApprovalWorkflowStep[]> = {
  'user-create': [
    {
      id: 'manager-review',
      name: 'Manager Review',
      description: 'Manager must review new user creation',
      approverRole: 'manager',
      requiredApprovals: 1,
      order: 1,
    },
    {
      id: 'admin-approval',
      name: 'Admin Approval',
      description: 'Admin must approve new user',
      approverRole: 'admin',
      requiredApprovals: 1,
      order: 2,
    },
  ],
  'user-delete': [
    {
      id: 'manager-approval',
      name: 'Manager Approval',
      description: 'Manager must approve user deletion',
      approverRole: 'manager',
      requiredApprovals: 1,
      order: 1,
    },
    {
      id: 'admin-confirmation',
      name: 'Admin Confirmation',
      description: 'Admin must confirm user deletion',
      approverRole: 'admin',
      requiredApprovals: 1,
      order: 2,
    },
  ],
  'product-publish': [
    {
      id: 'content-review',
      name: 'Content Review',
      description: 'Content team reviews product information',
      approverRole: 'content_reviewer',
      requiredApprovals: 1,
      order: 1,
    },
    {
      id: 'legal-compliance',
      name: 'Legal Compliance',
      description: 'Legal team ensures compliance',
      approverRole: 'legal',
      requiredApprovals: 1,
      order: 2,
      isParallel: true,
    },
    {
      id: 'marketing-approval',
      name: 'Marketing Approval',
      description: 'Marketing team approves for publication',
      approverRole: 'marketing',
      requiredApprovals: 1,
      order: 2,
      isParallel: true,
    },
    {
      id: 'final-approval',
      name: 'Final Approval',
      description: 'Final approval before publication',
      approverRole: 'admin',
      requiredApprovals: 1,
      order: 3,
    },
  ],
  'high-value-update': [
    {
      id: 'senior-review',
      name: 'Senior Review',
      description: 'Senior team member must review high-value changes',
      approverRole: 'senior',
      requiredApprovals: 1,
      order: 1,
      conditions: [
        { field: 'value', operator: 'gt', value: 10000 },
      ],
    },
    {
      id: 'director-approval',
      name: 'Director Approval',
      description: 'Director approval for significant changes',
      approverRole: 'director',
      requiredApprovals: 1,
      order: 2,
      conditions: [
        { field: 'value', operator: 'gt', value: 50000 },
      ],
    },
  ],
};

export function ApprovalWorkflow({
  modelName,
  recordId,
  record,
  workflowType = 'update',
  onWorkflowComplete,
  onWorkflowCancel,
}: ApprovalWorkflowProps) {
  const [currentRequest, setCurrentRequest] = useState<ApprovalRequest | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<ApprovalWorkflowStep[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [approvalOpened, { open: openApproval, close: closeApproval }] = useDisclosure(false);
  const [rejectionOpened, { open: openRejection, close: closeRejection }] = useDisclosure(false);
  const [commentOpened, { open: openComment, close: closeComment }] = useDisclosure(false);
  
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
        steps = steps.filter(step => {
          if (!step.conditions) return true;
          
          return step.conditions.every(condition => {
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
        title: 'Workflow Error',
        message: 'Failed to initialize approval workflow',
        color: 'red',
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
        title: 'Error',
        message: 'Record information is required',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newRequest: ApprovalRequest = {
        id: `approval-${Date.now()}`,
        recordId,
        recordType: modelName,
        submitterId: 'current-user-id', // In real app, get from session
        submitterName: 'Current User', // In real app, get from session
        title: `${workflowType} ${modelName} - ${record.name || record.title || recordId}`,
        description: `Request to ${workflowType} ${modelName} record`,
        data: record,
        currentStep: 0,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      // Save to localStorage (in real app, save to database)
      localStorage.setItem(`approval-request-${recordId}`, JSON.stringify(newRequest));
      
      setCurrentRequest(newRequest);
      
      notifications.show({
        title: 'Approval Requested',
        message: 'Your request has been submitted for approval',
        color: 'green',
      });
      
    } catch (error) {
      notifications.show({
        title: 'Submission Failed',
        message: 'Failed to submit approval request',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject' | 'request_changes', comment: string) => {
    if (!currentRequest) return;

    setIsLoading(true);
    
    try {
      const newAction: ApprovalAction = {
        id: `action-${Date.now()}`,
        requestId: currentRequest.id,
        stepId: workflowSteps[currentRequest.currentStep]?.id || '',
        approverId: 'current-user-id', // In real app, get from session
        approverName: 'Current User', // In real app, get from session
        action,
        comment,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [...approvalHistory, newAction];
      setApprovalHistory(updatedHistory);

      // Update request status
      let updatedRequest = { ...currentRequest };
      
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
        title: 'Action Recorded',
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} action has been recorded`,
        color: action === 'approve' ? 'green' : 'red',
      });
      
      // Close modals
      closeApproval();
      closeRejection();
      closeComment();
      
    } catch (error) {
      notifications.show({
        title: 'Action Failed',
        message: 'Failed to record approval action',
        color: 'red',
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
    if (stepIndex === currentRequest.currentStep && currentRequest.status === 'approved') return 'completed';
    if (stepIndex === currentRequest.currentStep && currentRequest.status === 'rejected') return 'rejected';
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
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconHistory size={16} />
            </ThemeIcon>
            <Text fw={600}>Approval Workflow</Text>
            {currentRequest && (
              <Badge 
                color={
                  currentRequest.status === 'approved' ? 'green' :
                  currentRequest.status === 'rejected' ? 'red' :
                  currentRequest.status === 'pending' ? 'orange' : 'gray'
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
              onClick={submitForApproval}
              loading={isLoading}
              size="sm"
            >
              Submit for Approval
            </Button>
          ) : (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {canApprove && (
                  <>
                    <Menu.Item
                      leftSection={<IconCheck size={14} />}
                      onClick={openApproval}
                    >
                      Approve
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconX size={14} />}
                      onClick={openRejection}
                      color="red"
                    >
                      Reject
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={openComment}
                    >
                      Request Changes
                    </Menu.Item>
                    <Menu.Divider />
                  </>
                )}
                <Menu.Item
                  leftSection={<IconMessage size={14} />}
                  onClick={openComment}
                >
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
                <Text size="sm" fw={500}>Progress</Text>
                <Text size="sm" c="dimmed">
                  Step {currentRequest.currentStep + 1} of {workflowSteps.length}
                </Text>
              </Group>
              <Progress 
                value={getProgressPercentage()} 
                color={
                  currentRequest.status === 'approved' ? 'green' :
                  currentRequest.status === 'rejected' ? 'red' : 'blue'
                }
              />
            </Stack>

            {/* Current Step Info */}
            {currentStep && currentRequest.status === 'pending' && (
              <Alert color="blue" icon={<IconClock size={16} />}>
                <Text fw={500} mb="xs">{currentStep.name}</Text>
                <Text size="sm">{currentStep.description}</Text>
                <Text size="xs" c="dimmed" mt="xs">
                  Waiting for {currentStep.approverRole} approval
                </Text>
              </Alert>
            )}

            {/* Workflow Steps */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>Workflow Steps</Text>
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
                        title={step.name}
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
                        color={
                          isCompleted ? 'green' :
                          isRejected ? 'red' :
                          isActive ? 'blue' : 'gray'
                        }
                      >
                        <Text size="sm" c="dimmed" mb="xs">
                          {step.description}
                        </Text>
                        <Text size="xs" c="dimmed">
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
                      <Paper key={action.id} p="sm" withBorder>
                        <Group justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon
                              size="sm"
                              color={
                                action.action === 'approve' ? 'green' :
                                action.action === 'reject' ? 'red' : 'blue'
                              }
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
                              <Text size="sm" fw={500}>
                                {action.approverName} {action.action}d
                              </Text>
                              {action.comment && (
                                <Text size="xs" c="dimmed">
                                  "{action.comment}"
                                </Text>
                              )}
                            </Stack>
                          </Group>
                          <Text size="xs" c="dimmed">
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
      <Modal opened={approvalOpened} onClose={closeApproval} title="Approve Request">
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to approve this request?
          </Text>
          
          <Textarea
            label="Comment (optional)"
            placeholder="Add any comments about your approval..."
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeApproval}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => handleApprovalAction('approve', approvalComment)}
              loading={isLoading}
            >
              Approve
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Rejection Modal */}
      <Modal opened={rejectionOpened} onClose={closeRejection} title="Reject Request">
        <Stack gap="md">
          <Text size="sm">
            Please provide a reason for rejecting this request:
          </Text>
          
          <Textarea
            label="Rejection Reason"
            placeholder="Explain why you're rejecting this request..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeRejection}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => handleApprovalAction('reject', rejectionReason)}
              loading={isLoading}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Comment Modal */}
      <Modal opened={commentOpened} onClose={closeComment} title="Add Comment">
        <Stack gap="md">
          <Select
            label="Action Type"
            value={actionType}
            onChange={(value) => setActionType(value as any)}
            data={[
              { value: 'approve', label: 'Approve' },
              { value: 'request_changes', label: 'Request Changes' },
              { value: 'reject', label: 'Reject' },
            ]}
          />
          
          <Textarea
            label="Comment"
            placeholder="Add your comment..."
            value={generalComment}
            onChange={(e) => setGeneralComment(e.target.value)}
            rows={4}
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeComment}>
              Cancel
            </Button>
            <Button
              onClick={() => handleApprovalAction(actionType, generalComment)}
              loading={isLoading}
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