import type {
  AliasMessage,
  AnalyticsEmitter,
  GroupMessage,
  IdentifyMessage,
  PageMessage,
  ScreenMessage,
  TrackMessage,
} from './types';

/**
 * Multi Analytics Emitter
 * Sends analytics events to multiple providers simultaneously
 */
export class MultiEmitter implements AnalyticsEmitter {
  private emitters: AnalyticsEmitter[] = [];
  private debug: boolean;

  constructor(emitters: AnalyticsEmitter[] = [], debug = false) {
    this.emitters = emitters;
    this.debug = debug;
  }

  /**
   * Add an emitter to the multi-emitter
   */
  addEmitter(emitter: AnalyticsEmitter): void {
    this.emitters.push(emitter);
  }

  /**
   * Remove an emitter from the multi-emitter
   */
  removeEmitter(emitter: AnalyticsEmitter): void {
    this.emitters = this.emitters.filter((e) => e !== emitter);
  }

  /**
   * Execute a method on all emitters
   */
  private async executeOnAll<T extends any[]>(
    methodName: keyof AnalyticsEmitter,
    ...args: T
  ): Promise<void> {
    const promises = this.emitters.map(async (emitter) => {
      try {
        const method = emitter[methodName];
        if (typeof method === 'function') {
          await (method as (...args: any[]) => Promise<void>).apply(emitter, args);
        }
      } catch (error) {
        if (this.debug) {
          console.error(
            `[MultiEmitter] Error in ${String(methodName)} for ${emitter.constructor.name}:`,
            error,
          );
        }
      }
    });

    await Promise.allSettled(promises);
  }

  async identify(message: IdentifyMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Identify:', message);
    }
    await this.executeOnAll('identify', message);
  }

  async track(message: TrackMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Track:', message);
    }
    await this.executeOnAll('track', message);
  }

  async page(message: PageMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Page:', message);
    }
    await this.executeOnAll('page', message);
  }

  async screen(message: ScreenMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Screen:', message);
    }
    await this.executeOnAll('screen', message);
  }

  async group(message: GroupMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Group:', message);
    }
    await this.executeOnAll('group', message);
  }

  async alias(message: AliasMessage): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Alias:', message);
    }
    await this.executeOnAll('alias', message);
  }

  async flush(): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Flush');
    }
    await this.executeOnAll('flush');
  }

  async reset(): Promise<void> {
    if (this.debug) {
      console.log('[MultiEmitter] Reset');
    }
    await this.executeOnAll('reset');
  }
}
