import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  isDark: boolean;
  isAccessible: boolean;
  colors: typeof Colors.light;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setIsAccessible: (value: boolean) => void;
}

const THEME_KEY = 'user-theme-mode';
const ACCESSIBLE_KEY = 'user-accessible-mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeMode: 'system',
  isDark: false,
  isAccessible: false,
  colors: Colors.light,
  setThemeMode: () => {},
  toggleTheme: () => {},
  setIsAccessible: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isAccessible, setIsAccessibleState] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(ACCESSIBLE_KEY),
    ]).then(([storedTheme, storedAccessible]) => {
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        setThemeModeState(storedTheme);
      }
      if (storedAccessible !== null) {
        setIsAccessibleState(storedAccessible === 'true');
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  };

  const setIsAccessible = (value: boolean) => {
    setIsAccessibleState(value);
    AsyncStorage.setItem(ACCESSIBLE_KEY, value ? 'true' : 'false');
  };

  const theme: 'light' | 'dark' =
    themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;

  const isDark = theme === 'dark';

  const colors = isAccessible 
    ? (isDark ? Colors.accessible.dark : Colors.accessible.light)
    : (isDark ? Colors.dark : Colors.light);

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{ 
        theme, 
        themeMode, 
        isDark, 
        isAccessible, 
        colors,
        setThemeMode, 
        toggleTheme,
        setIsAccessible
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
