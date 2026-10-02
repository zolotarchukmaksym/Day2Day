import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, stickerShadow } from '../../theme/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,

          // === ТЕ, ЩО РОБИТЬ БАР ПІДНЯТИМ (ПЛАВАЮЧИМ) ===
          position: 'absolute',
          bottom: Platform.OS === 'android' ? 30 : insets.bottom + 10, // Піднімаємо вгору
          left: 20, // Відступ зліва
          right: 20, // Відступ справа
          borderRadius: 24, // Сильне закруглення країв
          height: 65, // Фіксована висота для плаваючого бару
          paddingBottom: 8, // Відступ для тексту всередині бару
          // ==============================================

          ...stickerShadow(3),
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10, // Зменшили шрифт, щоб слова "Planner" і "Profile" не обрізалися
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}