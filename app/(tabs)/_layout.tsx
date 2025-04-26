import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import TabBarBackground from '@/src/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// TabLayout: Main tab navigator for the app
// Enhanced for accessibility, maintainability, and modern UI/UX

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        // Improved tab bar style for a modern look
        tabBarStyle: [
          {
            borderTopWidth: 0.5,
            borderTopColor: '#e0e0e0',
            backgroundColor: 'rgba(255,255,255,0.85)',
            ...Platform.select({
              ios: {
                position: 'absolute',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: -4 },
                backdropFilter: 'blur(18px)', // iOS blur
              },
              android: {
                elevation: 10,
              },
            }),
          },
        ],
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarAccessibilityLabel: 'Home Tab',
        }}
      />

      {/* Explore Tab with badge example */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          tabBarAccessibilityLabel: 'Explore Tab',
          // Uncomment to show a badge:
          // tabBarBadge: 3,
        }}
      />
    </Tabs>
  );
}

