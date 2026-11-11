import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';
import { creatorByName } from '../../data';
import { T } from './Typography';

export const paletteFor = (name: string): [string, string] => {
  const palette: [string, string][] = [
    [C.primaryHover, C.primary],
    [C.accent, C.primaryPressed],
    [C.green, C.emerald],
    [C.primary, C.dark],
    [C.accent, C.primary],
    [C.emerald, C.primaryPressed],
    [C.green, C.primary],
    [C.primaryHover, C.emerald],
  ];
  return palette[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
};

export const initials = (n: string) =>
  n
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('');

export function Avatar({
  name,
  size = 36,
  ring,
  photo,
  verified,
}: {
  name: string;
  size?: number;
  ring?: boolean;
  photo?: ImageSourcePropType;
  verified?: boolean;
}) {
  const [a, b] = paletteFor(name);
  const source = photo || creatorByName(name)?.photo;

  return (
    <View style={{ width: size, height: size }}>
      {source ? (
        <Image
          source={source}
          accessibilityLabel={`${name} profile photo`}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ring ? 2 : 0,
            borderColor: C.surface,
          }}
        />
      ) : (
        <LinearGradient
          colors={[a, b]}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: ring ? 2 : 0,
            borderColor: C.surface,
          }}
        >
          <T size={size * 0.36} w="bold" color={C.onPrimary}>
            {initials(name)}
          </T>
        </LinearGradient>
      )}
      {verified ? (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: Math.max(14, size * 0.35),
            height: Math.max(14, size * 0.35),
            borderRadius: 99,
            backgroundColor: C.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark-circle" size={Math.max(12, size * 0.32)} color={C.emerald} />
        </View>
      ) : null}
    </View>
  );
}
