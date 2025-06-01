import { View } from 'react-native';

import { CMSPage } from '../src/features/cms/pages/CMSPage';

export default function CMSScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CMSPage />
    </View>
  );
}