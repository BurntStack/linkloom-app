import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { C, shadow, TYPO } from '../../theme';
import { T } from './Typography';

export function Card({
  children,
  style,
  onPress,
  highlight,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  highlight?: boolean;
}) {
  const base: ViewStyle = {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: highlight ? C.primary : C.border,
    padding: 16,
    ...shadow,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: C.ripple, borderless: false }}
        style={({ pressed }) => [
          base,
          style,
          pressed ? { opacity: 0.92, transform: [{ scale: 0.985 }] } : null,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 2 }}>
      <T size={TYPO.h1} w="bold" track={-0.5} color={C.text}>
        {title}
      </T>
      {sub ? (
        <T size={TYPO.sub} color={C.muted} style={{ lineHeight: 21 }}>
          {sub}
        </T>
      ) : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}
