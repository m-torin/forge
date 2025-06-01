

import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@repo/design-system/uix';

import NativeScanner from '../components/NativeScanner';
import ResultDisplay from '../components/ResultDisplay';
import WebScanner from '../components/WebScanner';
import { type ScanResult } from '../types/scanner';

type ViewMode = 'scanner' | 'result' | 'history';

export function ScannerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('scanner');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Platform detection
  const isWeb = Platform.OS === 'web';
  const ScannerComponent = isWeb ? WebScanner : NativeScanner;

  const handleScanSuccess = (result: ScanResult) => {
    setCurrentResult(result);
    setViewMode('result');
    setError(null);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCloseResult = () => {
    setCurrentResult(null);
    setViewMode('scanner');
  };

  const handleScanAnother = () => {
    setCurrentResult(null);
    setViewMode('scanner');
  };

  const handleViewHistory = () => {
    setViewMode('history');
  };

  const handleBackToScanner = () => {
    setViewMode('scanner');
    setError(null);
  };

  // Render based on current view mode
  if (viewMode === 'result' && currentResult) {
    return (
      <ResultDisplay
        onClose={handleCloseResult}
        onScanAnother={handleScanAnother}
        result={currentResult}
      />
    );
  }

  if (viewMode === 'history') {
    return (
      <View style={styles.container}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Scan History</Text>
          <Button onPress={handleBackToScanner} size="small">
            Back to Scanner
          </Button>
        </View>
        {/* History component will be implemented separately */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>History view coming soon...</Text>
        </View>
      </View>
    );
  }

  // Main scanner view
  return (
    <View style={styles.container}>
      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button onPress={() => setError(null)} size="small">
            Dismiss
          </Button>
        </Card>
      )}

      <View style={styles.scannerContainer}>
        <ScannerComponent onError={handleScanError} onScan={handleScanSuccess} />
      </View>

      <View style={styles.bottomActions}>
        <Card style={styles.actionsCard}>
          <View style={styles.platformInfo}>
            <Text style={styles.platformText}>Platform: {isWeb ? 'Web Browser' : Platform.OS}</Text>
            <Text style={styles.platformSubtext}>
              {isWeb ? 'Using browser camera API' : 'Using native camera with Expo'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button onPress={handleViewHistory} style={styles.actionButton} variant="outline">
              View History
            </Button>
            <Button onPress={handleBackToScanner} style={styles.actionButton}>
              Reset Scanner
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsCard: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
  },
  bottomActions: {
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderTopColor: '#e0e0e0',
    padding: 15,
  },
  comingSoon: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  comingSoonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  errorCard: {
    borderWidth: 1,
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    margin: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
  },
  historyHeader: {
    borderBottomWidth: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  historyTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  platformInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  platformSubtext: {
    color: '#666',
    fontSize: 12,
  },
  platformText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  scannerContainer: {
    flex: 1,
  },
});
