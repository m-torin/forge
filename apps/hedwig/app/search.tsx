import { View } from 'react-native';

import { SearchPage } from '../src/features/search/pages/SearchPage';

export default function SearchScreen() {
  return (
    <View style={{ flex: 1 }}>
      <SearchPage />
    </View>
  );
}