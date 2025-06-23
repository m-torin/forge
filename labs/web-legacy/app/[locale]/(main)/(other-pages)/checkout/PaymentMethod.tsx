'use client';

import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Radio,
  Title,
  Divider,
  Grid,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCreditCard,
  IconWallet,
  IconBuildingBank,
  IconLock,
  IconCalendar,
} from '@tabler/icons-react';
import { z } from 'zod';

const paymentSchema = z
  .object({
    paymentMethod: z.enum(['credit-card', 'internet-banking', 'wallet'], {
      required_error: 'Please select a payment method',
    }),
    cardNumber: z.string().optional(),
    nameOnCard: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    cvc: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'credit-card') {
        return (
          data.cardNumber && data.nameOnCard && data.expiryMonth && data.expiryYear && data.cvc
        );
      }
      return true;
    },
    {
      message: 'All credit card fields are required',
      path: ['cardNumber'],
    },
  );

interface PaymentMethodProps {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
}

export default function PaymentMethod({
  isActive,
  onCloseActive,
  onOpenActive,
}: PaymentMethodProps) {
  const [isEditing, { open: startEditing, close: stopEditing }] = useDisclosure(false);

  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(paymentSchema),
    initialValues: {
      paymentMethod: 'credit-card' as const,
      cardNumber: '',
      nameOnCard: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // TODO: Implement payment processing
      console.log('Payment form submission:', values);

      notifications.show({
        title: 'Payment method saved',
        message: 'Your payment method has been successfully saved.',
        color: 'green',
      });

      stopEditing();
      onCloseActive();
    } catch (error) {
      console.error('Failed to save payment method:', error);
      notifications.show({
        title: 'Save failed',
        message: 'Failed to save payment method. Please try again.',
        color: 'red',
      });
    }
  };

  const paymentMethods = [
    {
      value: 'credit-card',
      label: 'Credit/Debit Card',
      icon: <IconCreditCard size={20} />,
      description: 'Pay with your credit or debit card',
    },
    {
      value: 'internet-banking',
      label: 'Internet Banking',
      icon: <IconBuildingBank size={20} />,
      description: 'Pay directly from your bank account',
    },
    {
      value: 'wallet',
      label: 'Digital Wallet',
      icon: <IconWallet size={20} />,
      description: 'Pay with Apple Pay, Google Pay, or PayPal',
    },
  ];

  const renderPaymentMethodSelection = () => (
    <Stack gap="md">
      <Title order={4}>Select Payment Method</Title>
      <Radio.Group key={form.key('paymentMethod')} {...form.getInputProps('paymentMethod')}>
        <Stack gap="sm">
          {paymentMethods.map((method) => (
            <Card
              key={method.value}
              withBorder
              padding="md"
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Radio
                value={method.value}
                label={
                  <Group gap="md">
                    {method.icon}
                    <div>
                      <Text fw={500}>{method.label}</Text>
                      <Text size="sm" c="dimmed">
                        {method.description}
                      </Text>
                    </div>
                  </Group>
                }
              />
            </Card>
          ))}
        </Stack>
      </Radio.Group>
    </Stack>
  );

  const renderCreditCardForm = () => {
    if (form.getValues().paymentMethod !== 'credit-card') {
      return null;
    }

    return (
      <Stack gap="md">
        <Divider />
        <Title order={5}>Card Details</Title>

        <TextInput
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          leftSection={<IconCreditCard size={16} />}
          key={form.key('cardNumber')}
          {...form.getInputProps('cardNumber')}
          required
        />

        <TextInput
          label="Name on Card"
          placeholder="John Doe"
          key={form.key('nameOnCard')}
          {...form.getInputProps('nameOnCard')}
          required
        />

        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="Month"
              placeholder="MM"
              key={form.key('expiryMonth')}
              {...form.getInputProps('expiryMonth')}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Year"
              placeholder="YY"
              key={form.key('expiryYear')}
              {...form.getInputProps('expiryYear')}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="CVC"
              placeholder="123"
              leftSection={<IconLock size={16} />}
              key={form.key('cvc')}
              {...form.getInputProps('cvc')}
              required
            />
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  if (!isActive) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between">
          <div>
            <Text fw={500}>Payment Method</Text>
            <Text size="sm" c="dimmed">
              Add your payment information
            </Text>
          </div>
          <Button variant="outline" onClick={onOpenActive}>
            Add Payment
          </Button>
        </Group>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={3}>Payment Information</Title>
            <Button variant="subtle" onClick={onCloseActive}>
              Cancel
            </Button>
          </Group>

          {renderPaymentMethodSelection()}
          {renderCreditCardForm()}

          <Group justify="flex-end" pt="md">
            <Button variant="subtle" onClick={() => form.reset()} disabled={form.submitting}>
              Reset
            </Button>
            <Button type="submit" loading={form.submitting} disabled={!form.isDirty()}>
              Save Payment Method
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
