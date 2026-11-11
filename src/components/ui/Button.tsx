import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';
import { T } from './Typography';

export type BtnProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'pink' | 'danger' | 'ghost';
  icon?: any;
  small?: boolean;
  style?: ViewStyle;
  flex?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export function Btn({ label, onPress, variant = 'primary', icon, small, style, flex, loading, disabled }: BtnProps) {
  const isPrimary = variant === 'primary' || variant === 'dark';
  const isSecondary = variant === 'secondary';
  const isPink = variant === 'pink';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const fg = isPrimary ? C.onCta : isSecondary ? C.primary : isOutline ? C.text : isPink ? C.white : isDanger ? C.red : C.text;
  const border = isOutline ? C.border2 : isDanger ? C.red : 'transparent';
  const bg = isPrimary ? C.cta : isSecondary ? C.primaryLight : isPink ? C.pink : isOutline ? C.surface : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? isPrimary
              ? C.ctaPressed
              : isSecondary || isOutline
                ? C.surfacePressed
                : bg
            : bg,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          minHeight: small ? 36 : 48,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 12 : 16,
          borderWidth: isOutline || isDanger ? 1 : 0,
          borderColor: border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: loading || disabled ? 0.65 : 1,
        },
        flex ? { flex: 1 } : null,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 14 : 16} color={fg} /> : null}
      <T size={small ? 12 : 13.5} w="semi" color={fg}>
        {label}
      </T>
    </Pressable>
  );
}
