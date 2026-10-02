import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Імпортуємо тільки основні екрани
import CalendarScreen from './src/screens/CalendarScreen';
import NotesScreen from './src/screens/NotesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#a1a1aa',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Planner: 'calendar-outline',
            Notes: 'document-text-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Planner" component={CalendarScreen} />
      <Tabs.Screen name="Notes" component={NotesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}