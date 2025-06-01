import { activateKeepAwake, deactivateKeepAwake, useKeepAwake } from 'expo-keep-awake';
import React from 'react';

export class KeepAwakeService {
  private static isActive = false;
  private static tag = 'hedwig-scanner';

  /**
   * Keep screen awake (for scanning sessions)
   */
  static activate(tag: string = this.tag): void {
    try {
      activateKeepAwake(tag);
      this.isActive = true;
      console.log(`Keep awake activated: ${tag}`);
    } catch (error) {
      console.error('Failed to activate keep awake:', error);
    }
  }

  /**
   * Allow screen to sleep
   */
  static deactivate(tag: string = this.tag): void {
    try {
      deactivateKeepAwake(tag);
      this.isActive = false;
      console.log(`Keep awake deactivated: ${tag}`);
    } catch (error) {
      console.error('Failed to deactivate keep awake:', error);
    }
  }

  /**
   * Toggle keep awake state
   */
  static toggle(tag: string = this.tag): boolean {
    if (this.isActive) {
      this.deactivate(tag);
      return false;
    } else {
      this.activate(tag);
      return true;
    }
  }

  /**
   * Check if keep awake is active
   */
  static getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate for specific duration
   */
  static activateForDuration(durationMs: number, tag: string = this.tag): void {
    this.activate(tag);
    
    setTimeout(() => {
      if (this.isActive) {
        this.deactivate(tag);
      }
    }, durationMs);
  }

  /**
   * Scanner-specific keep awake
   */
  static activateForScanning(): void {
    this.activate('hedwig-scanner-active');
  }

  static deactivateScanning(): void {
    this.deactivate('hedwig-scanner-active');
  }

  /**
   * Batch processing keep awake
   */
  static activateForBatchProcessing(): void {
    this.activate('hedwig-batch-processing');
  }

  static deactivateBatchProcessing(): void {
    this.deactivate('hedwig-batch-processing');
  }
}

/**
 * React hook for keep awake functionality
 */
export function useKeepAwakeForScanning() {
  useKeepAwake('hedwig-scanner-hook');
}

/**
 * HOC for components that need keep awake
 */
export function withKeepAwake<P extends object>(
  Component: React.ComponentType<P>,
  tag = 'hedwig-component'
): React.ComponentType<P> {
  return (props: P) => {
    useKeepAwake(tag);
    return React.createElement(Component, props);
  };
}