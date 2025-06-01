import React from 'react';
import { ExpoRoot } from 'expo-router';

// Must be exported or Fast Refresh won't update the context
export default function App() {
  try {
    const ctx = require.context('./app');
    return <ExpoRoot context={ctx} />;
  } catch (error) {
    console.error('Failed to load app context:', error);
    // Fallback to a simple component
    const { Text, View } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>App Loading Error: {error.message}</Text>
      </View>
    );
  }
}
