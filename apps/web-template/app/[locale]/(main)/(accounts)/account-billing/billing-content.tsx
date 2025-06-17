'use client';

import { useState } from 'react';
import { Card, Text, Badge, Group, ActionIcon, Modal, Stack, Button, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCreditCard, IconTrash, IconPlus, IconBrandStripe } from '@tabler/icons-react';

interface BillingContentProps {
  linkedAccounts: any[];
}

export function BillingContent({ linkedAccounts }: BillingContentProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const handleAddPaymentMethod = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Stripe for payment method management
      notifications.show({
        title: 'Coming Soon',
        message: 'Payment method management will be available soon',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add payment method',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;

    try {
      // TODO: Implement payment method removal
      notifications.show({
        title: 'Success',
        message: 'Payment method removed',
        color: 'green',
      });
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove payment method',
        color: 'red',
      });
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Payments & Billing</h1>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Manage your payment methods and billing information.
        </p>
      </div>

      {/* Payment Methods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <Button leftSection={<IconPlus size={16} />} onClick={openModal} variant="subtle">
            Add Payment Method
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <Card withBorder p="xl" className="text-center">
            <IconCreditCard size={48} className="mx-auto mb-4 text-gray-400" />
            <Text c="dimmed">No payment methods added yet</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openModal}
              mt="md"
              variant="light"
            >
              Add Your First Payment Method
            </Button>
          </Card>
        ) : (
          <Stack gap="sm">
            {paymentMethods.map((method) => (
              <Card key={method.id} withBorder p="md">
                <Group justify="space-between">
                  <Group>
                    <IconCreditCard size={24} />
                    <div>
                      <Text fw={500}>•••• {method.last4}</Text>
                      <Text size="sm" c="dimmed">
                        Expires {method.expMonth}/{method.expYear}
                      </Text>
                    </div>
                    {method.isDefault && (
                      <Badge variant="light" color="blue">
                        Default
                      </Badge>
                    )}
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </div>

      {/* Linked Accounts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Linked Accounts</h2>
        <Stack gap="sm">
          {linkedAccounts.map((account) => (
            <Card key={account.provider} withBorder p="md">
              <Group justify="space-between">
                <Group>
                  <div>
                    <Text fw={500} tt="capitalize">
                      {account.provider}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Connected on {new Date(account.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </Group>
                <Badge variant="light" color="green">
                  Connected
                </Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      </div>

      {/* Billing Information */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
        <Alert color="blue" title="Stripe Integration">
          Full billing management with Stripe integration is coming soon. You'll be able to:
          <ul className="mt-2 ml-4 list-disc">
            <li>Add and manage credit/debit cards</li>
            <li>View billing history and invoices</li>
            <li>Update billing address</li>
            <li>Manage subscriptions</li>
          </ul>
        </Alert>
      </div>

      {/* Add Payment Method Modal */}
      <Modal opened={modalOpened} onClose={closeModal} title="Add Payment Method" size="md">
        <Stack>
          <Alert color="blue" icon={<IconBrandStripe size={20} />}>
            Secure payment processing powered by Stripe
          </Alert>

          <Text size="sm" c="dimmed">
            Payment method management requires Stripe integration. This feature will be available
            soon.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod} loading={isLoading}>
              Continue to Stripe
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
