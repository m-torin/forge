

import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@repo/design-system/gluestack';

import { ScanHistoryService } from '../services/scanHistoryService';
import { type HistoryItem } from '../types/scanner';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      filterHistory(searchQuery);
    } else {
      setFilteredHistory(history);
    }
  }, [history, searchQuery]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await ScanHistoryService.getHistoryWithFormatting();
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = async (query: string) => {
    try {
      const results = await ScanHistoryService.searchHistory(query);
      setFilteredHistory(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    Alert.alert('Delete Scan', 'Are you sure you want to delete this scan?', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          try {
            await ScanHistoryService.deleteScan(scanId);
            await loadHistory();
            Alert.alert('Success', 'Scan deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete scan');
          }
        },
        style: 'destructive',
        text: 'Delete',
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history? This action cannot be undone.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: async () => {
            try {
              await ScanHistoryService.clearHistory();
              await loadHistory();
              Alert.alert('Success', 'History cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
          style: 'destructive',
          text: 'Clear All',
        },
      ],
    );
  };

  const handleSearch = () => {
    const query = prompt('Enter search term:', searchQuery);
    if (query !== null) {
      setSearchQuery(query);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => Alert.alert('Success', 'Copied to clipboard'))
        .catch(() => Alert.alert('Error', 'Failed to copy'));
    } else {
      Alert.alert('Info', 'Copy to clipboard not supported');
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemType}>{ScanHistoryService.formatBarcodeType(item.type)}</Text>
        <Text style={styles.itemDate}>{item.formattedDate}</Text>
      </View>

      <Text style={styles.itemData} numberOfLines={3}>
        {item.data}
      </Text>

      {item.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Note:</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}

      <View style={styles.itemActions}>
        <Button
          onPress={() => copyToClipboard(item.data)}
          style={styles.actionButton}
          size="small"
          variant="outline"
        >
          Copy
        </Button>
        <Button
          onPress={() => handleDeleteScan(item.id)}
          style={styles.actionButton}
          size="small"
          variant="secondary"
        >
          Delete
        </Button>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No scan history found</Text>
        <Text style={styles.emptySubtext}>Start scanning barcodes to build your history</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.searchContainer}>
          <Button onPress={handleSearch} style={styles.searchButton} size="small" variant="outline">
            {searchQuery ? `Search: "${searchQuery}"` : 'Search History'}
          </Button>
          {searchQuery && (
            <Button
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
              size="small"
            >
              Clear
            </Button>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Button onPress={loadHistory} style={styles.actionButton} size="small" variant="outline">
            Refresh
          </Button>
          <Button
            onPress={handleClearHistory}
            style={styles.actionButton}
            size="small"
            variant="secondary"
          >
            Clear All
          </Button>
        </View>
      </View>

      {/* Results info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {searchQuery
            ? `${filteredHistory.length} results found`
            : `${history.length} total scans`}
        </Text>
      </View>

      {/* History list */}
      <FlatList
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        data={filteredHistory}
        renderItem={renderHistoryItem}
      />
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
  actionsContainer: {
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    padding: 15,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  clearSearchButton: {
    minWidth: 60,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  historyItem: {
    marginBottom: 15,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  itemData: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  itemDate: {
    color: '#999',
    fontSize: 12,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemType: {
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 10,
    padding: 8,
  },
  noteLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteText: {
    color: '#333',
    fontSize: 12,
  },
  resultsInfo: {
    borderBottomWidth: 1,
    backgroundColor: '#f8f9fa',
    borderBottomColor: '#e0e0e0',
    padding: 10,
  },
  resultsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  searchButton: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
});
