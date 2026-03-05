import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import { itemAPI } from '../services/api';

const reminderOptions = [
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
  { label: '14 days before', value: 14 },
  { label: '30 days before', value: 30 },
];

const AddItemScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const categories = [
    { label: 'Food', value: 'Food', icon: 'fast-food', color: theme.food },
    { label: 'Medicine', value: 'Medicine', icon: 'medical', color: theme.medicine },
    { label: 'Cosmetics', value: 'Cosmetics', icon: 'color-palette', color: theme.cosmetics },
    { label: 'Other', value: 'Other', icon: 'cube', color: theme.other },
  ];
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [source, setSource] = useState(null); // Track where product came from: 'api', 'database', 'manual', 'qr_scan'

  // Pre-fill form with route params from barcode scanner
  useEffect(() => {
    if (route?.params?.itemName) {
      setItemName(route.params.itemName);
    }
    if (route?.params?.category) {
      setCategory(route.params.category);
    }
    if (route?.params?.itemImage) {
      setItemImage(route.params.itemImage);
    }
    // Store barcode if provided (from barcode scanner)
    if (route?.params?.barcode) {
      setBarcode(route.params.barcode);
    }
    // Store source: tells us where the product came from
    // 'api' = found in external API (OpenFoodFacts, Google Books, etc.)
    // 'database' = found in MongoDB Products collection
    // 'manual' = user entered manually
    // 'qr_scan' = QR code scanned
    if (route?.params?.source) {
      setSource(route.params.source);
    }
  }, [route?.params]);

  // Calculate expiry status based on date
  const calculateExpiryStatus = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'expiringSoon';
    return 'safe';
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setItemImage(result.assets[0].uri);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setItemImage(result.assets[0].uri);
    }
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Validate form
  const validateForm = () => {
    if (!itemName.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name.');
      return false;
    }
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }
    return true;
  };

  // Save item
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Error', 'User not logged in. Please log in first.');
        setLoading(false);
        return;
      }

      const newItem = {
        itemName: itemName.trim(),
        category,
        expiryDate: expiryDate.toISOString().split('T')[0],
        reminderDaysBefore,
        itemImage: itemImage || null,
        notes: notes.trim() || null,
        barcode: barcode || route?.params?.barcode || null,
        source: source || 'manual' // Include source info for backend to know where product came from
      };

      // Save to backend
      const response = await itemAPI.createItem(userId, newItem);
      
      if (response.data.success) {
        console.log('✅ Item added successfully:', response.data.data);
        const itemType = newItem.barcode ? 'barcode scanned' : 'manually';
        Alert.alert('Success', `Item added successfully (${itemType})!`, [
          { text: 'OK', onPress: () => {
            handleReset();
            // Force refresh HomeScreen by navigating back
            navigation.goBack();
          }},
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setItemName('');
    setCategory('');
    setExpiryDate(new Date());
    setReminderDaysBefore(3);
    setNotes('');
    setItemImage(null);
    setBarcode(null);
    setSource(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Item</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Picker */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                Alert.alert('Add Photo', 'Choose an option', [
                  { text: 'Camera', onPress: takePhoto },
                  { text: 'Gallery', onPress: pickImage },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              {itemImage ? (
                <Image source={{ uri: itemImage }} style={styles.itemImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={36} color={theme.primary} />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={16} color={theme.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Barcode Display (if scanned) */}
          {barcode && (
            <View style={styles.barcodeSection}>
              <View style={styles.barcodeContainer}>
                <Ionicons name="barcode-outline" size={20} color={theme.primary} />
                <View style={styles.barcodeContent}>
                  <Text style={styles.barcodeLabel}>Barcode Scanned</Text>
                  <Text style={styles.barcodeValue}>{barcode}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Item Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cube-outline" size={20} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                placeholderTextColor={theme.textLight}
                value={itemName}
                onChangeText={setItemName}
                maxLength={100}
                editable={!loading}
              />
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              disabled={loading}
            >
              <Ionicons
                name={category ? categories.find((c) => c.value === category)?.icon : 'list-outline'}
                size={20}
                color={category ? categories.find((c) => c.value === category)?.color : theme.textSecondary}
              />
              <Text style={[styles.pickerText, !category && styles.placeholderText]}>
                {category || 'Select category'}
              </Text>
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.pickerOption,
                      category === cat.value && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        category === cat.value && styles.pickerOptionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                    {category === cat.value && (
                      <Ionicons name="checkmark" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Expiry Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry Date *</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.pickerText}>{formatDate(expiryDate)}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Reminder Days Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remind Me</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowReminderPicker(!showReminderPicker)}
              disabled={loading}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.pickerText}>
                {reminderOptions.find((r) => r.value === reminderDaysBefore)?.label}
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
                      reminderDaysBefore === option.value && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setReminderDaysBefore(option.value);
                      setShowReminderPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        reminderDaysBefore === option.value && styles.pickerOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {reminderDaysBefore === option.value && (
                      <Ionicons name="checkmark" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <View style={[styles.inputContainer, styles.notesContainer]}>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any additional notes..."
                placeholderTextColor={theme.textLight}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Save Item"
              onPress={handleSave}
              loading={loading}
              icon="checkmark"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: theme.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  cameraIconBadge: {
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
    borderColor: theme.background,
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
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDarkMode ? 0.3 : 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text,
  },
  pickerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text,
  },
  placeholderText: {
    color: theme.textLight,
  },
  pickerOptions: {
    backgroundColor: theme.card,
    borderRadius: 14,
    marginTop: 8,
    padding: 8,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: isDarkMode ? 0.4 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pickerOptionActive: {
    backgroundColor: theme.primary + '20',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  notesContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
  },
  notesInput: {
    flex: 1,
    width: '100%',
    fontSize: 16,
    color: theme.text,
    paddingTop: 0,
  },
  charCount: {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  barcodeSection: {
    marginBottom: 20,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '15',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  barcodeContent: {
    marginLeft: 12,
    flex: 1,
  },
  barcodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
  },
});

export default AddItemScreen;
