import { View } from 'react-native';

import { DashboardPage } from '../src/features/dashboard/pages/DashboardPage';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DashboardPage />
    </View>
  );
}