import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadowMd } from '../../theme';
import { useApp } from '../../store';
import { T } from './Typography';

export function ToastHost() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();

  if (!toast) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: insets.bottom + 84,
        alignItems: 'center',
        zIndex: 100,
        elevation: 12,
      }}
    >
      <View
        style={{
          backgroundColor: C.dark,
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          ...shadowMd,
        }}
      >
        <Ionicons name="checkmark-circle" size={17} color={C.logoGreen} />
        <T size={12.5} w="med" color={C.onDark} style={{ flexShrink: 1 }}>
          {toast}
        </T>
      </View>
    </View>
  );
}
