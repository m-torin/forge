import { DeviceMotion, type DeviceMotionMeasurement } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface MotionData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  accelerationIncludingGravity: {
    x: number;
    y: number;
    z: number;
  };
  orientation: number;
  rotation: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export type MotionEventCallback = (data: MotionData) => void;
export type GestureCallback = (gesture: string) => void;

export class MotionService {
  private static isAvailable = false;
  private static isListening = false;
  private static subscription: any = null;
  private static listeners = new Set<MotionEventCallback>();
  private static gestureListeners = new Set<GestureCallback>();
  
  // Shake detection
  private static lastShakeTime = 0;
  private static shakeThreshold = 2.7;
  private static shakeTimeout = 1000;
  
  // Tilt detection
  private static tiltThreshold = 30; // degrees
  private static lastTiltState: 'neutral' | 'left' | 'right' | 'forward' | 'backward' = 'neutral';
  
  // Rotation detection
  private static rotationThreshold = 90; // degrees
  private static lastRotation = 0;

  /**
   * Initialize motion service
   */
  static async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('Motion service is iOS only');
      return false;
    }

    try {
      const { isAvailable } = await DeviceMotion.isAvailableAsync();
      this.isAvailable = isAvailable;
      
      if (isAvailable) {
        // Set update interval (60Hz for smooth tracking)
        DeviceMotion.setUpdateInterval(16);
        console.log('Motion service initialized');
      }
      
      return isAvailable;
    } catch (error) {
      console.error('Failed to initialize motion service:', error);
      return false;
    }
  }

  /**
   * Start motion tracking
   */
  static start(): void {
    if (!this.isAvailable || this.isListening) return;

    this.subscription = DeviceMotion.addListener((deviceMotionData) => {
      const data = this.processMotionData(deviceMotionData);
      
      // Notify raw data listeners
      this.listeners.forEach(callback => callback(data));
      
      // Detect gestures
      this.detectShake(data);
      this.detectTilt(data);
      this.detectRotation(data);
    });

    this.isListening = true;
    console.log('Motion tracking started');
  }

  /**
   * Stop motion tracking
   */
  static stop(): void {
    if (!this.isListening) return;

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    this.isListening = false;
    console.log('Motion tracking stopped');
  }

  /**
   * Process raw motion data
   */
  private static processMotionData(data: DeviceMotionMeasurement): MotionData {
    return {
      acceleration: {
        x: data.acceleration?.x || 0,
        y: data.acceleration?.y || 0,
        z: data.acceleration?.z || 0,
      },
      accelerationIncludingGravity: {
        x: data.accelerationIncludingGravity?.x || 0,
        y: data.accelerationIncludingGravity?.y || 0,
        z: data.accelerationIncludingGravity?.z || 0,
      },
      orientation: data.orientation || 0,
      rotation: {
        alpha: data.rotation?.alpha || 0,
        beta: data.rotation?.beta || 0,
        gamma: data.rotation?.gamma || 0,
      },
      rotationRate: {
        alpha: data.rotationRate?.alpha || 0,
        beta: data.rotationRate?.beta || 0,
        gamma: data.rotationRate?.gamma || 0,
      },
    };
  }

  /**
   * Detect shake gesture
   */
  private static detectShake(data: MotionData): void {
    const { x, y, z } = data.acceleration;
    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);
    
    const now = Date.now();
    if (accelerationMagnitude > this.shakeThreshold) {
      if (now - this.lastShakeTime > this.shakeTimeout) {
        this.lastShakeTime = now;
        this.notifyGesture('shake');
      }
    }
  }

  /**
   * Detect tilt gesture
   */
  private static detectTilt(data: MotionData): void {
    const { x, y } = data.accelerationIncludingGravity;
    
    // Calculate tilt angles
    const tiltX = Math.atan2(x, 9.81) * (180 / Math.PI);
    const tiltY = Math.atan2(y, 9.81) * (180 / Math.PI);
    
    let newTiltState: typeof this.lastTiltState = 'neutral';
    
    if (Math.abs(tiltX) > this.tiltThreshold) {
      newTiltState = tiltX > 0 ? 'right' : 'left';
    } else if (Math.abs(tiltY) > this.tiltThreshold) {
      newTiltState = tiltY > 0 ? 'backward' : 'forward';
    }
    
    if (newTiltState !== this.lastTiltState) {
      this.lastTiltState = newTiltState;
      if (newTiltState !== 'neutral') {
        this.notifyGesture(`tilt_${newTiltState}`);
      }
    }
  }

  /**
   * Detect rotation gesture
   */
  private static detectRotation(data: MotionData): void {
    const currentRotation = data.rotation.gamma;
    const rotationDelta = Math.abs(currentRotation - this.lastRotation);
    
    if (rotationDelta > this.rotationThreshold) {
      const direction = currentRotation > this.lastRotation ? 'clockwise' : 'counterclockwise';
      this.notifyGesture(`rotate_${direction}`);
      this.lastRotation = currentRotation;
    }
  }

  /**
   * Notify gesture listeners
   */
  private static notifyGesture(gesture: string): void {
    this.gestureListeners.forEach(callback => callback(gesture));
  }

  /**
   * Add motion data listener
   */
  static addMotionListener(callback: MotionEventCallback): () => void {
    this.listeners.add(callback);
    
    // Auto-start if first listener
    if (this.listeners.size === 1 && !this.isListening) {
      this.start();
    }
    
    return () => {
      this.listeners.delete(callback);
      
      // Auto-stop if no more listeners
      if (this.listeners.size === 0 && this.gestureListeners.size === 0) {
        this.stop();
      }
    };
  }

  /**
   * Add gesture listener
   */
  static addGestureListener(callback: GestureCallback): () => void {
    this.gestureListeners.add(callback);
    
    // Auto-start if first listener
    if (this.gestureListeners.size === 1 && !this.isListening) {
      this.start();
    }
    
    return () => {
      this.gestureListeners.delete(callback);
      
      // Auto-stop if no more listeners
      if (this.listeners.size === 0 && this.gestureListeners.size === 0) {
        this.stop();
      }
    };
  }

  /**
   * Configure shake detection
   */
  static configureShakeDetection(threshold = 2.7, timeout = 1000): void {
    this.shakeThreshold = threshold;
    this.shakeTimeout = timeout;
  }

  /**
   * Configure tilt detection
   */
  static configureTiltDetection(threshold = 30): void {
    this.tiltThreshold = threshold;
  }

  /**
   * Configure rotation detection
   */
  static configureRotationDetection(threshold = 90): void {
    this.rotationThreshold = threshold;
  }

  /**
   * Get device orientation based on acceleration
   */
  static getDeviceOrientation(data: MotionData): 'portrait' | 'landscape' | 'unknown' {
    const { x, y, z } = data.accelerationIncludingGravity;
    
    if (Math.abs(z) > 8) {
      return 'unknown'; // Device is flat
    }
    
    if (Math.abs(y) > Math.abs(x)) {
      return 'portrait';
    } else {
      return 'landscape';
    }
  }

  /**
   * Check if device is stationary
   */
  static isStationary(data: MotionData, threshold = 0.1): boolean {
    const { x, y, z } = data.acceleration;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    return magnitude < threshold;
  }

  /**
   * Get motion intensity (0-1)
   */
  static getMotionIntensity(data: MotionData): number {
    const { x, y, z } = data.acceleration;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    // Normalize to 0-1 range (assuming max acceleration of 4g)
    return Math.min(magnitude / 40, 1);
  }
}

// React hooks

export function useMotion() {
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    MotionService.initialize().then(setIsAvailable);
    
    if (isAvailable) {
      const cleanup = MotionService.addMotionListener(setMotionData);
      return cleanup;
    }
  }, [isAvailable]);

  return { isAvailable, motionData };
}

export function useGestures(onGesture: GestureCallback) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    MotionService.initialize().then(setIsAvailable);
    
    if (isAvailable) {
      const cleanup = MotionService.addGestureListener(onGesture);
      return cleanup;
    }
  }, [isAvailable, onGesture]);

  return { isAvailable };
}

// HOC for motion-aware components
export function withMotion<P extends object>(
  Component: React.ComponentType<P & { motion: ReturnType<typeof useMotion> }>
): React.ComponentType<P> {
  return (props: P) => {
    const motion = useMotion();
    return <Component {...props} motion={motion} />;
  };
}

// HOC for gesture-aware components
export function withGestures<P extends object>(
  Component: React.ComponentType<P>,
  onGesture: GestureCallback
): React.ComponentType<P> {
  return (props: P) => {
    useGestures(onGesture);
    return <Component {...props} />;
  };
}