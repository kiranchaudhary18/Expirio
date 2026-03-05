import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import { subscriptionAPI } from '../services/api';

// Mock data for subscriptions
const mockSubscriptions = [
  {
    id: '1',
    userId: 'user1',
    subscriptionName: 'Netflix',
    renewalDate: '2026-03-01',
    amount: 15.99,
    renewalReminderDays: 3,
    createdAt: '2025-01-01',
    icon: 'play-circle',
    color: '#E50914',
  },
  {
    id: '2',
    userId: 'user1',
    subscriptionName: 'Spotify',
    renewalDate: '2026-02-28',
    amount: 9.99,
    renewalReminderDays: 7,
    createdAt: '2025-02-15',
    icon: 'musical-notes',
    color: '#1DB954',
  },
  {
    id: '3',
    userId: 'user1',
    subscriptionName: 'Adobe Creative Cloud',
    renewalDate: '2026-02-25',
    amount: 54.99,
    renewalReminderDays: 7,
    createdAt: '2025-06-01',
    icon: 'color-wand',
    color: '#FF0000',
  },
  {
    id: '4',
    userId: 'user1',
    subscriptionName: 'Amazon Prime',
    renewalDate: '2026-04-15',
    amount: 139.00,
    renewalReminderDays: 14,
    createdAt: '2025-04-15',
    icon: 'cart',
    color: '#FF9900',
  },
  {
    id: '5',
    userId: 'user1',
    subscriptionName: 'Gym Membership',
    renewalDate: '2026-03-10',
    amount: 49.99,
    renewalReminderDays: 7,
    createdAt: '2025-03-10',
    icon: 'barbell',
    color: '#8B5CF6',
  },
];

const reminderOptions = [
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
  { label: '14 days before', value: 14 },
  { label: '30 days before', value: 30 },
];

const SubscriptionScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const [subscriptions, setSubscriptions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Form state
  const [subscriptionName, setSubscriptionName] = useState('');
  const [renewalDate, setRenewalDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [renewalReminderDays, setRenewalReminderDays] = useState(7);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Fetch subscriptions from backend
  const fetchSubscriptions = async (uid = null) => {
    try {
      setLoading(true);
      const storedUserId = uid || await AsyncStorage.getItem('userId');
      
      console.log('🔍 Fetching subscriptions for userId:', storedUserId);
      
      if (!storedUserId) {
        console.warn('⚠️ No user ID found');
        setSubscriptions([]); // No mock data
        setLoading(false);
        return;
      }

      console.log('📡 Calling API: subscriptionAPI.getSubscriptionsByUserId');
      const response = await subscriptionAPI.getSubscriptionsByUserId(storedUserId);
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        const subsData = response.data.data || [];
        console.log('📦 Subscriptions fetched:', subsData.length);
        setSubscriptions(subsData);
      } else {
        console.error('❌ API Error:', response.data.message);
        setSubscriptions([]); // No mock data
      }
    } catch (error) {
      console.error('❌ Network Error:', error.message);
      console.error('Full error:', error);
      setSubscriptions([]); // No mock data
    } finally {
      setLoading(false);
    }
  };

  // Setup screen focus listener to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('🎯 SubscriptionScreen focused - refreshing user data');
      const uid = await AsyncStorage.getItem('userId');
      console.log('📱 Current userId:', uid);
      if (uid) {
        setUserId(uid);
        await fetchSubscriptions(uid);
      } else {
        console.warn('⚠️ No userId found in AsyncStorage');
        setSubscriptions([]);
        setUserId(null);
      }
    });

    return unsubscribe;
  }, [navigation]);
  // Calculate total monthly cost
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  // Get days until renewal
  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewalDate = new Date(dateString);
    renewalDate.setHours(0, 0, 0, 0);
    const diffTime = renewalDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubscriptions(userId);
    setRefreshing(false);
  }, [userId]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setRenewalDate(selectedDate);
    }
  };

  // Reset form
  const resetForm = () => {
    setSubscriptionName('');
    setRenewalDate(new Date());
    setAmount('');
    setRenewalReminderDays(7);
    setIsEditing(false);
    setEditingSubscription(null);
  };

  // Handle Edit
  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionName(subscription.subscriptionName);
    setRenewalDate(new Date(subscription.renewalDate));
    setAmount(subscription.amount.toString());
    setRenewalReminderDays(subscription.renewalReminderDays);
    setIsEditing(true);
    setModalVisible(true);
  };

  // Save subscription
  const handleSave = async () => {
    if (!subscriptionName.trim()) {
      Alert.alert('Error', 'Please enter a subscription name.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsSaving(true);

    try {
      const uid = await AsyncStorage.getItem('userId');
      
      if (!uid) {
        Alert.alert('Error', 'User not logged in. Please log in first.');
        setIsSaving(false);
        return;
      }

      const subscriptionData = {
        subscriptionName: subscriptionName.trim(),
        renewalDate: renewalDate.toISOString().split('T')[0],
        amount: parseFloat(amount),
        renewalReminderDays,
      };

      if (isEditing && editingSubscription) {
        // Update existing subscription
        const response = await subscriptionAPI.updateSubscription(editingSubscription._id, subscriptionData);
        
        if (response.data.success) {
          await fetchSubscriptions(uid);
          setModalVisible(false);
          resetForm();
          Alert.alert('Success', 'Subscription updated successfully!');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to update subscription.');
        }
      } else {
        // Create new subscription
        const response = await subscriptionAPI.createSubscription(uid, subscriptionData);
        
        if (response.data.success) {
          await fetchSubscriptions(uid);
          setModalVisible(false);
          resetForm();
          Alert.alert('Success', 'Subscription added successfully!');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to save subscription.');
        }
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save subscription.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete subscription
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Subscription',
      'Are you sure you want to delete this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await subscriptionAPI.deleteSubscription(id);
              
              if (response.data.success) {
                setSubscriptions(subscriptions.filter((sub) => sub._id !== id && sub.id !== id));
                Alert.alert('Success', 'Subscription deleted successfully!');
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete subscription.');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete subscription.');
            }
          },
        },
      ]
    );
  };

  // Render subscription card
  const renderSubscription = ({ item }) => {
    const daysUntil = getDaysUntil(item.renewalDate);
    const isUpcoming = daysUntil <= 7 && daysUntil >= 0;

    return (
      <View style={styles.subscriptionCardContainer}>
        <View style={styles.subscriptionCard}>
          <View style={[styles.iconContainer, { backgroundColor: (item.color || '#6366F1') + '20' }]}>
            <Ionicons name={item.icon || 'card-outline'} size={24} color={item.color || '#6366F1'} />
          </View>

          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionName}>{item.subscriptionName}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.dateText}>Renews {formatDate(item.renewalDate)}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.amount}>₹{(item.amount || 0).toFixed(2)}</Text>
            <View style={[styles.daysBadge, isUpcoming && styles.daysBadgeUpcoming]}>
              <Text style={[styles.daysText, isUpcoming && styles.daysTextUpcoming]}>
                {daysUntil === 0
                  ? 'Today'
                  : daysUntil < 0
                  ? 'Overdue'
                  : `${daysUntil}d`}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={theme.white} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id || item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={16} color={theme.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscriptions</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Subscriptions</Text>
            <Text style={styles.summaryValue}>{subscriptions.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monthly Cost</Text>
            <Text style={styles.summaryValueHighlight}>
              ₹{totalMonthlyCost.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Subscriptions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addLink}>+ Add New</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={64} color={theme.grayLight} />
      <Text style={styles.emptyTitle}>No Subscriptions</Text>
      <Text style={styles.emptyText}>
        Add your first subscription to track renewal dates
      </Text>
      <CustomButton
        title="Add Subscription"
        onPress={() => setModalVisible(true)}
        icon="add"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderSubscription}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={theme.white} />
      </TouchableOpacity>

      {/* Add Subscription Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Subscription Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subscription Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Netflix, Spotify"
                    placeholderTextColor={theme.textLight}
                    value={subscriptionName}
                    onChangeText={setSubscriptionName}
                  />
                </View>
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Amount</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.textLight}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Renewal Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Next Renewal Date</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                  <Text style={styles.pickerText}>
                    {renewalDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={renewalDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                  />
                )}
              </View>

              {/* Reminder */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Remind Me</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowReminderPicker(!showReminderPicker)}
                >
                  <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
                  <Text style={styles.pickerText}>
                    {reminderOptions.find((r) => r.value === renewalReminderDays)?.label}
                  </Text>
                  <Ionicons
                    name={showReminderPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>

                {showReminderPicker && (
                  <View style={styles.pickerOptions}>
                    {reminderOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.pickerOption,
                          renewalReminderDays === option.value && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setRenewalReminderDays(option.value);
                          setShowReminderPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            renewalReminderDays === option.value && styles.pickerOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {renewalReminderDays === option.value && (
                          <Ionicons name="checkmark" size={20} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Save Button */}
              <CustomButton
                title={isEditing ? 'Update Subscription' : 'Save Subscription'}
                onPress={handleSave}
                loading={isSaving}
                icon="checkmark"
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },
  summaryCard: {
    backgroundColor: theme.primary,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: isDarkMode ? 0.4 : 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.white,
  },
  summaryValueHighlight: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  addLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.grayLight,
  },
  daysBadgeUpcoming: {
    backgroundColor: theme.expiringSoonLight,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  daysTextUpcoming: {
    color: theme.expiringSoon,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: isDarkMode ? 0.5 : 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.overlay,
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  pickerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text,
  },
  pickerOptions: {
    backgroundColor: theme.card,
    borderRadius: 14,
    marginTop: 8,
    padding: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pickerOptionActive: {
    backgroundColor: theme.primary + '10',
  },
  pickerOptionText: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  pickerOptionTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 10,
  },
  subscriptionCardContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SubscriptionScreen;
