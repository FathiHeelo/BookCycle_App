import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../hooks/useSettings';

export const NotificationToggleUI = () => {
  const { t, isRTL, themeColors, notificationsEnabled, toggleNotifications } = useSettings();

  return (
    <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.iconBg, { backgroundColor: themeColors.primary + '15' }]}>
        <Ionicons name="notifications-outline" size={20} color={themeColors.primary} />
      </View>
      
      <View style={[styles.content, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
        <Text style={[styles.label, { color: themeColors.text }]}>
          {isRTL ? 'التنبيهات' : 'Notifications'}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {isRTL ? 'تلقي تنبيهات عند وجود طلبات أو رسائل جديدة' : 'Get notified about new requests or messages'}
        </Text>
      </View>

      <Switch
        value={notificationsEnabled}
        onValueChange={toggleNotifications}
        trackColor={{ false: '#D1D5DB', true: themeColors.primary }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 16,
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
