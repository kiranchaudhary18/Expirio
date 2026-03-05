import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';

// Predefined avatar options
const AVATAR_OPTIONS = [
  { id: 1, icon: '🧑', label: 'Person 1' },
  { id: 2, icon: '👨', label: 'Man' },
  { id: 3, icon: '👩', label: 'Woman' },
  { id: 4, icon: '👨‍🦱', label: 'Man with hair' },
  { id: 5, icon: '👩‍🦱', label: 'Woman with hair' },
  { id: 6, icon: '🧔', label: 'Beard' },
  { id: 7, icon: '👴', label: 'Old man' },
  { id: 8, icon: '👵', label: 'Old woman' },
];

const EditProfileScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const currentUser = route.params?.currentUser || {};
  const onProfileUpdate = route.params?.onProfileUpdate;

  const [name, setName] = useState(currentUser.name || '');
  const [profileImage, setProfileImage] = useState(currentUser.avatar || null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Determine if showing image or avatar
  const showImage = profileImage && profileImage.startsWith('file://') || profileImage?.startsWith('data:');

  const requestImagePermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to camera and photo library to change your profile picture.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const handlePickImage = async (useCamera = false) => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      let result;

      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Convert image to base64
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const base64String = `data:image/jpeg;base64,${base64}`;
          setProfileImage(base64String);
          setSelectedAvatarId(null); // Clear avatar selection
        } catch (error) {
          console.error('Error converting image to base64:', error);
          Alert.alert('Error', 'Failed to process image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSelectAvatar = (avatarId) => {
    setSelectedAvatarId(avatarId);
    setProfileImage(null); // Clear image selection
    setShowAvatarPicker(false);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const updateData = { name: name.trim() };
      
      if (profileImage) {
        updateData.avatar = profileImage;
      } else if (selectedAvatarId) {
        const selectedAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId);
        updateData.avatar = selectedAvatar?.icon || null;
      }

      const response = await userAPI.updateProfile(token, updateData);

      if (response.data.success) {
        // Save to AsyncStorage
        await AsyncStorage.setItem('userName', name.trim());
        if (updateData.avatar) {
          await AsyncStorage.setItem('userAvatar', updateData.avatar);
        }

        // Call callback to update parent component
        if (onProfileUpdate) {
          onProfileUpdate({
            ...currentUser,
            name: name.trim(),
            avatar: updateData.avatar || currentUser.avatar,
          });
        }

        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayAvatar = () => {
    if (profileImage) {
      return { uri: profileImage };
    }
    if (selectedAvatarId) {
      const avatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId);
      return null; // Will display as text
    }
    return null;
  };

  const getAvatarDisplay = () => {
    if (profileImage) {
      return <Image source={{ uri: profileImage }} style={styles.profileImage} />;
    }
    if (selectedAvatarId) {
      const avatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId);
      return (
        <Text style={styles.avatarEmoji}>{avatar?.icon}</Text>
      );
    }
    // Default initial avatar
    return (
      <Text style={styles.initialAvatar}>
        {name.split(' ').map((n) => n[0]).join('')  || 'U'}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profileImageContainer}>
            <View style={[
              styles.profileImageWrapper,
              profileImage && styles.profileImageWrapperWithImage
            ]}>
              {getAvatarDisplay()}
            </View>
            
            {/* Camera button */}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => handlePickImage(true)}
            >
              <Ionicons name="camera" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHelp}>Tap to take a photo or select from gallery</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.galleryButton, { flex: 1, marginRight: 8 }]}
              onPress={() => handlePickImage(false)}
            >
              <Ionicons name="images" size={18} color={theme.primary} />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.avatarButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setShowAvatarPicker(!showAvatarPicker)}
            >
              <Ionicons name="smiley" size={18} color={theme.primary} />
              <Text style={styles.buttonText}>Emoji</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <View style={styles.avatarPickerSection}>
            <Text style={styles.avatarPickerTitle}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatarId === avatar.id && styles.avatarOptionSelected
                  ]}
                  onPress={() => handleSelectAvatar(avatar.id)}
                >
                  <Text style={styles.avatarEmoji}>{avatar.icon}</Text>
                  {selectedAvatarId === avatar.id && (
                    <View style={styles.avatarCheck}>
                      <Ionicons name="checkmark" size={12} color={theme.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Name Input Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={theme.gray}
            value={name}
            onChangeText={setName}
            maxLength={50}
            editable={!loading}
          />
          <Text style={styles.characterCount}>
            {name.length}/50
          </Text>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { borderColor: theme.primary }]}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            You can use a photo or emoji avatar for your profile picture.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled
          ]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={theme.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: theme.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },

  // Profile Picture Section
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  profileImageWrapperWithImage: {
    borderColor: theme.safe,
    borderWidth: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
  },
  initialAvatar: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.primary,
  },
  avatarEmoji: {
    fontSize: 64,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.background,
  },
  sectionHelp: {
    fontSize: 13,
    color: theme.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
    justifyContent: 'center',
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.subscription,
    backgroundColor: theme.subscription + '10',
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },

  // Avatar Picker
  avatarPickerSection: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  avatarPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.gray + '30',
    marginBottom: 12,
    position: 'relative',
  },
  avatarOptionSelected: {
    borderColor: theme.primary,
    borderWidth: 3,
    backgroundColor: theme.primary + '20',
  },
  avatarCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form Section
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.gray + '30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.cardBackground,
  },
  characterCount: {
    fontSize: 12,
    color: theme.gray,
    marginTop: 6,
    textAlign: 'right',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.primary + '10',
    borderLeftWidth: 4,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Buttons
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
