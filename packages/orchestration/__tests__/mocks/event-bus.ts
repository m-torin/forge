/**
 * Mock event bus implementation with proper pattern matching
 */

type EventHandler = (event: any) => void | Promise<void>;

interface Subscription {
  handler: EventHandler;
  pattern: string;
}

export function createMockEventBus() {
  const subscriptions: Subscription[] = [];
  const eventHistory: any[] = [];
  let historyLimit = 100;

  // Pattern matching function
  function matchesPattern(pattern: string, eventType: string): boolean {
    // Exact match
    if (pattern === eventType) return true;

    // Convert pattern to regex
    // Handle ** (multi-level wildcard)
    let regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*\*/g, '.*') // ** matches any number of segments
      .replace(/\*/g, '[^.]+'); // * matches one segment

    // Add anchors
    regexPattern = `^${regexPattern}$`;

    return new RegExp(regexPattern).test(eventType);
  }

  return {
    subscribe(pattern: string, handler: EventHandler) {
      const subscription = { handler, pattern };
      subscriptions.push(subscription);

      return () => {
        const index = subscriptions.indexOf(subscription);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
      };
    },

    async emit(type: string, data?: any) {
      const event = {
        id: `event_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
      };

      // Add to history
      eventHistory.push(event);
      if (eventHistory.length > historyLimit) {
        eventHistory.shift();
      }

      // Find matching subscribers
      const matchingHandlers = subscriptions
        .filter((sub) => matchesPattern(sub.pattern, type))
        .map((sub) => sub.handler);

      // Execute handlers
      await Promise.all(
        matchingHandlers.map(async (handler) => {
          try {
            await handler(event);
          } catch (error) {
            console.error(`Handler error for event ${type}:`, error);
          }
        }),
      );
    },

    on(pattern: string, handler: EventHandler) {
      return this.subscribe(pattern, handler);
    },

    off() {
      // Not implemented in this mock
    },

    setHistoryLimit(limit: number) {
      historyLimit = limit;
      while (eventHistory.length > limit) {
        eventHistory.shift();
      }
    },

    getHistory() {
      return [...eventHistory];
    },

    replay(pattern: string, handler: EventHandler) {
      const matchingEvents = eventHistory.filter((event) => matchesPattern(pattern, event.type));

      matchingEvents.forEach((event) => {
        handler(event);
      });
    },

    clear() {
      subscriptions.length = 0;
      eventHistory.length = 0;
    },
  };
}
