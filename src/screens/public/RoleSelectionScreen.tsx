import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { Btn, Logo, Row, T } from '../../components/ui';

export function RoleSelection({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'signup'>(route.params?.mode === 'login' ? 'login' : 'signup');
  const [selectedRole, setSelectedRole] = useState<'creator' | 'brand'>('creator');
  const continueToAuth = () => navigation.navigate('Auth', { mode, role: selectedRole });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 14) }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 48,
          backgroundColor: C.surface,
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

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 18 }}>
        <View style={{ gap: 6 }}>
          <T size={26} w="semi" track={-0.7} color={C.text}>How will you use</T>
          <T size={26} w="semi" track={-0.7} color={C.text}>Linkloom?</T>
          <T size={12} color={C.muted} style={{ marginTop: 2 }}>Pick one. Each email and mobile number has one account.</T>
        </View>

        <View style={{ gap: 10 }}>
          {([
            {
              key: 'creator' as const,
              title: "I'm a creator",
              description: 'Bid on brand briefs, do the work and get paid from escrow.',
              color: C.creatorAccent,
              tint: C.accentSoft,
              icon: 'sparkles',
              features: ['Find jobs', 'My bids', 'Get paid'],
            },
            {
              key: 'brand' as const,
              title: "I'm a brand",
              description: 'Post briefs or invite creators. Pay into escrow only on approval.',
              color: C.brandAccent,
              tint: C.primaryLight,
              icon: 'briefcase-outline',
              features: ['Find creators', 'Post jobs', 'Pay safely'],
            },
          ]).map((role) => {
            const selected = selectedRole === role.key;
            return (
              <Pressable
                key={role.key}
                onPress={() => setSelectedRole(role.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={({ pressed }) => ({
                  backgroundColor: C.surface,
                  borderRadius: 13,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? C.text : C.border,
                  padding: 13,
                  gap: 9,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
              >
                <Row style={{ alignItems: 'flex-start', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: role.color, alignItems: 'center', justifyContent: 'center', backgroundColor: role.tint }}>
                    <Ionicons name={role.icon as any} size={16} color={role.color} />
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <T size={15} w="semi" color={C.text}>{role.title}</T>
                    <T size={11.5} color={C.muted} style={{ lineHeight: 16 }}>{role.description}</T>
                    <Row style={{ gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                      {role.features.map((feature) => (
                        <View key={feature} style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1, borderColor: C.border }}>
                          <T size={9} w="med" color={C.textSecondary}>{feature}</T>
                        </View>
                      ))}
                    </Row>
                  </View>
                  <View style={{ width: 17, height: 17, borderRadius: 9, borderWidth: selected ? 5 : 1.5, borderColor: selected ? role.color : C.border2, marginTop: 2 }} />
                </Row>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Btn label={`Continue as ${selectedRole}`} onPress={continueToAuth} style={{ minHeight: 46, borderRadius: 12 }} />
        <Pressable
          onPress={() => {
            const nextMode = mode === 'signup' ? 'login' : 'signup';
            setMode(nextMode);
            navigation.setParams({ mode: nextMode });
          }}
          style={{ alignSelf: 'center', paddingVertical: 4 }}
        >
          <T size={11} color={C.muted}>
            {mode === 'signup' ? 'Have an account? ' : 'New to Linkloom? '}
            <T size={11} w="bold" color={C.text}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</T>
          </T>
        </Pressable>
      </View>
    </View>
  );
}
