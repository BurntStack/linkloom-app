import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadowSm } from '../../theme';
import { useApp } from '../../store';
import { T } from './Typography';
import { Row } from './Layout';
import { Logo } from './Brand';

export function TopBar({ onAccount, onBell, onMessages }: { onAccount: () => void; onBell: () => void; onMessages?: () => void }) {
  const insets = useSafeAreaInsets();
  const { unread, brandName } = useApp();

  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.borderSubtle,
        paddingTop: insets.top,
        ...shadowSm,
      }}
    >
      <View
        style={{
          height: 62,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}
      >
        <Logo size={16} />
        <Row style={{ gap: 8 }}>
          {onMessages ? (
            <Pressable
              onPress={onMessages}
              android_ripple={{ color: C.ripple, borderless: true }}
              accessibilityLabel="Messages"
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={21} color={C.text} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onBell}
            android_ripple={{ color: C.ripple, borderless: true }}
            accessibilityLabel="Notifications"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="notifications-outline" size={18} color={C.text} />
            {unread > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  minWidth: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: C.red,
                  borderWidth: 1.5,
                  borderColor: C.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T size={8.5} w="bold" color={C.onPrimary}>
                  {unread}
                </T>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            onPress={onAccount}
            android_ripple={{ color: C.primaryLight, borderless: true }}
            accessibilityLabel="Account menu"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T size={14} w="bold" color={C.onPrimary}>
              {brandName?.trim()?.[0]?.toUpperCase() || 'B'}
            </T>
          </Pressable>
        </Row>
      </View>
    </View>
  );
}

export function StackHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.borderSubtle,
        paddingTop: insets.top,
        ...shadowSm,
      }}
    >
      <View
        style={{
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          gap: 6,
        }}
      >
        <Pressable
          onPress={onBack}
          hitSlop={10}
          android_ripple={{ color: C.ripple, borderless: true }}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={21} color={C.text} />
        </Pressable>
        <T size={16} w="bold" style={{ flex: 1 }} numberOfLines={1}>
          {title}
        </T>
        {right}
      </View>
    </View>
  );
}
