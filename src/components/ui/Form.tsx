import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, shadowMd, TYPO } from '../../theme';
import { T } from './Typography';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  multiline,
  keyboardType,
  secure,
  maxLength,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  prefix?: string;
  multiline?: boolean;
  keyboardType?: any;
  secure?: boolean;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 5 }}>
      {label ? (
        <T size={13} w="semi" color={C.textSecondary}>
          {label}
        </T>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          borderWidth: 1.2,
          borderColor: focused ? C.primary : C.border,
          borderRadius: 9,
          backgroundColor: C.surface,
          paddingHorizontal: 12,
          minHeight: multiline ? undefined : 48,
        }}
      >
        {prefix ? (
          <T size={13} color={C.muted} style={{ marginRight: 6 }}>
            {prefix}
          </T>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted3}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          maxLength={maxLength}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxFontSizeMultiplier={1.16}
          style={{
            flex: 1,
            fontFamily: F.med,
            fontSize: TYPO.body,
            color: C.text,
            backgroundColor: 'transparent',
            paddingVertical: multiline ? 10 : 10.5,
            minHeight: multiline ? 86 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>
    </View>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  flex,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  flex?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: 5, flex: flex ? 1 : undefined }}>
      {label ? (
        <T size={12} w="semi" color={C.textSecondary}>
          {label}
        </T>
      ) : null}
      <Pressable
        onPress={() => setOpen((o) => !o)}
        android_ripple={{ color: C.ripple, borderless: false }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: open ? C.primary : C.border,
          borderRadius: 12,
          backgroundColor: C.surface,
          paddingHorizontal: 12,
          minHeight: 48,
          paddingVertical: 11,
        }}
      >
        <T size={TYPO.body} w="med" numberOfLines={1} style={{ flex: 1 }} color={C.text}>
          {value}
        </T>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={C.muted} />
      </Pressable>
      {open ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 12,
            backgroundColor: C.surface,
            overflow: 'hidden',
            marginTop: 2,
            ...shadowMd,
          }}
        >
          {options.map((o) => (
            <Pressable
              key={o}
              onPress={() => {
                onChange(o);
                setOpen(false);
              }}
              android_ripple={{ color: C.ripple, borderless: false }}
              style={{
                paddingVertical: 9,
                paddingHorizontal: 12,
                backgroundColor: o === value ? C.primaryLight : C.surface,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <T size={13} w={o === value ? 'semi' : 'med'} color={o === value ? C.primary : C.text}>
                {o}
              </T>
              {o === value ? <Ionicons name="checkmark" size={15} color={C.primary} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
