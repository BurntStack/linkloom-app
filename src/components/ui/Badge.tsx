import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadowSm } from '../../theme';
import { T } from './Typography';

export function Pill({
  label,
  bg,
  fg,
  dot,
  icon,
}: {
  label: string;
  bg: string;
  fg: string;
  dot?: boolean;
  icon?: any;
}) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: bg,
        borderRadius: 99,
        paddingVertical: 3.5,
        paddingHorizontal: 8,
        borderWidth: 0.8,
        borderColor: C.subtleBorder,
      }}
    >
      {dot ? (
        <View style={{ width: 5.5, height: 5.5, borderRadius: 3, backgroundColor: fg }} />
      ) : null}
      {icon ? <Ionicons name={icon} size={11} color={fg} /> : null}
      <T size={10.5} w="semi" color={fg}>
        {label}
      </T>
    </View>
  );
}

export const statusPill = (s: string) => {
  const map: Record<string, [string, string]> = {
    'Open for bids': [C.greenBg, C.green],
    'In progress': [C.amberBg, C.amber],
    Completed: [C.surfaceSoft, C.muted2],
    Approved: [C.greenBg, C.green],
    Live: [C.primaryLight, C.primary],
    'Needs review': [C.amberBg, C.amber],
    'Revision asked': [C.redBg, C.red],
    'Top creator': [C.primaryLight, C.primary],
    'Responds fast': [C.greenBg, C.green],
  };
  const [bg, fg] = map[s] || [C.surfaceSoft, C.muted2];
  return <Pill label={s} bg={bg} fg={fg} dot />;
};

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: active ? C.primary : C.border,
        backgroundColor: active ? (pressed ? C.primaryPressed : C.primary) : pressed ? C.surfacePressed : C.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...shadowSm,
      })}
    >
      {icon ? <Ionicons name={icon} size={13} color={active ? C.onPrimary : C.muted2} /> : null}
      <T size={12.5} w="semi" color={active ? C.onPrimary : C.text}>
        {label}
      </T>
    </Pressable>
  );
}
