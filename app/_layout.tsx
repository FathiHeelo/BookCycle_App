import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';

import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing,
} from 'react-native-reanimated';
import { ActivityIndicator, View , Image , Text, StyleSheet} from 'react-native';
import 'react-native-reanimated';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { initI18n } from '@/src/i18n';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UniversityProvider, useUniversity } from '@/context/UniversityContext';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationToast } from '@/src/components/shared/NotificationToast';


export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AuthGuard({ user, splashVisible }: { user: User | null | undefined; splashVisible: boolean }) {
  const segments = useSegments();
  const { hasSelected, loading: uniLoading } = useUniversity();

  useEffect(() => {
    // Wait until splash is done, auth is initialized, and university selection is loaded
    if (splashVisible || user === undefined || uniLoading) return;

    const firstSegment = segments[0] as string;
    const inAuthGroup = firstSegment === '(auth)';
    const isWelcome = firstSegment === 'welcome';
    const isUniversitySelect = firstSegment === 'university-select';

    if (!user && !inAuthGroup && !isWelcome && !isUniversitySelect) {
      if (!hasSelected) {
        // First launch — show university selection before anything else
        router.replace('/university-select' as any);
      } else {
        router.replace('/welcome' as any);
      }
    } else if (user && (inAuthGroup || isWelcome || isUniversitySelect)) {
      // Signed in and trying to access auth/welcome/university-select → send to home
      router.replace('/' as any);
    }
  }, [user, segments, splashVisible, hasSelected, uniLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <UniversityProvider>
        <AuthProvider>
          <RootLayoutInner />
        </AuthProvider>
      </UniversityProvider>
    </AppThemeProvider>
  );
}

function RootLayoutInner() {
  const { isDark } = useAppTheme();
  const { user, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const [splashVisible, setSplashVisible] = useState(true);
  const [i18nReady, setI18nReady] = useState(false);
  const { toastVisible, currentToast, hideToast } = useNotifications();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Initialize i18n
    initI18n().finally(() => setI18nReady(true));

    // Branded splash delay (2 seconds)
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 2000);

    // Start animations
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.back(1.5) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Show a splash-like loader while splashVisible is true, auth is still initializing, or i18n is not ready
  if (splashVisible || authLoading || !i18nReady) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={[styles.appName, { color: theme.primary }]}>BookCycle</Text>
          <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
        </Animated.View>
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthGuard user={user} splashVisible={splashVisible} />
      <Stack>
        <Stack.Screen name="university-select" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="book-details/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="public-profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="all-messages" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="change-password" options={{ title: 'Change Password', headerShown: false }} />
        <Stack.Screen name="marketplace/offer-details/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="marketplace/store/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="marketplace/my-vouchers" options={{ headerShown: false }} />
        <Stack.Screen name="marketplace/voucher/[id]" options={{ headerShown: false }} />
      </Stack>
      <NotificationToast 
        visible={toastVisible}
        title={currentToast?.title || ''}
        body={currentToast?.body || ''}
        onPress={() => {
          if (currentToast?.data?.actionTarget === 'chat') {
             router.push({
               pathname: '/chat/[id]',
               params: { id: currentToast.data.chatId }
             } as any);
          } else if (currentToast?.data?.actionTarget === 'resource_requests') {
             router.push('/(tabs)/my-requests');
          } else {
             router.push('/(tabs)/notifications');
          }
        }}
        onClose={hideToast}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 10,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  loader: {
    marginTop: 24,
  },
});
