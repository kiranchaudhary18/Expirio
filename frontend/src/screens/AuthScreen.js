import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import CustomButton from '../components/CustomButton';

const AuthScreen = ({ navigation, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle login/signup
  const handleAuth = async () => {
    // Validate inputs
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      // Generate simple user ID based on email
      const userId = email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      console.log('👤 New user ID generated:', userId);
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('userName', name || email.split('@')[0]);
      await AsyncStorage.setItem('userEmail', email);
      console.log('✅ User data stored in AsyncStorage');
      console.log('📊 User:', { userId, email, name });

      if (onLoginSuccess) {
        console.log('📞 Calling onLoginSuccess callback');
        onLoginSuccess();
      } else {
        navigation.replace('Home');
      }

      Alert.alert('Success', `Welcome ${name || 'User'}!`);
    } catch (error) {
      console.error('❌ Auth error:', error);
      Alert.alert('Error', 'Failed to complete authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle demo mode
  const handleDemoMode = async () => {
    try {
      const demoUserId = 'demo_user_' + Date.now();
      await AsyncStorage.setItem('userId', demoUserId);
      await AsyncStorage.setItem('userName', 'Demo User');
      await AsyncStorage.setItem('userEmail', 'demo@expirio.app');

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enter demo mode.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="time" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>Expirio</Text>
            <Text style={styles.subtitle}>Smart Expiry Tracker</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Create Account' : 'Login to Your Account'}
            </Text>

            {/* Name field (only for sign up) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textLight}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              </View>
            )}

            {/* Email field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Auth Button */}
            <CustomButton
              label={loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login'}
              onPress={handleAuth}
              disabled={loading}
              icon={isSignUp ? 'person-add' : 'log-in'}
            />

            {/* Toggle between login and signup */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => {
                setIsSignUp(!isSignUp);
                setName('');
                setEmail('');
                setPassword('');
              }} disabled={loading}>
                <Text style={styles.toggleLink}>
                  {isSignUp ? 'Login' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Demo Mode Button */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoMode}
              disabled={loading}
            >
              <Ionicons name="beaker" size={20} color={colors.primary} />
              <Text style={styles.demoButtonText}>Try Demo Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Demo mode lets you try the app with sample data. Real data will be saved when you log in or sign up.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  toggleLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  infoText: {
    marginLeft: 12,
    color: colors.text,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});

export default AuthScreen;
