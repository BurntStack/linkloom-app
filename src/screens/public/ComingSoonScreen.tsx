import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, TYPO } from '../../theme';
import { Btn, Logo, T } from '../../components/ui';

export function ComingSoon({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const role = 'Creator';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.surface,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          height: 52,
          borderBottomWidth: 1,
          borderBottomColor: C.borderSubtle,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </Pressable>
        <Logo size={16} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, gap: 12 }}>
        <View
          style={{
            width: 74,
            height: 74,
            borderRadius: 24,
            backgroundColor: C.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="sparkles" size={32} color={C.primary} />
        </View>

        <T size={TYPO.h1} w="bold" track={-0.4} style={{ textAlign: 'center', color: C.text }}>
          {role} Workspace is Coming Soon
        </T>

        <T size={TYPO.sub} color={C.muted} style={{ textAlign: 'center', lineHeight: 19 }}>
          We’re putting finishing touches on direct bid notifications, milestone payouts, and creator portfolio tools.
        </T>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Btn
          label="Back to Role Selection"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ minHeight: 48 }}
        />
      </View>
    </View>
  );
}
