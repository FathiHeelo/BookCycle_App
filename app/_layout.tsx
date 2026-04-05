import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing,
} from 'react-native-reanimated';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import '@/i18n/config';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard({ user, splashVisible }: { user: User | null | undefined, splashVisible: boolean }) {
  const segments = useSegments();

  useEffect(() => {
    // Only handle redirects after the splash screen is finished and auth is initialized
    if (splashVisible || user === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not signed in -> send to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Signed in and trying to access auth screens -> send to home
      router.replace('/');
    }
  }, [user, segments, splashVisible]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [splashVisible, setSplashVisible] = useState(true);

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Immediate auth state check
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (firebaseUser) => {
      setUser(firebaseUser);
    });

    // Branded splash delay (2 seconds)
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 2000);

    // Start animations
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.back(1.5) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));

    return () => {
      unsubscribe();
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

  // Show a splash-like loader while splashVisible is true or auth is still initializing
  if (splashVisible || user === undefined) {
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard user={user} splashVisible={splashVisible} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="change-password" options={{ title: 'Change Password', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
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
