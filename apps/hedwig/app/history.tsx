import { View } from 'react-native';

import { HistoryPage } from '../src/features/history/pages/HistoryPage';

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HistoryPage />
    </View>
  );
}