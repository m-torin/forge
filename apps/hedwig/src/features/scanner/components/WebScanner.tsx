

import { ScanHistoryService } from '@/features/history/services/scanHistoryService';
import { composeStyles } from '@/shared/utils/style-helpers';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useZxing } from 'react-zxing';

import { Button } from '@repo/design-system/uix';

import { type ScannerProps, type ScannerState } from '../types/scanner';

export default function WebScanner({ onError, onScan }: ScannerProps) {
  const [state, setState] = useState<ScannerState>({
    error: null,
    hasPermission: null,
    scanned: false,
    scanning: false,
  });

  const handleScanResult = useCallback(
    async (result: any) => {
      if (state.scanned || !result) return;

      setState((prev) => ({ ...prev, scanned: true, scanning: false }));

      try {
        const scanResult = {
          id: ScanHistoryService.generateScanId(),
          type: result.getBarcodeFormat()?.toString().toLowerCase() || 'unknown',
          data: result.getText(),
          timestamp: Date.now(),
        };

        // Save to history
        await ScanHistoryService.saveScan(scanResult);

        // Notify parent component
        onScan(scanResult);

        // Show success message
        alert(
          `Scan successful!\n${ScanHistoryService.formatBarcodeType(scanResult.type)}: ${scanResult.data}`,
        );
      } catch (error) {
        const errorMessage = 'Failed to process scan result';
        setState((prev) => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    },
    [state.scanned, onScan, onError],
  );

  const handleScanError = useCallback(
    (error: any) => {
      console.error('Scan error:', error);
      const errorMessage = 'Camera access failed or not supported';
      setState((prev) => ({ ...prev, error: errorMessage, hasPermission: false }));
      onError?.(errorMessage);
    },
    [onError],
  );

  const { ref } = useZxing({
    constraints: {
      video: {
        facingMode: 'environment', // Use back camera if available
      },
    },
    hints: new Map([
      // Enable multiple barcode formats
      [2, true], // QR_CODE
      [1, true], // CODE_128
      [8, true], // CODE_39
      [13, true], // EAN_13
      [14, true], // EAN_8
      [12, true], // UPC_A
      [9, true], // UPC_E
    ]) as any,
    onDecodeError: handleScanError,
    onDecodeResult: handleScanResult,
    timeBetweenDecodingAttempts: 300,
  });

  const startScanning = () => {
    setState((prev) => ({
      ...prev,
      error: null,
      hasPermission: true,
      scanned: false,
      scanning: true,
    }));
  };

  const resetScanner = () => {
    setState((prev) => ({
      ...prev,
      error: null,
      scanned: false,
      scanning: true,
    }));
  };

  const stopScanning = () => {
    setState((prev) => ({
      ...prev,
      scanned: false,
      scanning: false,
    }));
  };

  if (state.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Error: {state.error}</Text>
        <Text style={styles.subMessage}>
          Make sure your browser supports camera access and you've granted permission.
        </Text>
        <Button onPress={startScanning} style={styles.button}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!state.scanning) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Web Barcode Scanner</Text>
        <Text style={styles.subMessage}>
          Click start to begin scanning barcodes and QR codes using your device camera.
        </Text>
        <Button onPress={startScanning} style={styles.button}>
          Start Camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <View style={styles.videoContainer}>
        <video
          ref={ref}
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
          playsInline
        />

        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={composeStyles(styles.corner, styles.topRight)} />
            <View style={composeStyles(styles.corner, styles.bottomLeft)} />
            <View style={composeStyles(styles.corner, styles.bottomRight)} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Position barcode within the frame</Text>
            <View style={styles.buttonRow}>
              <Button
                onPress={resetScanner}
                style={styles.actionButton}
                size="small"
                textStyle={styles.actionButtonText}
                variant="outline"
              >
                Reset
              </Button>
              <Button
                onPress={stopScanning}
                style={styles.actionButton}
                size="small"
                textStyle={styles.actionButtonText}
                variant="secondary"
              >
                Stop
              </Button>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>📱 Point your camera at any barcode or QR code</Text>
        <Text style={styles.infoText}>🔍 Supports QR codes, UPC, EAN, Code 128, and more</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  actionButton: {
    minWidth: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
  actionButtonText: {
    color: '#fff',
  },
  bottomLeft: {
    borderRightWidth: 0,
    borderTopWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto',
  },
  bottomRight: {
    borderLeftWidth: 0,
    borderTopWidth: 0,
    bottom: 0,
    left: 'auto',
    right: 0,
    top: 'auto',
  },
  button: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  corner: {
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderWidth: 3,
    width: 30,
    borderColor: '#00ff00',
    height: 30,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  instructions: {
    alignItems: 'center',
    bottom: 60,
    position: 'absolute',
  },
  instructionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    padding: 12,
    textAlign: 'center',
  },
  message: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerContainer: {
    backgroundColor: '#000',
    flex: 1,
  },
  subMessage: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  topRight: {
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    left: 'auto',
    right: 0,
    top: 0,
  },
});
