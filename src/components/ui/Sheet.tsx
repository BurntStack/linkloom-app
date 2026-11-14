import React from 'react';
import {
  View, Pressable, Modal, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadowMd, shadowLg } from '../../theme';
import { useApp } from '../../store';
import { T } from './Typography';

export function Sheet({
  visible,
  onClose,
  title,
  sub,
  headerRight,
  children,
  footer,
  fullScreen = false,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fullScreen?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { toast } = useApp();
  const { height } = useWindowDimensions();
  const titleContent = title ? (
    <>
      <T size={18} w="bold" track={-0.3} color={C.text}>
        {title}
      </T>
      {sub ? (
        <T size={12.5} color={C.muted} style={{ lineHeight: 17 }}>
          {sub}
        </T>
      ) : null}
    </>
  ) : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: fullScreen ? 'flex-start' : 'flex-end' }}
      >
        {!fullScreen ? (
          <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
            <View style={{ flex: 1, backgroundColor: C.overlay }} />
          </Pressable>
        ) : null}
        <View
          style={{
            backgroundColor: C.surface,
            borderTopLeftRadius: fullScreen ? 0 : 26,
            borderTopRightRadius: fullScreen ? 0 : 26,
            maxHeight: fullScreen ? height : height * 0.9,
            flex: fullScreen ? 1 : undefined,
            paddingTop: fullScreen ? insets.top : 0,
            paddingBottom: fullScreen ? insets.bottom : insets.bottom + 10,
            ...shadowLg,
          }}
        >
          {/* Material 3 Drag handle */}
          {!fullScreen ? (
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border2 }} />
            </View>
          ) : null}

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 14 }}>
            {title ? (
              <View style={headerRight
                ? { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }
                : { gap: 3 }}
              >
                {headerRight ? <View style={{ flex: 1, gap: 3 }}>{titleContent}</View> : titleContent}
                {headerRight}
              </View>
            ) : null}
            {children}
          </ScrollView>

          {footer ? (
            <View style={{ paddingHorizontal: 18, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.borderSubtle }}>
              {footer}
            </View>
          ) : null}
        </View>

        {toast ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: insets.top + 16, left: 16, right: 16, alignItems: 'center' }}
          >
            <View
              style={{
                backgroundColor: C.dark,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                ...shadowMd,
              }}
            >
              <T size={12.5} w="med" color={C.onDark}>
                {toast}
              </T>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}
