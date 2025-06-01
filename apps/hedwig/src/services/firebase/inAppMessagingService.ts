import AsyncStorage from '@react-native-async-storage/async-storage';
// React hooks
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Linking } from 'react-native';

import { SentryService } from '../sentryService';

import { FirebaseAnalyticsService } from './analyticsService';

export interface InAppMessage {
  action?: {
    type: 'dismiss' | 'deeplink' | 'weblink';
    url?: string;
    buttonText?: string;
  };
  body?: string;
  expiresAt?: Date;
  id: string;
  imageUrl?: string;
  priority?: number;
  targeting?: {
    userProperties?: Record<string, any>;
    audiences?: string[];
  };
  title: string;
  trigger: {
    event?: string;
    frequency?: 'once' | 'session' | 'always';
    delay?: number; // milliseconds
    conditions?: {
      parameter: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };
  type: 'banner' | 'modal' | 'fullscreen' | 'card';
}

export interface MessageDisplay {
  actionTaken?: string;
  dismissed: boolean;
  displayedAt: Date;
  messageId: string;
}

export class FirebaseInAppMessagingService {
  private static messages = new Map<string, InAppMessage>();
  private static displayHistory: MessageDisplay[] = [];
  private static isInitialized = false;
  private static currentMessage: InAppMessage | null = null;
  private static messageQueue: InAppMessage[] = [];
  private static suppressMessages = false;
  private static listeners = new Set<(message: InAppMessage | null) => void>();

  /**
   * Initialize In-App Messaging
   */
  static async initialize(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        console.log('Firebase In-App Messaging not available for React Native in web SDK');
      }

      // Load display history
      await this.loadDisplayHistory();

      // Load messages from remote config or local config
      await this.loadMessages();

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('In-App Messaging initialized');
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize In-App Messaging:', error);
    }
  }

  /**
   * Load messages (in a real app, these would come from Firebase)
   */
  private static async loadMessages(): Promise<void> {
    // Example messages for Hedwig app
    const defaultMessages: InAppMessage[] = [
      {
        id: 'welcome_message',
        type: 'modal',
        action: {
          type: 'dismiss',
          buttonText: 'Get Started',
        },
        body: 'Scan any barcode to get instant product information.',
        imageUrl: 'https://example.com/welcome.png',
        priority: 100,
        title: 'Welcome to Hedwig!',
        trigger: {
          delay: 2000,
          event: 'app_open',
          frequency: 'once',
        },
      },
      {
        id: 'first_scan_tip',
        type: 'banner',
        body: 'Hold your camera steady for best results',
        priority: 90,
        title: 'Pro Tip',
        trigger: {
          event: 'scan_started',
          frequency: 'once',
        },
      },
      {
        id: 'enable_notifications',
        type: 'card',
        action: {
          type: 'deeplink',
          url: 'hedwig://settings/notifications',
          buttonText: 'Enable',
        },
        body: 'Enable notifications to get alerts for price drops on scanned products',
        priority: 80,
        title: 'Stay Updated',
        trigger: {
          conditions: [
            {
              operator: 'equals',
              parameter: 'notifications_enabled',
              value: false,
            },
          ],
          event: 'product_viewed',
          frequency: 'once',
        },
      },
      {
        id: 'rate_app',
        type: 'modal',
        action: {
          type: 'weblink',
          url: Platform.select({
            android: 'https://play.google.com/store/apps/details?id=com.hedwig.app',
            default: '#',
            ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
          }),
          buttonText: 'Rate Now',
        },
        body: 'Help us improve by rating the app',
        priority: 70,
        title: 'Enjoying Hedwig?',
        trigger: {
          conditions: [
            {
              operator: 'greater_than',
              parameter: 'scans_count',
              value: 10,
            },
          ],
          event: 'scan_completed',
          frequency: 'once',
        },
      },
    ];

    // Load messages
    defaultMessages.forEach(message => {
      this.messages.set(message.id, message);
    });
  }

  /**
   * Setup event listeners
   */
  private static setupEventListeners(): void {
    // Listen to analytics events
    // In a real implementation, you would subscribe to Firebase Analytics events
    console.log('In-App Messaging event listeners set up');
  }

  /**
   * Trigger event
   */
  static async triggerEvent(
    eventName: string,
    parameters?: Record<string, any>
  ): Promise<void> {
    if (!this.isInitialized || this.suppressMessages) return;

    // Find matching messages
    const matchingMessages = Array.from(this.messages.values()).filter(message => {
      // Check event match
      if (message.trigger.event !== eventName) return false;

      // Check conditions
      if (message.trigger.conditions) {
        for (const condition of message.trigger.conditions) {
          const value = parameters?.[condition.parameter];
          
          switch (condition.operator) {
            case 'equals':
              if (value !== condition.value) return false;
              break;
            case 'contains':
              if (!String(value).includes(String(condition.value))) return false;
              break;
            case 'greater_than':
              if (Number(value) <= Number(condition.value)) return false;
              break;
            case 'less_than':
              if (Number(value) >= Number(condition.value)) return false;
              break;
          }
        }
      }

      // Check targeting
      if (message.targeting) {
        // Check user properties
        if (message.targeting.userProperties) {
          // You would check against actual user properties here
        }
      }

      // Check if already shown
      if (!this.shouldShowMessage(message)) return false;

      // Check expiration
      if (message.expiresAt && new Date() > message.expiresAt) return false;

      return true;
    });

    // Sort by priority
    matchingMessages.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Queue messages
    for (const message of matchingMessages) {
      await this.queueMessage(message);
    }

    // Process queue
    await this.processMessageQueue();
  }

  /**
   * Check if message should be shown
   */
  private static shouldShowMessage(message: InAppMessage): boolean {
    const frequency = message.trigger.frequency || 'once';
    
    switch (frequency) {
      case 'once':
        return !this.displayHistory.some(h => h.messageId === message.id);
      
      case 'session':
        // Check if shown in current session
        const sessionStart = Date.now() - (1000 * 60 * 30); // 30 minutes
        return !this.displayHistory.some(h => 
          h.messageId === message.id && 
          h.displayedAt.getTime() > sessionStart
        );
      
      case 'always':
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Queue message
   */
  private static async queueMessage(message: InAppMessage): Promise<void> {
    // Apply delay if specified
    if (message.trigger.delay) {
      await new Promise(resolve => setTimeout(resolve, message.trigger.delay));
    }

    this.messageQueue.push(message);
  }

  /**
   * Process message queue
   */
  private static async processMessageQueue(): Promise<void> {
    if (this.currentMessage || this.messageQueue.length === 0) return;

    const message = this.messageQueue.shift()!;
    await this.showMessage(message);
  }

  /**
   * Show message
   */
  static async showMessage(message: InAppMessage): Promise<void> {
    this.currentMessage = message;
    
    // Record display
    const display: MessageDisplay = {
      dismissed: false,
      displayedAt: new Date(),
      messageId: message.id,
    };
    this.displayHistory.push(display);
    await this.saveDisplayHistory();

    // Notify listeners
    this.listeners.forEach(listener => listener(message));

    // Log analytics
    FirebaseAnalyticsService.logEvent('feature_used', {
      feature_name: 'in_app_message_displayed',
      feature_category: 'messaging',
    });
  }

  /**
   * Dismiss current message
   */
  static async dismissMessage(actionTaken?: string): Promise<void> {
    if (!this.currentMessage) return;

    // Update display history
    const display = this.displayHistory.find(
      h => h.messageId === this.currentMessage!.id && !h.dismissed
    );
    if (display) {
      display.dismissed = true;
      display.actionTaken = actionTaken;
      await this.saveDisplayHistory();
    }

    // Log analytics
    FirebaseAnalyticsService.logEvent('feature_used', {
      feature_name: 'in_app_message_dismissed',
      feature_category: 'messaging',
    });

    // Clear current message
    this.currentMessage = null;
    
    // Notify listeners
    this.listeners.forEach(listener => listener(null));

    // Process next message in queue
    await this.processMessageQueue();
  }

  /**
   * Handle message action
   */
  static async handleMessageAction(message: InAppMessage): Promise<void> {
    if (!message.action) {
      await this.dismissMessage('no_action');
      return;
    }

    switch (message.action.type) {
      case 'dismiss':
        await this.dismissMessage('dismiss');
        break;
      
      case 'deeplink':
        if (message.action.url) {
          // Handle deep link navigation
          console.log('Navigate to:', message.action.url);
          await this.dismissMessage('deeplink');
        }
        break;
      
      case 'weblink':
        if (message.action.url) {
          // Open external link
          Linking.openURL(message.action.url);
          await this.dismissMessage('weblink');
        }
        break;
    }
  }

  /**
   * Suppress messages
   */
  static setSuppressed(suppressed: boolean): void {
    this.suppressMessages = suppressed;
  }

  /**
   * Add message listener
   */
  static addListener(
    listener: (message: InAppMessage | null) => void
  ): () => void {
    this.listeners.add(listener);
    
    // Call immediately with current message
    listener(this.currentMessage);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get display history
   */
  static getDisplayHistory(): MessageDisplay[] {
    return [...this.displayHistory];
  }

  /**
   * Clear display history
   */
  static async clearDisplayHistory(): Promise<void> {
    this.displayHistory = [];
    await AsyncStorage.removeItem('inAppMessageHistory');
  }

  /**
   * Save display history
   */
  private static async saveDisplayHistory(): Promise<void> {
    try {
      // Keep only last 100 entries
      const recentHistory = this.displayHistory.slice(-100);
      await AsyncStorage.setItem(
        'inAppMessageHistory',
        JSON.stringify(recentHistory)
      );
    } catch (error) {
      console.error('Failed to save display history:', error);
    }
  }

  /**
   * Load display history
   */
  private static async loadDisplayHistory(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('inAppMessageHistory');
      if (saved) {
        this.displayHistory = JSON.parse(saved).map((h: any) => ({
          ...h,
          displayedAt: new Date(h.displayedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load display history:', error);
    }
  }

  /**
   * Register custom message
   */
  static registerMessage(message: InAppMessage): void {
    this.messages.set(message.id, message);
  }

  /**
   * Remove message
   */
  static removeMessage(messageId: string): void {
    this.messages.delete(messageId);
  }
}

export function useInAppMessage() {
  const [message, setMessage] = useState<InAppMessage | null>(null);

  useEffect(() => {
    const unsubscribe = FirebaseInAppMessagingService.addListener(setMessage);
    return unsubscribe;
  }, []);

  const dismiss = (actionTaken?: string) => {
    FirebaseInAppMessagingService.dismissMessage(actionTaken);
  };

  const handleAction = () => {
    if (message) {
      FirebaseInAppMessagingService.handleMessageAction(message);
    }
  };

  return {
    dismiss,
    handleAction,
    message,
  };
}

export function useInAppMessaging() {
  const { dismiss, handleAction, message } = useInAppMessage();

  const triggerEvent = (eventName: string, parameters?: Record<string, any>) => {
    FirebaseInAppMessagingService.triggerEvent(eventName, parameters);
  };

  const suppress = (suppressed: boolean) => {
    FirebaseInAppMessagingService.setSuppressed(suppressed);
  };

  const registerMessage = (msg: InAppMessage) => {
    FirebaseInAppMessagingService.registerMessage(msg);
  };

  return {
    dismiss,
    handleAction,
    message,
    registerMessage,
    suppress,
    triggerEvent,
  };
}