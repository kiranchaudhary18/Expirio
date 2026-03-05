import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ItemCard = ({ item, onPress }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return theme.expired;
      case 'expiringSoon':
        return theme.expiringSoon;
      case 'safe':
        return theme.safe;
      default:
        return theme.gray;
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'expired':
        return theme.expiredLight;
      case 'expiringSoon':
        return theme.expiringSoonLight;
      case 'safe':
        return theme.safeLight;
      default:
        return theme.grayLight;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiringSoon':
        return 'Expiring Soon';
      case 'safe':
        return 'Safe';
      default:
        return 'Unknown';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'fast-food';
      case 'medicine':
        return 'medical';
      case 'cosmetics':
        return 'color-palette';
      case 'subscription':
        return 'card';
      default:
        return 'cube';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return theme.food;
      case 'medicine':
        return theme.medicine;
      case 'cosmetics':
        return theme.cosmetics;
      case 'subscription':
        return theme.subscription;
      default:
        return theme.other;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilExpiry(item.expiryDate);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Left Icon */}
        <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          {item.itemImage ? (
            <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
          ) : (
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={28}
              color={getCategoryColor(item.category)}
            />
          )}
        </View>

        {/* Middle Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.itemName}
          </Text>
          <View style={styles.detailsRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
            <Text style={styles.dateText}>{formatDate(item.expiryDate)}</Text>
          </View>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Right Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.expiryStatus) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.expiryStatus) }]}>
              {getStatusText(item.expiryStatus)}
            </Text>
          </View>
          {daysUntil !== null && (
            <Text style={[styles.daysText, { color: getStatusColor(item.expiryStatus) }]}>
              {daysUntil === 0
                ? 'Today'
                : daysUntil < 0
                ? `${Math.abs(daysUntil)}d ago`
                : `${daysUntil}d left`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 12,
    color: theme.textLight,
    textTransform: 'capitalize',
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ItemCard;
