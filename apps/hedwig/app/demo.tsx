import { View } from 'react-native';

import { DemoPage } from '../src/features/demo/pages/DemoPage';

export default function DemoScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DemoPage />
    </View>
  );
}