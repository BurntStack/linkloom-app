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
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.16}
      style={[
        {
          fontFamily: F[w],
          fontSize: size,
          color,
          letterSpacing: track !== undefined ? track : -0.2,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
