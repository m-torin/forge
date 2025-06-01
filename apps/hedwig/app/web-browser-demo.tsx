import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LinkingService } from '../src/services/linkingService';
import { WebBrowserService } from '../src/services/webBrowserService';

export default function WebBrowserDemoScreen() {
  const [lastResult, setLastResult] = useState<string>('');

  const handleOpenURL = async (url: string, type: string) => {
    try {
      setLastResult(`Opening ${type}...`);
      
      let result;
      switch (type) {
        case 'Product Info':
          result = await WebBrowserService.openProductInfo(url);
          break;
        case 'Support':
          result = await WebBrowserService.openSupport(url);
          break;
        case 'Legal':
          result = await WebBrowserService.openLegal(url);
          break;
        case 'External Site':
          result = await WebBrowserService.openExternalSite(url, type);
          break;
        default:
          result = await WebBrowserService.openBrowser(url);
      }
      
      setLastResult(`${type} result: ${result.type}`);
    } catch (error) {
      setLastResult(`Error: ${error}`);
    }
  };

  const demoItems = [
    {
      type: 'Product Info',
      url: 'https://www.apple.com/iphone',
      description: 'Opens with reader mode enabled',
      title: 'Product Information',
    },
    {
      type: 'Support',
      url: 'https://docs.expo.dev',
      description: 'Opens with sharing enabled',
      title: 'Support Documentation',
    },
    {
      type: 'Legal',
      url: 'https://expo.dev/privacy',
      description: 'Opens in reader mode, no sharing',
      title: 'Privacy Policy',
    },
    {
      type: 'External Site',
      url: 'https://github.com/expo/expo',
      description: 'Opens with URL visible',
      title: 'External Website',
    },
    {
      type: 'Product Info',
      url: 'https://www.barcodelookup.com/012345678912',
      description: 'Barcode product lookup demo',
      title: 'Barcode Lookup',
    },
  ];

  const handleLinkingService = async (action: string) => {
    try {
      setLastResult(`Executing ${action}...`);
      
      switch (action) {
        case 'Website':
          await LinkingService.openWebsite();
          break;
        case 'App Store':
          await LinkingService.openAppStore();
          break;
        case 'Barcode Info':
          await LinkingService.openBarcodeInfo('012345678912');
          break;
        case 'Help':
          await LinkingService.openHelpDocumentation();
          break;
        case 'Privacy':
          await LinkingService.openPrivacyPolicy();
          break;
        case 'Terms':
          await LinkingService.openTermsOfService();
          break;
      }
      
      setLastResult(`${action} opened successfully`);
    } catch (error) {
      setLastResult(`Error: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebBrowser Demo</Text>
        <Text style={styles.subtitle}>Test in-app browser functionality</Text>
      </View>

      {lastResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Result:</Text>
          <Text style={styles.resultText}>{lastResult}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WebBrowser Service</Text>
        {demoItems.map((item, index) => (
          <View key={index} style={styles.demoItem}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemUrl}>{item.url}</Text>
            <Text
              onPress={() => handleOpenURL(item.url, item.type)}
              style={styles.button}
            >
              Open in Browser
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linking Service Integration</Text>
        {[
          { action: 'Website', title: 'Hedwig Website' },
          { action: 'App Store', title: 'App Store Page' },
          { action: 'Barcode Info', title: 'Barcode Lookup' },
          { action: 'Help', title: 'Help Documentation' },
          { action: 'Privacy', title: 'Privacy Policy' },
          { action: 'Terms', title: 'Terms of Service' },
        ].map((item, index) => (
          <View key={index} style={styles.linkingItem}>
            <Text style={styles.linkingTitle}>{item.title}</Text>
            <Text
              onPress={() => handleLinkingService(item.action)}
              style={styles.linkingButton}
            >
              Open
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browser Controls</Text>
        <Text
          onPress={async () => {
            await WebBrowserService.dismiss();
            setLastResult('Browser dismissed');
          }}
          style={styles.controlButton}
        >
          Dismiss Browser
        </Text>
        <Text
          onPress={async () => {
            await WebBrowserService.warmUp();
            setLastResult('Browser warmed up');
          }}
          style={styles.controlButton}
        >
          Warm Up Browser
        </Text>
        <Text
          onPress={async () => {
            await WebBrowserService.coolDown();
            setLastResult('Browser cooled down');
          }}
          style={styles.controlButton}
        >
          Cool Down Browser
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          📱 In-app browser provides a seamless experience while keeping users in the app
        </Text>
        <Text style={styles.infoText}>
          🔒 Secure browsing with app-controlled settings and theming
        </Text>
        <Text style={styles.infoText}>
          🎨 Customizable appearance and controls for different content types
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 6,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 15,
    paddingVertical: 8,
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  controlButton: {
    backgroundColor: '#ff9800',
    borderRadius: 6,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    textAlign: 'center',
  },
  demoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  header: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 20,
  },
  info: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
    padding: 15,
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    marginBottom: 8,
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  itemTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemUrl: {
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },
  linkingButton: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkingItem: {
    borderBottomWidth: 1,
    alignItems: 'center',
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkingTitle: {
    color: '#333',
    flex: 1,
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    margin: 10,
    padding: 15,
  },
  resultText: {
    color: '#1976d2',
    fontSize: 14,
  },
  resultTitle: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
    padding: 15,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});