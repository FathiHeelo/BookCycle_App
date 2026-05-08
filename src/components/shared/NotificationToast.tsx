import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/hooks/use-i18n';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  body: string;
  onPress: () => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const NotificationToast: React.FC<NotificationToastProps> = ({
  visible,
  title,
  body,
  onPress,
  onClose,
}) => {
  const { theme: themeKey, colors: themeColors, isAccessible } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isRTL } = useI18n();
  const translateY = useRef(new Animated.Value(-200)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        hide();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShouldRender(false);
      onClose();
    });
  };

  if (!shouldRender) return null;

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 10,
          backgroundColor: themeKey === 'dark' ? '#1E293B' : '#FFFFFF',
          shadowColor: themeColors.primary,
          borderBottomWidth: isAccessible ? 4 : 0,
          borderBottomColor: themeColors.primary,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.content, { flexDirection, borderColor: isAccessible ? themeColors.primary : themeColors.primary + '33', borderWidth: isAccessible ? 2 : 1 }]}
        onPress={() => {
          onPress();
          hide();
        }}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { 
          backgroundColor: themeColors.primary + '1A',
          marginRight: isRTL ? 0 : 12,
          marginLeft: isRTL ? 12 : 0,
        }]}>
          <Ionicons name="notifications" size={24} color={themeColors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.text, textAlign: isRTL ? 'right' : 'left', fontWeight: isAccessible ? '900' : '800' }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.body, { color: themeColors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {body}
          </Text>
        </View>

        <TouchableOpacity onPress={hide} style={[styles.closeBtn, { 
          marginLeft: isRTL ? 0 : 8,
          marginRight: isRTL ? 8 : 0,
        }]}>
          <Ionicons name="close" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
