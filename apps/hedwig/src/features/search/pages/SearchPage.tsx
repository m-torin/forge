'use client'

import { type AISearchResult, ProductLookupService, type ProductWithBarcodes } from '@/features/products/services/productLookupService'
import { composeStyles } from '@/shared/utils/style-helpers'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'

import { Button, Card } from '@repo/design-system/gluestack'

interface SearchData {
  barcode: string
  description: string
  query: string
  timestamp: string
  title: string
}

interface SearchPageProps {
  initialData: SearchData
}

export function SearchPage({ initialData }: SearchPageProps) {
  const [searchResult, setSearchResult] = useState<AISearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importedProduct, setImportedProduct] = useState<ProductWithBarcodes | null>(null)

  useEffect(() => {
    if (initialData.barcode) {
      performAISearch(initialData.barcode)
    }
  }, [initialData.barcode])

  const performAISearch = async (barcode: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Performing AI search for barcode:', barcode)
      const result = await ProductLookupService.searchProductWithAI(barcode)
      setSearchResult(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      console.error('AI search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImportToPIM = async () => {
    if (!searchResult || !initialData.barcode) return

    setImporting(true)
    try {
      const newProduct = await ProductLookupService.addProductToPIM(searchResult, initialData.barcode)
      setImportedProduct(newProduct)
      Alert.alert(
        'Success',
        'Product has been added to your PIM system!',
        [
          { onPress: () => navigateToProduct(newProduct.id), text: 'View Product' },
          { style: 'default', text: 'OK' }
        ]
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed'
      Alert.alert('Error', errorMessage)
      console.error('Import error:', err)
    } finally {
      setImporting(false)
    }
  }

  const navigateToProduct = (productId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/pim/products/${productId}`
    }
  }

  const navigateToScanner = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/scanner'
    }
  }

  const navigateToPIM = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/pim'
    }
  }

  const retrySearch = () => {
    if (initialData.barcode) {
      performAISearch(initialData.barcode)
    }
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Card style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>🔍 Searching for Product Information</Text>
          <Text style={styles.loadingText}>
            Using AI to find details about barcode: {initialData.barcode}
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a few seconds...
          </Text>
        </Card>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>❌ Search Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <Button onPress={retrySearch} style={styles.actionButton}>
              Try Again
            </Button>
            <Button onPress={navigateToScanner} style={styles.actionButton} variant="outline">
              Scan Another
            </Button>
          </View>
        </Card>
      </View>
    )
  }

  if (importedProduct) {
    return (
      <View style={styles.container}>
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>✅ Product Added Successfully</Text>
          <Text style={styles.successText}>
            "{importedProduct.name}" has been added to your PIM system.
          </Text>
          <View style={styles.successActions}>
            <Button onPress={() => navigateToProduct(importedProduct.id)} style={styles.actionButton}>
              View Product
            </Button>
            <Button onPress={navigateToPIM} style={styles.actionButton} variant="outline">
              Go to PIM
            </Button>
            <Button onPress={navigateToScanner} style={styles.actionButton} variant="secondary">
              Scan Another
            </Button>
          </View>
        </Card>
      </View>
    )
  }

  if (!searchResult) {
    return (
      <View style={styles.container}>
        <Card style={styles.noResultCard}>
          <Text style={styles.noResultTitle}>No Search Performed</Text>
          <Text style={styles.noResultText}>
            Please provide a barcode to search for product information.
          </Text>
          <Button onPress={navigateToScanner} style={styles.actionButton}>
            Go to Scanner
          </Button>
        </Card>
      </View>
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Search Results */}
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>🤖 AI Search Results</Text>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence:</Text>
            <Text style={composeStyles(
              styles.confidenceValue,
              { color: searchResult.confidence > 0.7 ? '#4caf50' : searchResult.confidence > 0.4 ? '#ff9800' : '#f44336' }
            )}>
              {formatConfidence(searchResult.confidence)}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{searchResult.productName || 'Unknown Product'}</Text>
          {searchResult.brand && (
            <Text style={styles.productBrand}>by {searchResult.brand}</Text>
          )}
          {searchResult.category && (
            <Text style={styles.productCategory}>{searchResult.category}</Text>
          )}
        </View>

        {searchResult.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{searchResult.description}</Text>
          </View>
        )}

        {searchResult.specifications && Object.keys(searchResult.specifications).length > 0 && (
          <View style={styles.specificationsSection}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsList}>
              {Object.entries(searchResult.specifications).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {searchResult.sources && searchResult.sources.length > 0 && (
          <View style={styles.sourcesSection}>
            <Text style={styles.sectionTitle}>Sources</Text>
            <View style={styles.sourcesList}>
              {searchResult.sources.map((source, index) => (
                <Text key={index} style={styles.sourceItem}>• {source}</Text>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Import Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Add to Product Catalog</Text>
        <Text style={styles.actionsDescription}>
          Import this product information into your PIM system for management and tracking.
        </Text>

        <View style={styles.actionButtons}>
          <Button
            onPress={handleImportToPIM}
            style={styles.importButton}
            disabled={importing || searchResult.confidence < 0.3}
          >
            {importing ? 'Adding to PIM...' : '+ Import to PIM'}
          </Button>

          {searchResult.confidence < 0.3 && (
            <Text style={styles.lowConfidenceWarning}>
              ⚠️ Low confidence result - review before importing
            </Text>
          )}
        </View>

        <View style={styles.secondaryActions}>
          <Button onPress={retrySearch} style={styles.actionButton} variant="outline">
            🔄 Search Again
          </Button>
          <Button onPress={navigateToScanner} style={styles.actionButton} variant="secondary">
            📱 Scan Another
          </Button>
        </View>
      </Card>

      {/* Manual Entry Option */}
      <Card style={styles.manualCard}>
        <Text style={styles.manualTitle}>Manual Entry</Text>
        <Text style={styles.manualDescription}>
          Can't find the right product? You can manually create a product entry in the PIM system.
        </Text>
        <Button onPress={() => navigateToPIM()} style={styles.manualButton} variant="outline">
          Create Manual Entry
        </Button>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  confidenceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  confidenceLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 5,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lowConfidenceWarning: {
    color: '#ff9800',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButton: {
    flex: 1,
  },
  actionButtons: {
    marginBottom: 15,
  },
  actionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  actionsDescription: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionsTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  errorCard: {
    padding: 20,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#f44336',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  importButton: {
    marginBottom: 10,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 30,
  },
  loadingSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  manualButton: {
    alignSelf: 'flex-start',
  },
  manualCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  manualDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  manualTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noResultCard: {
    alignItems: 'center',
    padding: 30,
  },
  noResultText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  noResultTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productBrand: {
    color: '#666',
    fontSize: 18,
    marginBottom: 5,
  },
  productCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productInfo: {
    marginBottom: 20,
  },
  productName: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultCard: {
    marginBottom: 20,
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sourceItem: {
    color: '#666',
    fontSize: 14,
  },
  sourcesList: {
    gap: 4,
  },
  sourcesSection: {
    marginBottom: 10,
  },
  specificationsSection: {
    marginBottom: 20,
  },
  specItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  specKey: {
    minWidth: 120,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  specsList: {
    gap: 8,
  },
  specValue: {
    color: '#333',
    flex: 1,
    fontSize: 14,
  },
  successActions: {
    gap: 10,
  },
  successCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
  },
  successText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  successTitle: {
    color: '#4caf50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
})
