import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { FirebaseServices } from './src/services/firebase';
import { SentryService } from './src/services/sentryService';

// Import original App
import OriginalApp from './App';

export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    initializeServices();

    // Cleanup on unmount
    return () => {
      FirebaseServices.cleanup();
    };
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize Sentry first
      SentryService.initialize();

      // Initialize Firebase services
      await FirebaseServices.initialize();

      setIsFirebaseReady(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setError(error.message);
      SentryService.captureException(error);
    }
  };

  // Show loading screen while initializing
  if (!isFirebaseReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Initializing Hedwig...</Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>
    );
  }

  // Render the original app
  return <OriginalApp />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});