import React from 'react';
import { View, ScrollView } from 'react-native';

import { C } from '../../theme';
import { useApp } from '../../store';
import { TopBar } from '../../components/ui';

export function Screen({ navigation, children, account = false }: any) {
  const { openSheet } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        onBell={() => openSheet('notifications')}
        onMessages={() => openSheet('messages')}
        onAccount={() =>
          account
            ? navigation.navigate('Main', { screen: 'Dashboard' })
            : navigation.navigate('AccountSettings')
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, gap: 20, paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export const Grid = ({ children }: any) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{children}</View>
);
