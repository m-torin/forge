import { describe, expect } from 'vitest';
import {
  RegistryCreatedTemplate,
  RegistryInvitationTemplate,
  RegistryPurchaseTemplate,
  RegistryThankYouTemplate,
  RegistryPurchaseConfirmationTemplate,
  RegistryItemAddedTemplate,
} from '../src/index';

describe('registry Email Templates', () => {
  test('should render RegistryCreatedTemplate', () => {
    const html = RegistryCreatedTemplate({
      email: 'test@example.com',
      name: 'Test User',
      registryTitle: 'Test Registry',
      registryType: 'Wedding',
      registryUrl: 'https://example.com/registry/123',
      eventDate: 'June 15, 2024',
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });

  test('should render RegistryInvitationTemplate', () => {
    const html = RegistryInvitationTemplate({
      email: 'friend@example.com',
      inviterName: 'Jane Smith',
      inviterEmail: 'jane@example.com',
      registryTitle: 'Our Wedding',
      registryType: 'Wedding',
      registryUrl: 'https://example.com/registry/123',
      role: 'VIEWER',
      message: 'Please join us!',
      eventDate: 'June 15, 2024',
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });

  test('should render RegistryPurchaseTemplate', () => {
    const html = RegistryPurchaseTemplate({
      email: 'owner@example.com',
      ownerName: 'Jane Smith',
      purchaserName: 'John Doe',
      purchaserEmail: 'john@example.com',
      registryTitle: 'Our Wedding',
      itemName: 'Kitchen Mixer',
      quantity: 1,
      giftMessage: 'Congratulations!',
      registryUrl: 'https://example.com/registry/123',
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });

  test('should render RegistryThankYouTemplate', () => {
    const html = RegistryThankYouTemplate({
      email: 'purchaser@example.com',
      recipientName: 'John Doe',
      senderName: 'Jane Smith',
      registryTitle: 'Our Wedding',
      itemName: 'Kitchen Mixer',
      message: 'Thank you so much for your thoughtful gift!',
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });

  test('should render RegistryPurchaseConfirmationTemplate', () => {
    const html = RegistryPurchaseConfirmationTemplate({
      email: 'purchaser@example.com',
      purchaserName: 'John Doe',
      registryOwnerName: 'Jane Smith',
      registryTitle: 'Our Wedding',
      itemName: 'Kitchen Mixer',
      quantity: 1,
      orderNumber: 'ORD-12345',
      registryUrl: 'https://example.com/registry/123',
      isGift: true,
      giftWrapped: true,
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });

  test('should render RegistryItemAddedTemplate', () => {
    const html = RegistryItemAddedTemplate({
      email: 'editor@example.com',
      recipientName: 'Sarah Jones',
      adderName: 'Jane Smith',
      registryTitle: 'Our Wedding',
      itemName: 'Instant Pot',
      itemQuantity: 1,
      itemPriority: 8,
      itemNotes: 'Would love the 8-quart size!',
      registryUrl: 'https://example.com/registry/123',
    });

    expect(html).toBeDefined();
    expect(html.type).toBeDefined();
    expect(html.props).toBeDefined();
    expect(html.props.children).toBeDefined();
  });
});
