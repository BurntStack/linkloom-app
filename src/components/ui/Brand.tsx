import React from 'react';
import { View } from 'react-native';
import { C, BRAND } from '../../theme';
import { T } from './Typography';

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <View
      style={{
        width: size * 1.24,
        height: size,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: size * 0.02,
          top: size * 0.14,
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: size * 0.36,
          borderWidth: Math.max(2, size * 0.09),
          borderColor: C.creatorAccent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.48,
          top: size * 0.14,
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: size * 0.36,
          borderWidth: Math.max(2, size * 0.09),
          borderColor: C.brandAccent,
        }}
      />
    </View>
  );
}

export function Logo({ size = 16 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <LogoMark size={size + 8} />
      <T size={size} w="semi" track={-0.5} color={C.text}>
        {BRAND.toLowerCase()}
      </T>
    </View>
  );
}
