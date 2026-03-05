import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import { api, itemAPI, subscriptionAPI } from '../services/api';

// Rate App function
const handleRateApp = async () => {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.expirio.app';
  const appStoreUrl = 'https://apps.apple.com/app/expirio/id123456789';
  
  const storeUrl = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
  
  try {
    const supported = await Linking.canOpenURL(storeUrl);
    if (supported) {
      await Linking.openURL(storeUrl);
    } else {
      Alert.alert(
        'Unable to Open Store',
        'Please rate us on the app store manually. Thank you for your support!',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error opening store:', error);
    Alert.alert(
      'Thank You!',
      'We appreciate your support! Please rate us on the app store.',
      [{ text: 'OK' }]
    );
  }
};


// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ProfileScreen = ({ navigation, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 9, 0)); // Default 9:00 AM
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    avatar: null,
    itemsTracked: 0,
    expiredItems: 0,
    subscriptions: 0,
  });

  // Load user data and fetch counts from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        const avatar = await AsyncStorage.getItem('userAvatar');
        const userId = await AsyncStorage.getItem('userId');
        
        setUser(prev => ({
          ...prev,
          name: name || 'User',
          email: email || 'user@example.com',
          avatar: avatar || null,
        }));

        // Fetch items and subscriptions data
        if (userId) {
          try {
            // Fetch items
            const itemsResponse = await itemAPI.getItemsByUserId(userId);
            const items = itemsResponse.data.data || [];
            const totalItems = items.length;
            const expiredItems = items.filter(item => item.expiryStatus === 'expired').length;

            // Fetch subscriptions
            const subsResponse = await subscriptionAPI.getSubscriptionsByUserId(userId);
            const subscriptions = subsResponse.data.data || [];
            const totalSubs = subscriptions.length;

            // Update user state with real data
            setUser(prev => ({
              ...prev,
              itemsTracked: totalItems,
              expiredItems: expiredItems,
              subscriptions: totalSubs,
            }));

            console.log('📊 Profile Stats Updated:', { totalItems, expiredItems, totalSubs });
          } catch (error) {
            console.error('Error fetching profile stats:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Refresh stats when screen is focused
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          // Fetch items
          const itemsResponse = await itemAPI.getItemsByUserId(userId);
          const items = itemsResponse.data.data || [];
          const totalItems = items.length;
          const expiredItems = items.filter(item => item.expiryStatus === 'expired').length;

          // Fetch subscriptions
          const subsResponse = await subscriptionAPI.getSubscriptionsByUserId(userId);
          const subscriptions = subsResponse.data.data || [];
          const totalSubs = subscriptions.length;

          setUser(prev => ({
            ...prev,
            itemsTracked: totalItems,
            expiredItems: expiredItems,
            subscriptions: totalSubs,
          }));

          console.log('🔄 Profile Stats Refreshed:', { totalItems, expiredItems, totalSubs });
        }
      } catch (error) {
        console.error('Error refreshing profile stats:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Load saved reminder time
  useEffect(() => {
    const loadReminderTime = async () => {
      try {
        const savedTime = await AsyncStorage.getItem('reminderTime');
        if (savedTime) {
          const [hours, minutes] = savedTime.split(':').map(Number);
          const time = new Date();
          time.setHours(hours, minutes, 0, 0);
          setReminderTime(time);
        }
      } catch (error) {
        console.error('Error loading reminder time:', error);
      }
    };
    loadReminderTime();
    requestNotificationPermissions();
  }, []);

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle time change
  const handleTimeChange = async (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime && event.type !== 'dismissed') {
      setReminderTime(selectedTime);
      
      // Save to AsyncStorage
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const timeString = `${hours}:${minutes}`;
      await AsyncStorage.setItem('reminderTime', timeString);
      
      // Schedule notification
      await scheduleNotification(selectedTime);
      
      Alert.alert(
        'Reminder Set',
        `You will receive daily reminders at ${formatTime(selectedTime)}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Schedule daily notification
  const scheduleNotification = async (time) => {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      if (!notifications) return;
      
      const hours = time.getHours();
      const minutes = time.getMinutes();
      
      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Expirio Reminder',
          body: 'Check your items! Some may be expiring soon.',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: 'daily',
          hour: hours,
          minute: minutes,
        },
      });
      
      console.log(`Notification scheduled for ${hours}:${minutes}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Toggle notifications
  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    if (value) {
      await scheduleNotification(reminderTime);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { currentUser: user, onProfileUpdate: handleProfileUpdate });
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to login again to access your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('userName');
              await AsyncStorage.removeItem('userEmail');
              console.log('✅ AsyncStorage cleared');
              
              // Call parent logout to update isLoggedIn state
              if (onLogout) {
                console.log('📞 Calling onLogout callback');
                await onLogout();
              }
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Coming Soon', 'Account deletion will be available in a future update'),
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, danger }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.expired : theme.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color={theme.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="cog-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>
            )}
          <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Ionicons name="camera" size={14} color={theme.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: theme.safe + '20' }]}>
              <Ionicons name="cube" size={20} color={theme.safe} />
            </View>
            <Text style={styles.statValue}>{user.itemsTracked}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: theme.expired + '20' }]}>
              <Ionicons name="warning" size={20} color={theme.expired} />
            </View>
            <Text style={styles.statValue}>{user.expiredItems}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: theme.subscription + '20' }]}>
              <Ionicons name="card" size={20} color={theme.subscription} />
            </View>
            <Text style={styles.statValue}>{user.subscriptions}</Text>
            <Text style={styles.statLabel}>Subs</Text>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              rightComponent={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.grayLight, true: theme.primary + '50' }}
                  thumbColor={isDarkMode ? theme.primary : theme.white}
                />
              }
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Get reminded about expiring items"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: theme.grayLight, true: theme.primary + '50' }}
                  thumbColor={notifications ? theme.primary : theme.white}
                />
              }
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="mail"
              title="Email Notifications"
              subtitle="Receive email reminders"
              rightComponent={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: theme.grayLight, true: theme.primary + '50' }}
                  thumbColor={emailNotifications ? theme.primary : theme.white}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="language"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Coming Soon', 'Language selection coming soon!')}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="time"
              title="Reminder Time"
              subtitle={formatTime(reminderTime)}
              onPress={() => setShowTimePicker(true)}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="cloud-upload"
              title="Backup & Sync"
              subtitle="Cloud backup enabled"
              onPress={() => Alert.alert('Coming Soon', 'Backup settings coming soon!')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="help-circle"
              title="Help Center"
              subtitle="FAQs and guides"
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="chatbubble"
              title="Contact Support"
              subtitle="Email or WhatsApp"
              onPress={() => navigation.navigate('ContactSupport')}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="star"
              title="Rate App"
              subtitle="Love Expirio? Rate us!"
              onPress={handleRateApp}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="document-text"
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="log-out"
              title="Logout"
              onPress={handleLogout}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon="trash"
              title="Delete Account"
              danger
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Expirio v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 Expirio. All rights reserved.</Text>
          <View style={styles.madeWithContainer}>
            <Text style={styles.madeWithText}>Made with </Text>
            <Ionicons name="heart" size={22} color={theme.expired} />
            <Text style={styles.madeWithText}> by Kiran Dekaliya</Text>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.timePickerTitle}>Set Reminder Time</Text>
                <TouchableOpacity onPress={() => {
                  handleTimeChange({ type: 'set' }, reminderTime);
                  setShowTimePicker(false);
                }}>
                  <Text style={styles.timePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setReminderTime(date);
                }}
                textColor={theme.text}
                style={styles.timePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: theme.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.card,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.primary + '15',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.25 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: theme.grayLight,
    alignSelf: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.2 : 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingIconDanger: {
    backgroundColor: theme.expired + '15',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  settingTitleDanger: {
    color: theme.expired,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.grayLight,
    marginLeft: 70,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.textLight,
    marginBottom: 12,
  },
  madeWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  madeWithText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.grayLight,
  },
  timePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  timePickerCancel: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  timePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  timePicker: {
    height: 200,
    backgroundColor: theme.card,
  },
});

export default ProfileScreen;
