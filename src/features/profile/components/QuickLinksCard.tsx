import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { useAppTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export const QuickLinksCard = () => {
  const { isRTL } = useI18n();
  const { theme, colors: themeColors } = useAppTheme();
  const router = useRouter();

  const links = [
    {
      id: 'requests',
      title: isRTL ? 'إدارة الطلبات' : 'Manage Requests',
      icon: 'git-pull-request',
      color: '#F59E0B',
      route: '/my-requests',
    },
    {
      id: 'my-books',
      title: isRTL ? 'كتبي المعروضة' : 'My Shared Items',
      icon: 'library',
      color: themeColors.primary,
      route: '/my-shared-items',
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      {links.map((link, index) => (
        <React.Fragment key={link.id}>
          <TouchableOpacity 
            style={[styles.linkItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => router.push(link.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: link.color + '15' }]}>
              <Ionicons name={link.icon as any} size={22} color={link.color} />
            </View>
            <Text style={[styles.linkTitle, { color: themeColors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {link.title}
            </Text>
            <Ionicons 
              name={isRTL ? "chevron-back" : "chevron-forward"} 
              size={18} 
              color={themeColors.textSecondary} 
            />
          </TouchableOpacity>
          {index < links.length - 1 && <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 24,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  linkItem: {
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  }
});
