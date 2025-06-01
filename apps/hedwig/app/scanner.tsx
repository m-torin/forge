import { StyleSheet, View } from 'react-native';

import NativeScanner from '../src/features/scanner/components/NativeScanner';

export default function ScannerScreen() {
  const handleScan = (result: { type: string; data: string }) => {
    console.log('Scan result:', result);
  };

  const handleError = (error: string) => {
    console.error('Scanner error:', error);
  };

  return (
    <View style={styles.container}>
      <NativeScanner onError={handleError} onScan={handleScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});