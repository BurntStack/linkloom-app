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
            ? navigation.navigate('Main', { screen: 'Home' })
            : navigation.navigate('AccountSettings')
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, gap: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export const Grid = ({ children }: any) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>{children}</View>
);
