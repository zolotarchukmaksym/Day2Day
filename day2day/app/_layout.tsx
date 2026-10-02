import { useEffect } from 'react';
import { Stack, Redirect, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Fredoka-SemiBold': require('../assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('../assets/fonts/Fredoka-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  const init = useAuthStore((s) => s.init);
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  const inAuthGroup = segments[0] === '(auth)';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {!fontsLoaded || isLoading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bg,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !session && !inAuthGroup ? (
          <Redirect href="/(auth)/login" />
        ) : session && inAuthGroup ? (
          <Redirect href="/(tabs)" />
        ) : null}
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}