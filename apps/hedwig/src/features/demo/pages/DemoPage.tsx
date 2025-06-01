

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@repo/design-system/gluestack';

export function DemoPage() {
  const [count, setCount] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchApiData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error('Failed to fetch API data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  return (
    <Card style={styles.clientCard}>
      <Text style={styles.cardTitle}>Client Component Demo</Text>

      <View style={styles.counterSection}>
        <Text style={styles.counterText}>Count: {count}</Text>
        <View style={styles.buttonRow}>
          <Button onPress={() => setCount((c) => c + 1)} size="small">
            +1
          </Button>
          <Button onPress={() => setCount((c) => c - 1)} size="small" variant="secondary">
            -1
          </Button>
          <Button onPress={() => setCount(0)} size="small" variant="outline">
            Reset
          </Button>
        </View>
      </View>

      <View style={styles.apiSection}>
        <Text style={styles.sectionTitle}>API Response:</Text>
        <Button onPress={fetchApiData} style={styles.refreshButton} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh API Data'}
        </Button>

        {apiData && (
          <View style={styles.apiData}>
            <Text style={styles.apiText}>Status: {apiData.status}</Text>
            <Text style={styles.apiText}>Version: {apiData.version}</Text>
            <Text style={styles.apiText}>Platform: {apiData.platform}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  apiData: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    padding: 10,
  },
  apiSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  apiText: {
    color: '#555',
    fontSize: 14,
    marginBottom: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  clientCard: {
    backgroundColor: '#e3f2fd',
  },
  counterSection: {
    marginBottom: 20,
  },
  counterText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  refreshButton: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
});
