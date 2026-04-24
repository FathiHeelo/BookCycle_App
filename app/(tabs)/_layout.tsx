import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useI18n } from '@/hooks/use-i18n';

// Custom Tab Icon Component
const TabIcon = ({ focused, name, label, themeColors }: any) => {
  if (focused) {
    return (
      <View style={[styles.highlightContainer, { backgroundColor: themeColors.primary }]}>
        <Ionicons name={name} size={22} color="#FFF" />
        <Text style={[styles.highlightText]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Ionicons 
        name={`${name}-outline` as any} 
        size={24} 
        color={themeColors.textSecondary}
      />
      <Text style={[styles.iconText, { color: themeColors.textSecondary, fontWeight: '500' }]}>
        {label}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const { t, isRTL } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 75,
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          shadowColor: theme === 'dark' ? '#000' : '#E5E7EB',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.05,
          shadowRadius: 10,
          paddingHorizontal: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="home" label={isRTL ? 'الرئيسية' : 'Home'} themeColors={themeColors} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="search" label={isRTL ? 'استكشف' : 'Explore'} themeColors={themeColors} />
          ),
        }}
      />
      <Tabs.Screen
        name="Add_Books"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="chatbubble" label={isRTL ? 'الرسائل' : 'Messages'} themeColors={themeColors} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="person" label={isRTL ? 'حسابي' : 'Profile'} themeColors={themeColors} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="settings" label={isRTL ? 'الإعدادات' : 'Settings'} themeColors={themeColors} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="mail" label={isRTL ? 'الطلبات' : 'Requests'} themeColors={themeColors} />
          ),
         }}
      />
      
      {/* Hidden from Tab Bar but still inside the Tabs layout so they show the Tab Bar at the bottom */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="my-shared-items" options={{ href: null }} />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 14 : 0,
    width: 80,
  },
  iconText: {
    fontSize: 10,
    marginTop: 4,
  },
  highlightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 50,
    borderRadius: 16,
    marginTop: Platform.OS === 'ios' ? 14 : 0,
    shadowColor: '#001B39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  highlightText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
