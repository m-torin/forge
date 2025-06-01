

import { ScanHistoryService } from '@/features/history/services/scanHistoryService';
import { ProductLookupService, type ProductWithBarcodes } from '@/features/products/services/productLookupService';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@repo/design-system/gluestack';

import { type ScanResult } from '../types/scanner';

interface ResultDisplayProps {
  onClose: () => void;
  onScanAnother: () => void;
  result: ScanResult;
}

export default function ResultDisplay({ onClose, onScanAnother, result }: ResultDisplayProps) {
  const [note, setNote] = useState(result.note || '');
  const [saving, setSaving] = useState(false);
  const [lookingUpProduct, setLookingUpProduct] = useState(false);
  const [foundProduct, setFoundProduct] = useState<ProductWithBarcodes | null>(null);

  // Check if this looks like a barcode that could be a product
  const isProductBarcode = /^\d{8,14}$/.test(result.data);

  useEffect(() => {
    if (isProductBarcode) {
      lookupProduct();
    }
  }, [result.data, isProductBarcode]);

  const lookupProduct = async () => {
    setLookingUpProduct(true);
    try {
      const product = await ProductLookupService.findProductByBarcode(result.data);
      setFoundProduct(product);
    } catch (error) {
      console.error('Product lookup failed:', error);
    } finally {
      setLookingUpProduct(false);
    }
  };

  const navigateToProduct = () => {
    if (foundProduct && typeof window !== 'undefined') {
      window.location.href = `/pim/products/${foundProduct.id}`;
    }
  };

  const navigateToAISearch = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/search?barcode=${encodeURIComponent(result.data)}`;
    }
  };

  const handleOpenLink = async () => {
    const { data } = result;

    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      try {
        const supported = await Linking.canOpenURL(data);
        if (supported) {
          await Linking.openURL(data);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open URL');
      }
    } else if (data.startsWith('mailto:')) {
      try {
        await Linking.openURL(data);
      } catch (error) {
        Alert.alert('Error', 'Cannot open email client');
      }
    } else if (data.startsWith('tel:')) {
      try {
        await Linking.openURL(data);
      } catch (error) {
        Alert.alert('Error', 'Cannot open phone dialer');
      }
    } else {
      Alert.alert('Info', 'This is not a clickable link');
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const updatedResult = { ...result, note };
      await ScanHistoryService.saveScan(updatedResult);
      Alert.alert('Success', 'Note saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    // For web, use navigator.clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(result.data)
        .then(() => Alert.alert('Success', 'Copied to clipboard'))
        .catch(() => Alert.alert('Error', 'Failed to copy'));
    } else {
      Alert.alert('Info', 'Copy to clipboard not supported');
    }
  };

  const isUrl = result.data.startsWith('http://') || result.data.startsWith('https://');
  const isEmail = result.data.startsWith('mailto:');
  const isPhone = result.data.startsWith('tel:');
  const isClickable = isUrl || isEmail || isPhone;

  return (
    <View style={styles.container}>
      <Card style={styles.resultCard}>
        <Text style={styles.title}>Scan Result</Text>

        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Type:</Text>
          <Text style={styles.typeValue}>{ScanHistoryService.formatBarcodeType(result.type)}</Text>
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Content:</Text>
          <Text style={styles.dataValue} selectable>
            {result.data}
          </Text>
        </View>

        <View style={styles.timestampContainer}>
          <Text style={styles.timestampLabel}>Scanned:</Text>
          <Text style={styles.timestampValue}>{new Date(result.timestamp).toLocaleString()}</Text>
        </View>

        {/* Product Lookup Section */}
        {isProductBarcode && (
          <View style={styles.productSection}>
            <Text style={styles.productSectionTitle}>📦 Product Lookup</Text>

            {lookingUpProduct ? (
              <View style={styles.lookupStatus}>
                <Text style={styles.lookupText}>🔍 Searching in PIM system...</Text>
              </View>
            ) : foundProduct ? (
              <View style={styles.productFound}>
                <Text style={styles.productFoundTitle}>✅ Product Found!</Text>
                <Text style={styles.productName}>{foundProduct.name}</Text>
                <Text style={styles.productSku}>SKU: {foundProduct.sku}</Text>
                <Text style={styles.productCategory}>{foundProduct.category}</Text>
                <View style={styles.productActions}>
                  <Button onPress={navigateToProduct} style={styles.productButton}>
                    View in PIM
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.productNotFound}>
                <Text style={styles.notFoundTitle}>❓ Product Not Found</Text>
                <Text style={styles.notFoundText}>
                  This barcode isn't in your PIM system yet.
                </Text>
                <View style={styles.notFoundActions}>
                  <Button onPress={navigateToAISearch} style={styles.aiSearchButton}>
                    🤖 Search with AI
                  </Button>
                  <Button onPress={lookupProduct} style={styles.retryButton} variant="outline">
                    🔄 Retry
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={copyToClipboard}
            style={styles.actionButton}
            size="small"
            variant="outline"
          >
            Copy
          </Button>

          {isClickable && (
            <Button onPress={handleOpenLink} style={styles.actionButton} size="small">
              {isUrl ? 'Open Link' : isEmail ? 'Send Email' : 'Call'}
            </Button>
          )}
        </View>

        {/* Note section */}
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Add Note (Optional):</Text>
          <View style={styles.noteInputContainer}>
            <Text
              onPress={() => {
                // For web, we'd use a proper input field
                const newNote = prompt('Enter note:', note);
                if (newNote !== null) {
                  setNote(newNote);
                }
              }}
              style={styles.noteInput}
            >
              {note || 'Tap to add a note...'}
            </Text>
          </View>

          {note !== result.note && (
            <Button
              onPress={handleSaveNote}
              style={styles.saveButton}
              disabled={saving}
              size="small"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          )}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationButtons}>
          <Button onPress={onScanAnother} style={styles.navButton}>
            Scan Another
          </Button>
          <Button onPress={onClose} style={styles.navButton} variant="secondary">
            Close
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeLabel: {
    width: 80,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  typeValue: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    color: '#333',
    flex: 1,
    fontSize: 14,
    padding: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  aiSearchButton: {
    backgroundColor: '#2196f3',
    flex: 1,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dataContainer: {
    marginBottom: 15,
  },
  dataLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dataValue: {
    borderWidth: 1,
    backgroundColor: '#f8f8f8',
    borderColor: '#e0e0e0',
    borderRadius: 6,
    color: '#333',
    fontSize: 16,
    minHeight: 50,
    padding: 12,
  },
  lookupStatus: {
    alignItems: 'center',
    padding: 15,
  },
  lookupText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  navButton: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  noteInput: {
    borderWidth: 1,
    backgroundColor: '#f8f8f8',
    borderColor: '#e0e0e0',
    borderRadius: 6,
    color: '#333',
    fontSize: 14,
    minHeight: 40,
    padding: 12,
  },
  noteInputContainer: {
    marginBottom: 10,
  },
  noteLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
    paddingTop: 15,
  },
  notFoundActions: {
    flexDirection: 'row',
    gap: 10,
  },
  notFoundText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  notFoundTitle: {
    color: '#ff9800',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productActions: {
    alignItems: 'center',
  },
  productButton: {
    minWidth: 120,
  },
  productCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    color: '#999',
    fontSize: 12,
    marginBottom: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productFound: {
    borderWidth: 1,
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderRadius: 8,
    padding: 15,
  },
  productFoundTitle: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productNotFound: {
    borderWidth: 1,
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderRadius: 8,
    padding: 15,
  },
  productSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
    paddingTop: 15,
  },
  productSectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  productSku: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  resultCard: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  retryButton: {
    flex: 1,
  },
  saveButton: {
    alignSelf: 'flex-start',
  },
  timestampContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  timestampLabel: {
    width: 80,
    color: '#999',
    fontSize: 12,
  },
  timestampValue: {
    color: '#666',
    flex: 1,
    fontSize: 12,
  },
  title: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
