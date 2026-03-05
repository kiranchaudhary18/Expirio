import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import { itemAPI } from '../services/api';

const ItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [loading, setLoading] = useState(false);
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
      weekday: 'long',
      month: 'long',
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

  const getExpiryMessage = (days) => {
    if (days === null) return 'No expiry date set';
    if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days until expiry`;
  };

  const handleEdit = () => {
    Alert.alert('Edit Item', 'Edit functionality will be implemented with backend integration.');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Call backend API to delete item
              const response = await itemAPI.deleteItem(item._id || item.id);
              
              if (response.data.success) {
                Alert.alert('Success', 'Item deleted successfully!', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete item.');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete item.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const daysUntil = getDaysUntilExpiry(item.expiryDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Item Image / Icon */}
        <View style={styles.imageSection}>
          {item.itemImage ? (
            <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
          ) : (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getCategoryColor(item.category) + '15' },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(item.category)}
                size={64}
                color={getCategoryColor(item.category)}
              />
            </View>
          )}
        </View>

        {/* Item Name & Category */}
        <View style={styles.titleSection}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={16}
              color={getCategoryColor(item.category)}
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category}
            </Text>
          </View>
        </View>

        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: getStatusBackground(item.expiryStatus) },
          ]}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <Ionicons
                name={
                  item.expiryStatus === 'expired'
                    ? 'alert-circle'
                    : item.expiryStatus === 'expiringSoon'
                    ? 'warning'
                    : 'checkmark-circle'
                }
                size={32}
                color={getStatusColor(item.expiryStatus)}
              />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: getStatusColor(item.expiryStatus) }]}>
                  {getStatusText(item.expiryStatus)}
                </Text>
                <Text style={[styles.statusMessage, { color: getStatusColor(item.expiryStatus) }]}>
                  {getExpiryMessage(daysUntil)}
                </Text>
              </View>
            </View>
            {daysUntil !== null && (
              <View style={styles.daysCircle}>
                <Text style={[styles.daysNumber, { color: getStatusColor(item.expiryStatus) }]}>
                  {daysUntil < 0 ? Math.abs(daysUntil) : daysUntil}
                </Text>
                <Text style={[styles.daysLabel, { color: getStatusColor(item.expiryStatus) }]}>
                  {daysUntil < 0 ? 'ago' : 'days'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>{formatDate(item.expiryDate)}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="notifications" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Reminder</Text>
                <Text style={styles.detailValue}>
                  {item.reminderDaysBefore} day{item.reminderDaysBefore !== 1 ? 's' : ''} before expiry
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Added On</Text>
                <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <CustomButton
            title="Edit Item"
            onPress={handleEdit}
            variant="outline"
            icon="create"
            style={styles.editButton}
          />
          <CustomButton
            title="Delete Item"
            onPress={handleDelete}
            variant="danger"
            icon="trash"
            loading={loading}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  itemImage: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  itemName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.card,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  statusCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  daysNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  daysLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 8,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: theme.grayLight,
    marginLeft: 72,
  },
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  notesCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  editButton: {
    width: '100%',
  },
  deleteButton: {
    width: '100%',
  },
});

export default ItemDetailScreen;
