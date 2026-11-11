import React from 'react';
import { View, ScrollView } from 'react-native';
import { C } from '../../theme';
import { StackHeader } from '../../components/ui';

export function Page({ title, navigation, right, children }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StackHeader title={title} onBack={() => navigation.goBack()} right={right} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 14, paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
