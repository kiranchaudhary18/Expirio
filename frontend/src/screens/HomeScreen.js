import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from '../components/DashboardCard';
import ItemCard from '../components/ItemCard';
import { itemAPI } from '../services/api';

// Mock data for demo purposes (will be replaced with API calls)
const mockItems = [
  {
    id: '1',
    userId: 'user1',
    itemName: 'Milk',
    category: 'Food',
    expiryDate: '2026-02-23',
    reminderDaysBefore: 3,
    itemImage: null,
    notes: 'Organic whole milk',
    expiryStatus: 'expiringSoon',
    createdAt: '2026-02-01',
  },
  {
    id: '2',
    userId: 'user1',
    itemName: 'Paracetamol',
    category: 'Medicine',
    expiryDate: '2026-06-15',
    reminderDaysBefore: 30,
    itemImage: null,
    notes: '500mg tablets',
    expiryStatus: 'safe',
    createdAt: '2026-01-15',
  },
  {
    id: '3',
    userId: 'user1',
    itemName: 'Face Cream',
    category: 'Cosmetics',
    expiryDate: '2026-02-19',
    reminderDaysBefore: 7,
    itemImage: null,
    notes: 'Moisturizing cream',
    expiryStatus: 'expired',
    createdAt: '2026-01-01',
  },
  {
    id: '4',
    userId: 'user1',
    itemName: 'Yogurt',
    category: 'Food',
    expiryDate: '2026-02-25',
    reminderDaysBefore: 2,
    itemImage: null,
    notes: 'Greek yogurt',
    expiryStatus: 'expiringSoon',
    createdAt: '2026-02-10',
  },
  {
    id: '5',
    userId: 'user1',
    itemName: 'Vitamin D',
    category: 'Medicine',
    expiryDate: '2027-01-01',
    reminderDaysBefore: 30,
    itemImage: null,
    notes: 'Daily supplements',
    expiryStatus: 'safe',
    createdAt: '2025-12-01',
  },
  {
    id: '6',
    userId: 'user1',
    itemName: 'Sunscreen',
    category: 'Cosmetics',
    expiryDate: '2026-02-18',
    reminderDaysBefore: 14,
    itemImage: null,
    notes: 'SPF 50',
    expiryStatus: 'expired',
    createdAt: '2025-06-01',
  },
];

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Calculate item counts by status
  const expiredCount = items.filter((item) => item.expiryStatus === 'expired').length;
  const expiringSoonCount = items.filter((item) => item.expiryStatus === 'expiringSoon').length;
  const safeCount = items.filter((item) => item.expiryStatus === 'safe').length;

  // Setup screen focus listener to refresh data
  useEffect(() => {
    if (!navigation) {
      console.warn('⚠️ Navigation prop not available');
      return;
    }

    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('🎯 HomeScreen focused - refreshing user data');
      const uid = await AsyncStorage.getItem('userId');
      console.log('📱 Current userId:', uid);
      if (uid) {
        setUserId(uid);
        await fetchItems(uid);
      } else {
        console.warn('⚠️ No userId found in AsyncStorage');
        setItems([]);
        setUserId(null);
      }
    });

    // Also fetch on initial mount
    const initializeUser = async () => {
      const uid = await AsyncStorage.getItem('userId');
      if (uid) {
        setUserId(uid);
        await fetchItems(uid);
      }
    };
    initializeUser();

    return unsubscribe;
  }, [navigation]);

  // Filter items based on search and status
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((item) => item.expiryStatus === selectedFilter);
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedFilter, items]);

  // Fetch items from API
  const fetchItems = async (uid = null) => {
    try {
      setLoading(true);
      const storedUserId = uid || await AsyncStorage.getItem('userId');
      
      console.log('🔍 Fetching items for userId:', storedUserId);
      
      if (!storedUserId) {
        console.warn('⚠️ No user ID found');
        setItems([]); // No mock data - just empty
        setLoading(false);
        return;
      }

      console.log('📡 Calling API: itemAPI.getItemsByUserId');
      const response = await itemAPI.getItemsByUserId(storedUserId);
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        const itemsData = response.data.data || [];
        console.log('📦 Items fetched:', itemsData.length);
        setItems(itemsData);
      } else {
        console.error('❌ API Error:', response.data.message);
        setItems([]); // No mock data
      }
    } catch (error) {
      console.error('❌ Network Error:', error.message);
      console.error('Full error:', error);
      setItems([]); // No mock data - empty list on error
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems(userId);
    setRefreshing(false);
  }, [userId]);

  // Navigate to item detail
  const handleItemPress = (item) => {
    navigation.navigate('ItemDetail', { item });
  };

  // Filter button component
  const FilterButton = ({ label, value, icon }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selectedFilter === value ? theme.white : theme.textSecondary}
      />
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.headerTitle}>Track Your Items</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          {expiredCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{expiredCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardContainer}>
        <DashboardCard
          title="Expired"
          count={expiredCount}
          icon="alert-circle"
          color={theme.expired}
          onPress={() => setSelectedFilter('expired')}
        />
        <DashboardCard
          title="Expiring Soon"
          count={expiringSoonCount}
          icon="warning"
          color={theme.expiringSoon}
          onPress={() => setSelectedFilter('expiringSoon')}
        />
        <DashboardCard
          title="Safe"
          count={safeCount}
          icon="checkmark-circle"
          color={theme.safe}
          onPress={() => setSelectedFilter('safe')}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterButton label="All" value="all" icon="grid" />
        <FilterButton label="Expired" value="expired" icon="alert-circle" />
        <FilterButton label="Expiring Soon" value="expiringSoon" icon="warning" />
        <FilterButton label="Safe" value="safe" icon="checkmark-circle" />
      </ScrollView>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Items</Text>
        <Text style={styles.itemCount}>{filteredItems.length} items</Text>
      </View>
    </>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={theme.grayLight} />
      <Text style={styles.emptyTitle}>No Items Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try a different search term'
          : 'Add your first item to start tracking'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={() => handleItemPress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
  },
  notificationButton: {
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
    shadowOpacity: isDarkMode ? 0.25 : 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.expired,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.25 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.text,
  },
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: theme.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  itemCount: {
    fontSize: 14,
    color: theme.textSecondary,
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
  },
});

export default HomeScreen;
