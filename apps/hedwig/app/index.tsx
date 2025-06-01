import { type Href, Link } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  const navigationItems = [
    { href: '/scanner', icon: '📱', title: 'Barcode Scanner' },
    { href: '/history', icon: '📋', title: 'Scan History' },
    { href: '/dashboard', icon: '📊', title: 'Dashboard' },
    { href: '/search', icon: '🔍', title: 'AI Search' },
    { href: '/pim', icon: '📦', title: 'Product Info' },
    { href: '/cms', icon: '📝', title: 'Content Management' },
    { href: '/monitoring', icon: '🔧', title: 'System Monitoring' },
    { href: '/demo', icon: '🎨', title: 'Demo Features' },
    { href: '/web-browser-demo', icon: '🌐', title: 'WebBrowser Demo' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hedwig Mobile App</Text>
        <Text style={styles.subtitle}>Expo + React Native</Text>

        <View style={styles.platformInfo}>
          <Text style={styles.platformText}>Platform: {Platform.OS}</Text>
          <Text style={styles.platformText}>Version: {Platform.Version}</Text>
        </View>

        <View style={styles.counterSection}>
          <Text style={styles.counterText}>Counter: {count}</Text>
          <View style={styles.buttonContainer}>
            <Text onPress={() => setCount(count + 1)} style={styles.button}>
              +
            </Text>
            <Text onPress={() => setCount(count - 1)} style={styles.button}>
              -
            </Text>
            <Text onPress={() => setCount(0)} style={styles.button}>
              Reset
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.navigationSection}>
        <Text style={styles.navigationTitle}>Navigation</Text>
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href as Href} style={styles.navigationItem}>
            <View style={styles.navigationItemContent}>
              <Text style={styles.navigationIcon}>{item.icon}</Text>
              <Text style={styles.navigationText}>{item.title}</Text>
              <Text style={styles.navigationArrow}>→</Text>
            </View>
          </Link>
        ))}
      </View>

      <View style={styles.featureList}>
        <Text style={styles.featureTitle}>Mobile Features:</Text>
        <Text style={styles.featureItem}>✅ Expo SDK 53</Text>
        <Text style={styles.featureItem}>✅ React Native</Text>
        <Text style={styles.featureItem}>✅ Expo Router</Text>
        <Text style={styles.featureItem}>✅ Native Performance</Text>
        <Text style={styles.featureItem}>✅ Cross-Platform</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 60,
    backgroundColor: '#2196f3',
    borderRadius: 6,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  counterSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  counterText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  featureItem: {
    color: '#555',
    fontSize: 14,
    marginBottom: 5,
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  navigationArrow: {
    color: '#666',
    fontSize: 18,
  },
  navigationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  navigationItem: {
    marginBottom: 12,
  },
  navigationItemContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationSection: {
    padding: 20,
  },
  navigationText: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  navigationTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  platformInfo: {
    minWidth: 250,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 30,
    padding: 15,
  },
  platformText: {
    color: '#1976d2',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});