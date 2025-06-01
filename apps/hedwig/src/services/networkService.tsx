import * as Network from 'expo-network';
import React from 'react';

export interface NetworkState {
  isAirplaneMode?: boolean;
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType;
}

export type NetworkCallback = (state: NetworkState) => void;

export class NetworkService {
  private static listeners = new Set<NetworkCallback>();
  private static currentState: NetworkState | null = null;
  private static isMonitoring = false;

  /**
   * Get current network state
   */
  static async getNetworkState(): Promise<NetworkState> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      const state: NetworkState = {
        type: networkState.type ?? Network.NetworkStateType.UNKNOWN,
        isAirplaneMode: await Network.isAirplaneModeEnabledAsync(),
        isConnected: networkState.isConnected ?? false,
        isInternetReachable: networkState.isInternetReachable ?? false,
      };

      this.currentState = state;
      return state;
    } catch (error) {
      console.error('Error getting network state:', error);
      return {
        type: Network.NetworkStateType.UNKNOWN,
        isConnected: false,
        isInternetReachable: false,
      };
    }
  }

  /**
   * Check if online
   */
  static async isOnline(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.isConnected && state.isInternetReachable;
  }

  /**
   * Get IP address
   */
  static async getIpAddress(): Promise<string | null> {
    try {
      const ip = await Network.getIpAddressAsync();
      return ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      return null;
    }
  }

  /**
   * Start monitoring network changes
   */
  static startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Set up network state change listener
    const subscription = Network.addNetworkStateListener(async (networkState) => {
      const state: NetworkState = {
        type: networkState.type ?? Network.NetworkStateType.UNKNOWN,
        isAirplaneMode: await Network.isAirplaneModeEnabledAsync(),
        isConnected: networkState.isConnected ?? false,
        isInternetReachable: networkState.isInternetReachable ?? false,
      };

      this.currentState = state;
      
      // Notify all listeners
      this.listeners.forEach(callback => callback(state));
    });

    // Store subscription for cleanup
    (this as any)._subscription = subscription;
  }

  /**
   * Stop monitoring network changes
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    // Remove subscription
    const subscription = (this as any)._subscription;
    if (subscription) {
      subscription.remove();
      (this as any)._subscription = null;
    }
  }

  /**
   * Add network state change listener
   */
  static addListener(callback: NetworkCallback): () => void {
    this.listeners.add(callback);
    
    // Start monitoring if not already
    if (!this.isMonitoring) {
      this.startMonitoring();
    }

    // Return cleanup function
    return () => {
      this.listeners.delete(callback);
      
      // Stop monitoring if no more listeners
      if (this.listeners.size === 0) {
        this.stopMonitoring();
      }
    };
  }

  /**
   * Get cached network state
   */
  static getCachedState(): NetworkState | null {
    return this.currentState;
  }

  /**
   * Get network type as string
   */
  static getNetworkTypeString(type: Network.NetworkStateType): string {
    switch (type) {
      case Network.NetworkStateType.WIFI:
        return 'WiFi';
      case Network.NetworkStateType.CELLULAR:
        return 'Cellular';
      case Network.NetworkStateType.BLUETOOTH:
        return 'Bluetooth';
      case Network.NetworkStateType.ETHERNET:
        return 'Ethernet';
      case Network.NetworkStateType.VPN:
        return 'VPN';
      case Network.NetworkStateType.OTHER:
        return 'Other';
      case Network.NetworkStateType.NONE:
        return 'None';
      case Network.NetworkStateType.UNKNOWN:
      default:
        return 'Unknown';
    }
  }

  /**
   * Check if on cellular connection
   */
  static async isOnCellular(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.type === Network.NetworkStateType.CELLULAR;
  }

  /**
   * Check if on WiFi
   */
  static async isOnWiFi(): Promise<boolean> {
    const state = await this.getNetworkState();
    return state.type === Network.NetworkStateType.WIFI;
  }

  /**
   * Get connection quality (estimated)
   */
  static async getConnectionQuality(): Promise<'poor' | 'fair' | 'good' | 'excellent' | 'unknown'> {
    const state = await this.getNetworkState();
    
    if (!state.isConnected || !state.isInternetReachable) {
      return 'poor';
    }

    switch (state.type) {
      case Network.NetworkStateType.WIFI:
      case Network.NetworkStateType.ETHERNET:
        return 'excellent';
      case Network.NetworkStateType.CELLULAR:
        // Would need more info about cellular type (3G/4G/5G)
        return 'good';
      case Network.NetworkStateType.BLUETOOTH:
        return 'fair';
      default:
        return 'unknown';
    }
  }

  /**
   * Queue action for when online
   */
  static async queueForOnline(
    action: () => Promise<void>,
    options?: { 
      maxRetries?: number;
      retryDelay?: number;
    }
  ): Promise<void> {
    const maxRetries = options?.maxRetries ?? 3;
    const retryDelay = options?.retryDelay ?? 5000;
    let retries = 0;

    const tryAction = async () => {
      const isOnline = await this.isOnline();
      
      if (isOnline) {
        try {
          await action();
          return;
        } catch (error) {
          console.error('Action failed:', error);
          throw error;
        }
      }

      // Not online, retry later
      if (retries < maxRetries) {
        retries++;
        setTimeout(tryAction, retryDelay);
      } else {
        throw new Error('Max retries reached, still offline');
      }
    };

    await tryAction();
  }

  /**
   * React hook for network state
   */
  static useNetworkState(callback?: (state: NetworkState) => void): NetworkState | null {
    const [state, setState] = React.useState<NetworkState | null>(null);

    React.useEffect(() => {
      // Get initial state
      this.getNetworkState().then(setState);

      // Listen for changes
      const cleanup = this.addListener((newState) => {
        setState(newState);
        callback?.(newState);
      });

      return cleanup;
    }, [callback]);

    return state;
  }
}

// Export network state types
export { NetworkStateType } from 'expo-network';

// Export React hook

export function useNetworkState(callback?: NetworkCallback): NetworkState | null {
  const [state, setState] = React.useState<NetworkState | null>(null);

  React.useEffect(() => {
    // Get initial state
    NetworkService.getNetworkState().then(setState);

    // Listen for changes
    const cleanup = NetworkService.addListener((newState) => {
      setState(newState);
      callback?.(newState);
    });

    return cleanup;
  }, [callback]);

  return state;
}

// Export HOC for network-aware components
export function withNetworkState<P extends object>(
  Component: React.ComponentType<P & { networkState: NetworkState | null }>,
  onNetworkChange?: NetworkCallback
): React.ComponentType<P> {
  return (props: P) => {
    const networkState = useNetworkState(onNetworkChange);
    return <Component {...props} networkState={networkState} />;
  };
}