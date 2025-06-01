import { View } from 'react-native';

import { MonitoringPage } from '../src/features/monitoring/pages/MonitoringPage';

export default function MonitoringScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MonitoringPage />
    </View>
  );
}