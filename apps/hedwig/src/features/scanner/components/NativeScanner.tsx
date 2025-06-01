

import { ScanHistoryService } from '@/features/history/services/scanHistoryService';
import { AudioService } from '@/services/audioService';
import { HapticsService } from '@/services/hapticsService';
import { useKeepAwakeForScanning } from '@/services/keepAwakeService';
import { composeStyles } from '@/shared/utils/style-helpers';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@repo/design-system/uix';

import { useCameraPermission } from '../hooks/useCameraPermission';
import { type ScannerProps, type ScannerState } from '../types/scanner';

export default function NativeScanner({ onError, onScan }: ScannerProps) {
  const { error: permissionError, isLoading, isSimulator, requestPermission, status } = useCameraPermission();
  const [state, setState] = useState<ScannerState>({
    error: null,
    hasPermission: null,
    scanned: false,
    scanning: false,
  });

  // Keep screen awake while scanner is visible
  useKeepAwakeForScanning();

  useEffect(() => {
    if (status) {
      setState((prev) => ({
        ...prev,
        error: status !== 'granted' ? permissionError : null,
        hasPermission: status === 'granted',
      }));
    }
  }, [status, permissionError]);

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (state.scanned) return;

    setState((prev) => ({ ...prev, scanned: true, scanning: false }));

    try {
      const scanResult = {
        id: ScanHistoryService.generateScanId(),
        type: type.toLowerCase(),
        data,
        timestamp: Date.now(),
      };

      // Save to history
      await ScanHistoryService.saveScan(scanResult);

      // Provide haptic and audio feedback
      await HapticsService.scanSuccess();
      await AudioService.playScanSuccess();

      // Notify parent component
      onScan(scanResult);

      // Show success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Scan Successful', `${ScanHistoryService.formatBarcodeType(type)}: ${data}`, [
          { onPress: resetScanner, text: 'Scan Another' },
          { style: 'default', text: 'OK' },
        ]);
      }
    } catch (error) {
      const errorMessage = 'Failed to process scan result';
      setState((prev) => ({ ...prev, error: errorMessage }));
      
      // Error feedback
      await HapticsService.scanError();
      await AudioService.playScanError();
      
      onError?.(errorMessage);
    }
  };

  const resetScanner = () => {
    setState((prev) => ({
      ...prev,
      error: null,
      scanned: false,
      scanning: true,
    }));
  };

  const startScanning = () => {
    setState((prev) => ({ ...prev, error: null, scanned: false, scanning: true }));
  };

  if (state.hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (state.hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission denied</Text>
        <Text style={styles.subMessage}>
          {Platform.OS === 'ios' 
            ? 'Please enable camera access in Settings > Hedwig to use the barcode scanner.'
            : 'Please enable camera access in your device settings to use the barcode scanner.'}
        </Text>
        {Platform.OS === 'ios' ? (
          <Button onPress={handleOpenSettings} style={styles.button}>
            Open Settings
          </Button>
        ) : (
          <Button onPress={requestPermission} style={styles.button}>
            Request Permission
          </Button>
        )}
        {isSimulator && (
          <Text style={styles.warningMessage}>
            Note: Camera is not available in iOS Simulator. Please test on a real device.
          </Text>
        )}
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Error: {state.error}</Text>
        <Button onPress={resetScanner} style={styles.button}>
          Try Again
        </Button>
      </View>
    );
  }

  if (!state.scanning) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Ready to scan</Text>
        <Text style={styles.subMessage}>Point your camera at a barcode or QR code</Text>
        <Button onPress={startScanning} style={styles.button}>
          Start Scanning
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <BarCodeScanner
        barCodeTypes={[
          BarCodeScanner.Constants.BarCodeType.qr,
          BarCodeScanner.Constants.BarCodeType.pdf417,
          BarCodeScanner.Constants.BarCodeType.aztec,
          BarCodeScanner.Constants.BarCodeType.ean13,
          BarCodeScanner.Constants.BarCodeType.ean8,
          BarCodeScanner.Constants.BarCodeType.upc_a,
          BarCodeScanner.Constants.BarCodeType.upc_e,
          BarCodeScanner.Constants.BarCodeType.code39,
          BarCodeScanner.Constants.BarCodeType.code93,
          BarCodeScanner.Constants.BarCodeType.code128,
          BarCodeScanner.Constants.BarCodeType.codabar,
          BarCodeScanner.Constants.BarCodeType.itf14,
        ]}
        onBarCodeScanned={state.scanned ? undefined : handleBarCodeScanned}
        style={styles.camera}
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
          <Button
            onPress={resetScanner}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            variant="outline"
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  camera: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
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
    borderColor: '#fff',
    height: 30,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    alignItems: 'center',
    bottom: 100,
    position: 'absolute',
  },
  instructionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
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
    flex: 1,
    position: 'relative',
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
  warningMessage: {
    color: '#ff9800',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 15,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
