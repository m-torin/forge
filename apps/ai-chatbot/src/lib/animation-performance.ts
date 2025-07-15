/**
 * Animation Performance Utilities
 *
 * This module provides tools for monitoring, optimizing, and batching animations
 * to ensure smooth performance across the AI chatbot application.
 */

import { ANIMATION_DURATION, getReducedMotionSettings } from './animation-constants';

// =======================
// PERFORMANCE MONITORING
// =======================

interface AnimationMetrics {
  startTime: number;
  endTime?: number;
  duration: number;
  fps: number[];
  dropped: number;
  name: string;
}

class AnimationPerformanceMonitor {
  private metrics: Map<string, AnimationMetrics> = new Map();
  private rafId: number | null = null;
  private isMonitoring = false;

  startMonitoring(animationName: string) {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    this.metrics.set(animationName, {
      startTime,
      duration: 0,
      fps: [],
      dropped: 0,
      name: animationName,
    });

    this.startFPSMonitoring(animationName);
  }

  private startFPSMonitoring(animationName: string) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    let lastTime = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      const fps = 1000 / deltaTime;

      const metrics = this.metrics.get(animationName);
      if (metrics) {
        metrics.fps.push(fps);
        if (fps < 50) metrics.dropped++;
      }

      lastTime = currentTime;

      if (this.isMonitoring) {
        this.rafId = requestAnimationFrame(measureFrame);
      }
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  stopMonitoring(animationName: string) {
    const metrics = this.metrics.get(animationName);
    if (metrics) {
      metrics.endTime = performance.now();
      metrics.duration = metrics.endTime - metrics.startTime;
    }

    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getMetrics(animationName: string): AnimationMetrics | undefined {
    return this.metrics.get(animationName);
  }

  getAllMetrics(): AnimationMetrics[] {
    return Array.from(this.metrics.values());
  }

  getAverageFPS(animationName: string): number {
    const metrics = this.metrics.get(animationName);
    if (!metrics || metrics.fps.length === 0) return 0;

    const sum = metrics.fps.reduce((acc, fps) => acc + fps, 0);
    return sum / metrics.fps.length;
  }

  clearMetrics() {
    this.metrics.clear();
  }

  logPerformanceReport() {
    if (typeof console === 'undefined') return;

    // console.group('🎬 Animation Performance Report');

    this.getAllMetrics().forEach(metrics => {
      const _avgFPS = this.getAverageFPS(metrics.name);
      const _droppedPercent = (metrics.dropped / metrics.fps.length) * 100;

      // console.log(`📊 ${metrics.name}:`, {
      //   duration: `${metrics.duration.toFixed(2)}ms`,
      //   averageFPS: `${avgFPS.toFixed(1)} fps`,
      //   droppedFrames: `${metrics.dropped} (${droppedPercent.toFixed(1)}%)`,
      //   samples: metrics.fps.length,
      // });
    });

    // console.groupEnd();
  }
}

// Global performance monitor instance
export const animationMonitor = new AnimationPerformanceMonitor();

// =======================
// ANIMATION BATCHING
// =======================

interface BatchedUpdate {
  id: string;
  update: () => void;
  priority: 'high' | 'medium' | 'low';
}

class AnimationBatcher {
  private updates: BatchedUpdate[] = [];
  private rafId: number | null = null;
  private isProcessing = false;

  add(id: string, update: () => void, priority: 'high' | 'medium' | 'low' = 'medium') {
    // Remove existing update with same ID
    this.updates = this.updates.filter(u => u.id !== id);

    // Add new update
    this.updates.push({ id, update, priority });

    // Schedule processing if not already scheduled
    if (!this.isProcessing) {
      this.scheduleProcessing();
    }
  }

  private scheduleProcessing() {
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      this.processUpdates();
      this.rafId = null;
      this.isProcessing = false;
    });

    this.isProcessing = true;
  }

  private processUpdates() {
    // Sort by priority (high -> medium -> low)
    this.updates.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process all updates in order
    const startTime = performance.now();

    for (const { update, id } of this.updates) {
      try {
        update();
      } catch (_error) {
        // console.warn(`Animation update failed for ${id}:`, error);
      }

      // If we're taking too long, defer remaining updates
      if (performance.now() - startTime > 16) {
        // ~60fps budget
        const remaining = this.updates.slice(this.updates.indexOf({ update, id } as any) + 1);
        this.updates = remaining;
        if (remaining.length > 0) {
          this.scheduleProcessing();
        }
        break;
      }
    }

    this.updates = [];
  }

  clear() {
    this.updates = [];
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isProcessing = false;
  }
}

// Global animation batcher instance
export const animationBatcher = new AnimationBatcher();

// =======================
// MOTION VALUE OPTIMIZATION
// =======================

interface OptimizedMotionValue<T> {
  current: T;
  set: (value: T) => void;
  get: () => T;
  __optimized: boolean;
}

/**
 * Create an optimized motion value that batches updates
 */
export function createOptimizedMotionValue<T>(
  initialValue: T,
  key: string,
): OptimizedMotionValue<T> {
  // This would need to be implemented with the actual MotionValue constructor
  // For now, we'll create a placeholder that shows the concept
  const motionValue: OptimizedMotionValue<T> = {
    current: initialValue,
    set: (value: T) => {
      animationBatcher.add(
        `motion-value-${key}`,
        () => {
          motionValue.current = value;
          // Trigger actual motion value update
        },
        'high',
      );
    },
    get: () => motionValue.current,
    __optimized: true,
  };

  return motionValue;
}

// =======================
// HARDWARE ACCELERATION
// =======================

export class HardwareAcceleration {
  private static acceleratedElements = new Set<Element>();

  static enable(element: Element, properties: string[] = ['transform', 'opacity']) {
    if (typeof window === 'undefined') return;

    const htmlElement = element as HTMLElement;

    // Apply will-change for better performance
    htmlElement.style.willChange = properties.join(', ');

    // Force hardware acceleration with translateZ
    if (properties.includes('transform')) {
      htmlElement.style.transform = htmlElement.style.transform || 'translateZ(0)';
    }

    this.acceleratedElements.add(element);
  }

  static disable(element: Element) {
    const htmlElement = element as HTMLElement;
    htmlElement.style.willChange = 'auto';

    // Remove translateZ if it was only added for acceleration
    if (htmlElement.style.transform === 'translateZ(0)') {
      htmlElement.style.transform = '';
    }

    this.acceleratedElements.delete(element);
  }

  static disableAll() {
    this.acceleratedElements.forEach(element => {
      this.disable(element);
    });
  }

  static getAcceleratedCount(): number {
    return this.acceleratedElements.size;
  }
}

// =======================
// MEMORY MANAGEMENT
// =======================

export class AnimationMemoryManager {
  private static instances = new WeakMap<object, Set<string>>();

  static track(component: object, animationId: string) {
    if (!this.instances.has(component)) {
      this.instances.set(component, new Set());
    }
    const componentAnimations = this.instances.get(component);
    if (componentAnimations) {
      componentAnimations.add(animationId);
    }
  }

  static cleanup(component: object) {
    const animations = this.instances.get(component);
    if (animations) {
      animations.forEach(_id => {
        // Clean up any resources associated with the animation
        animationBatcher.clear();
        animationMonitor.clearMetrics();
      });
      this.instances.delete(component);
    }
  }

  static getStats() {
    return {
      trackedComponents: 0, // WeakMap doesn't have size property
      // In a real implementation, we'd count total animations
      totalAnimations: 'N/A (WeakMap limitation)',
    };
  }
}

// =======================
// PERFORMANCE UTILITIES
// =======================

/**
 * Throttle animation updates to prevent excessive calls
 */
export function throttleAnimation<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 16, // ~60fps
): T {
  let lastTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastTime >= delay) {
      lastTime = now;
      return fn(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          lastTime = Date.now();
          fn(...args);
        },
        delay - (now - lastTime),
      );
    }
  }) as T;
}

/**
 * Debounce animation triggers to prevent rapid-fire animations
 */
export function debounceAnimation<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 100,
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Check if device supports smooth animations
 */
export function supportsHighPerformanceAnimations(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for reduced motion preference
  const reducedMotion = getReducedMotionSettings();
  if (reducedMotion) return false;

  // Check device memory (if available)
  const navigator = window.navigator as any;
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return false;
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return false;
  }

  // Check for battery savings mode
  if (navigator.getBattery) {
    (async () => {
      try {
        await navigator.getBattery();
        // Battery check logic would go here
      } catch {
        // Handle battery API errors
      }
    })();
  }

  return true;
}

/**
 * Get optimal animation duration based on device capabilities
 */
export function getOptimalAnimationDuration(baseDuration: number): number {
  const reducedMotion = getReducedMotionSettings();
  if (reducedMotion) return reducedMotion.duration;

  const highPerf = supportsHighPerformanceAnimations();
  return highPerf ? baseDuration : baseDuration * 0.7; // Slightly faster on low-end devices
}

/**
 * Create performance-aware animation config
 */
export interface PerformantAnimationConfig {
  duration: number;
  ease: string | number[];
  willChange?: string;
  enableHardwareAccel?: boolean;
}

export function createPerformantAnimation(
  config: Partial<PerformantAnimationConfig> = {},
): PerformantAnimationConfig {
  const {
    duration = ANIMATION_DURATION.normal,
    ease = 'easeOut',
    willChange = 'transform, opacity',
    enableHardwareAccel = true,
  } = config;

  return {
    duration: getOptimalAnimationDuration(duration),
    ease,
    willChange,
    enableHardwareAccel,
  };
}

// =======================
// PERFORMANCE HOOKS INTEGRATION
// =======================

/**
 * Performance monitoring hook for React components
 */
export function useAnimationPerformance(componentName: string) {
  if (typeof window === 'undefined') {
    return {
      startMonitoring: () => {},
      stopMonitoring: () => {},
      getMetrics: () => undefined,
    };
  }

  return {
    startMonitoring: () => animationMonitor.startMonitoring(componentName),
    stopMonitoring: () => animationMonitor.stopMonitoring(componentName),
    getMetrics: () => animationMonitor.getMetrics(componentName),
  };
}

// =======================
// EXPORTS
// =======================

export { AnimationBatcher, AnimationPerformanceMonitor, type AnimationMetrics, type BatchedUpdate };
