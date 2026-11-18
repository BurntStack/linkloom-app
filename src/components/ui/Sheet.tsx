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
      <T size={20} w="bold" track={-0.4} color={C.text}>
        {title}
      </T>
      {sub ? (
        <T size={13} color={C.muted2} style={{ lineHeight: 18 }}>
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
            borderTopLeftRadius: fullScreen ? 0 : 28,
            borderTopRightRadius: fullScreen ? 0 : 28,
            maxHeight: fullScreen ? height : height * 0.9,
            flex: fullScreen ? 1 : undefined,
            paddingTop: fullScreen ? insets.top : 0,
            paddingBottom: fullScreen ? insets.bottom : insets.bottom + 8,
            ...shadowLg,
          }}
        >
          {/* Material 3 Drag handle */}
          {!fullScreen ? (
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border2 }} />
            </View>
          ) : null}

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, gap: 16 }}>
            {title ? (
              <View style={headerRight
                ? { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 2 }
                : { gap: 4, paddingBottom: 2 }}
              >
                {headerRight ? <View style={{ flex: 1, gap: 4 }}>{titleContent}</View> : titleContent}
                {headerRight}
              </View>
            ) : null}
            {children}
          </ScrollView>

          {footer ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, borderTopWidth: 1, borderTopColor: C.borderSubtle }}>
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
