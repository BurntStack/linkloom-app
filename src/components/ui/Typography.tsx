import React from 'react';
import { Text, TextProps } from 'react-native';
import { C, F, TYPO } from '../../theme';

export type TextCustomProps = TextProps & {
  size?: number;
  w?: 'reg' | 'med' | 'semi' | 'bold' | 'xbold';
  color?: string;
  track?: number;
};

export function T({ size = TYPO.body, w = 'reg', color = C.text, track, style, children, ...rest }: TextCustomProps) {
  const defaultTrack = size >= 24 ? -0.5 : size >= 18 ? -0.2 : 0;
  const letterSpacing = track !== undefined ? track : defaultTrack;

  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.16}
      style={[
        {
          fontFamily: F[w] || F.reg,
          fontSize: size,
          color,
          letterSpacing,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
