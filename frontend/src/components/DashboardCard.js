import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const DashboardCard = ({ title, count, icon, color, backgroundColor, onPress }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: backgroundColor || theme.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 130,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardCard;
