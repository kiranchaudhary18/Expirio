import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const ThemeContext = createContext();

// Theme colors configuration
export const lightTheme = {
  // Primary Colors
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#5046E5',

  // Background Colors
  background: '#F8F9FF',
  backgroundSecondary: '#F0F1F6',

  // Card Colors
  card: '#FFFFFF',
  cardSecondary: '#F5F6FA',

  // Text Colors
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status Colors
  expired: '#EF4444',
  expiredLight: '#FEE2E2',
  expiringSoon: '#F59E0B',
  expiringSoonLight: '#FEF3C7',
  safe: '#10B981',
  safeLight: '#D1FAE5',

  // Category Colors
  food: '#F97316',
  medicine: '#14B8A6',
  cosmetics: '#EC4899',
  subscription: '#8B5CF6',
  other: '#6B7280',

  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9CA3AF',
  grayLight: '#E5E7EB',
  grayDark: '#4B5563',
  border: '#E2E8F0',
  shadow: '#000000',
  inputBg: '#F8F9FF',
  inputBorder: '#E2E8F0',

  // Tab Bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabInactive: '#94A3B8',
  tabActive: '#6C63FF',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadowColor: 'rgba(108, 99, 255, 0.15)',

  // Status bar
  statusBar: 'dark',
};

export const darkTheme = {
  // Primary Colors
  primary: '#8B85FF',
  primaryLight: '#A5A0FF',
  primaryDark: '#6C63FF',

  // Background Colors
  background: '#0D0D12',
  backgroundSecondary: '#15151D',

  // Card Colors
  card: '#1A1A24',
  cardSecondary: '#22222E',

  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textLight: '#71717A',
  textInverse: '#0F172A',

  // Status Colors
  expired: '#F87171',
  expiredLight: '#450A0A',
  expiringSoon: '#FBBF24',
  expiringSoonLight: '#451A03',
  safe: '#34D399',
  safeLight: '#052E16',

  // Category Colors
  food: '#FB923C',
  medicine: '#2DD4BF',
  cosmetics: '#F472B6',
  subscription: '#A78BFA',
  other: '#9CA3AF',

  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  grayLight: '#27272A',
  grayDark: '#D1D5DB',
  border: '#27272A',
  shadow: '#000000',
  inputBg: '#1A1A24',
  inputBorder: '#27272A',

  // Tab Bar
  tabBar: '#1A1A24',
  tabBarBorder: '#27272A',
  tabInactive: '#6B7280',
  tabActive: '#8B85FF',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadowColor: 'rgba(139, 133, 255, 0.2)',

  // Status bar
  statusBar: 'light',
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkMode', String(newValue));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
