import React from 'react';
import { Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';
import { useApp } from '../../store';
import { Card, Row } from './Layout';
import { T } from './Typography';

export function AppearanceToggle() {
  const { colorScheme, toggleColorScheme } = useApp();
  const darkMode = colorScheme === 'dark';

  return (
    <Card style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ alignItems: 'center', gap: 12 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={darkMode ? 'moon-outline' : 'sunny-outline'} size={17} color={C.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} w="bold" color={C.text}>{darkMode ? 'Dark mode' : 'Light mode'}</T>
          <T size={11} color={C.muted}>Switch app appearance</T>
        </View>
        <Switch
          value={darkMode}
          onValueChange={toggleColorScheme}
          trackColor={{ false: C.border, true: C.primary }}
          thumbColor={C.surface}
          accessibilityLabel="Toggle dark mode"
        />
      </Row>
    </Card>
  );
}
