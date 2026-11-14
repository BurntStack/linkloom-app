import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { AppProvider, navRef, useApp } from './src/store';
import { RootStack } from './src/navigation';
import { SheetHost } from './src/screens/Sheets';
import { ToastHost } from './src/components/ui';
import { C } from './src/theme';

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigation />
        <SheetHost />
        <ToastHost />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { restoreSession, colorScheme } = useApp();
  return (
    <NavigationContainer
      ref={navRef}
      onReady={() => { void restoreSession(); }}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: C.bg,
          card: C.surface,
          text: C.text,
          border: C.border,
          primary: C.primary,
        },
      }}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RootStack />
    </NavigationContainer>
  );
}
