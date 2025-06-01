import { BlurView } from 'expo-blur';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

interface BlurredBackgroundProps {
  children: ReactNode;
  fallbackColor?: string;
  intensity?: number;
  style?: ViewStyle;
  tint?: 'light' | 'dark' | 'default' | 'extraLight';
}

export default function BlurredBackground({
  children,
  fallbackColor = 'rgba(255, 255, 255, 0.9)',
  intensity = 80,
  style,
  tint = 'light',
}: BlurredBackgroundProps) {
  // BlurView only works on iOS, fallback to semi-transparent view on web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallback, { backgroundColor: fallbackColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView style={[styles.container, style]} intensity={intensity} tint={tint}>
      {children}
    </BlurView>
  );
}

// Modal backdrop with blur
export function BlurredModal({
  children,
  onBackdropPress,
  visible = true,
}: {
  children: ReactNode;
  visible?: boolean;
  onBackdropPress?: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <BlurredBackground
        style={styles.modalBackdrop}
        intensity={100}
        tint="dark"
      >
        <View onTouchEnd={onBackdropPress} style={styles.modalTouchable} />
      </BlurredBackground>
      <View style={styles.modalContent}>
        {children}
      </View>
    </View>
  );
}

// Navigation bar with blur
export function BlurredNavBar({
  children,
  position = 'top',
}: {
  children: ReactNode;
  position?: 'top' | 'bottom';
}) {
  const positionStyles = position === 'top' ? styles.navTop : styles.navBottom;

  return (
    <BlurredBackground
      style={[styles.navBar, positionStyles]}
      intensity={95}
      tint="light"
    >
      {children}
    </BlurredBackground>
  );
}

// Overlay for images with blur
export function BlurredOverlay({
  children,
  visible = true,
}: {
  children: ReactNode;
  visible?: boolean;
}) {
  if (!visible) return null;

  return (
    <BlurredBackground
      style={styles.overlay}
      intensity={60}
      tint="dark"
    >
      {children}
    </BlurredBackground>
  );
}

// Tab bar with blur effect
export function BlurredTabBar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BlurredBackground
      style={styles.tabBar}
      intensity={100}
      tint="extraLight"
    >
      {children}
    </BlurredBackground>
  );
}

// Card with blurred background
export function BlurredCard({
  children,
  intensity = 50,
}: {
  children: ReactNode;
  intensity?: number;
}) {
  return (
    <BlurredBackground
      style={styles.card}
      intensity={intensity}
      tint="light"
    >
      {children}
    </BlurredBackground>
  );
}

// Scanner overlay with blur
export function BlurredScannerOverlay({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <View style={styles.scannerOverlayContainer}>
      <BlurredBackground
        style={styles.scannerOverlayTop}
        intensity={90}
        tint="dark"
      />
      <View style={styles.scannerClearArea}>
        {children}
      </View>
      <BlurredBackground
        style={styles.scannerOverlayBottom}
        intensity={90}
        tint="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 3,
    marginVertical: 8,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  container: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  modalContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  navBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
  navBottom: {
    borderBottomWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 0,
    paddingBottom: 34, // Safe area for iOS
    paddingTop: 12,
  },
  navTop: {
    paddingBottom: 12,
    paddingTop: 44, // Safe area for iOS
    top: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerClearArea: {
    width: '100%',
    alignItems: 'center',
    height: 250,
    justifyContent: 'center',
  },
  scannerOverlayBottom: {
    flex: 1,
  },
  scannerOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlayTop: {
    flex: 1,
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 0,
    left: 0,
    paddingBottom: 34, // Safe area
    paddingHorizontal: 8,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
});

// Export blur intensity presets
export const BLUR_INTENSITY = {
  EXTRA_HEAVY: 120,
  HEAVY: 100,
  LIGHT: 50,
  MEDIUM: 80,
} as const;

// Export tint presets
export const BLUR_TINT = {
  DARK: 'dark' as const,
  DEFAULT: 'default' as const,
  EXTRA_LIGHT: 'extraLight' as const,
  LIGHT: 'light' as const,
};