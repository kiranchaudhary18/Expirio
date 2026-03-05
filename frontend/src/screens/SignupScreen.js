import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';

// Complete the auth session when app is returned from browser
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// Floating Label Input Component
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable = true,
  rightIcon,
  onRightIconPress,
  theme,
  styles,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 52,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 6],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 11],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.textLight, theme.primary],
    }),
    fontWeight: '500',
  };

  return (
    <View style={[
      styles.inputContainer,
      isFocused && styles.inputContainerFocused,
    ]}>
      <View style={styles.inputIconContainer}>
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? theme.primary : theme.textLight}
        />
      </View>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[styles.input, { paddingTop: value || isFocused ? 22 : 16 }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        placeholderTextColor={theme.textLight}
      />
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
        >
          <Ionicons name={rightIcon} size={20} color={theme.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Premium Button Component
const PremiumButton = ({ title, onPress, loading, icon, style, theme, styles }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumButton}
        >
          {loading ? (
            <ActivityIndicator color={theme.white} size="small" />
          ) : (
            <>
              {icon && (
                <Ionicons
                  name={icon}
                  size={20}
                  color={theme.white}
                  style={{ marginRight: 10 }}
                />
              )}
              <Text style={styles.premiumButtonText}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// Password Strength Indicator
const PasswordStrength = ({ password, theme, styles }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: theme.textLight };
    if (password.length < 6) return { level: 1, text: 'Weak', color: '#EF4444' };
    if (password.length < 8) return { level: 2, text: 'Fair', color: '#F59E0B' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, text: 'Strong', color: '#10B981' };
    }
    return { level: 3, text: 'Good', color: theme.primary };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              {
                backgroundColor: level <= strength.level ? strength.color : theme.grayLight,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthText, { color: strength.color }]}>
        {strength.text}
      </Text>
    </View>
  );
};

const SignupScreen = ({ navigation, onLoginSuccess }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth hooks - configure with platform-specific Client IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '208687631070-n43vgne2jltfjpqhcnn87egg5cd384dp.apps.googleusercontent.com',
    iosClientId: '208687631070-n43vgne2jltfjpqhcnn87egg5cd384dp.apps.googleusercontent.com',
    webClientId: '208687631070-n43vgne2jltfjpqhcnn87egg5cd384dp.apps.googleusercontent.com',
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignupSuccess(authentication);
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
      Alert.alert('Error', 'Failed to authenticate with Google');
      setLoading(false);
    }
  }, [response]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!name.trim()) {
      Alert.alert('Oops!', 'Please enter your name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Oops!', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Oops!', 'Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Oops!', 'Please create a password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Call backend signup API
      const response = await userAPI.signup(name.trim(), email.trim(), password);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('userName', user.name);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userToken', token);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Welcome to Expirio! 🎉',
          `Your account has been created successfully, ${user.name.split(' ')[0]}!`,
          [
            {
              text: 'Get Started',
              onPress: () => {
                if (onLoginSuccess) {
                  onLoginSuccess();
                } else {
                  navigation.replace('Home');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Signup Failed', response.data.message || 'Could not create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (authentication) => {
    try {
      if (!authentication?.accessToken) {
        throw new Error('No access token received from Google');
      }

      // Fetch user profile from Google using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user profile from Google');
      }

      const userInfo = await userInfoResponse.json();

      // Send user data to backend for authentication
      const response = await axios.post('http://192.168.1.100:3002/api/auth/google', {
        name: userInfo.name,
        email: userInfo.email,
        googleId: userInfo.id,
        photo: userInfo.picture,
        accessToken: authentication.accessToken,
      });

      if (response.data.token) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('userName', response.data.user.name);
        await AsyncStorage.setItem('userEmail', response.data.user.email);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Welcome to Expirio! 🎉',
          `Account created successfully, ${response.data.user.name.split(' ')[0]}!`,
          [
            {
              text: 'Get Started',
              onPress: () => {
                if (onLoginSuccess) {
                  onLoginSuccess();
                } else {
                  navigation.replace('Home');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Google signup success handler error:', error);
      Alert.alert('Error', error.message || 'Failed to complete Google sign-up');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      if (!request) {
        Alert.alert('Error', 'Google Sign-Up is not configured. Please check your Expo Client ID in the code.');
        setLoading(false);
        return;
      }

      const result = await promptAsync();

      if (result?.type !== 'success') {
        setLoading(false);
      }
      // Success handling is done in useEffect hook above
    } catch (error) {
      console.error('Google signup prompt error:', error);
      Alert.alert('Error', 'Failed to open Google Sign-Up. Please try again.');
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };



  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.background, theme.backgroundSecondary, theme.background]
          : ['#F8FAFF', '#EEF1FF', '#E8ECFF']
        }
        style={StyleSheet.absoluteFillObject}
      />

      {/* Abstract Background Shapes */}
      <View style={styles.abstractShape1} />
      <View style={styles.abstractShape2} />
      <View style={styles.abstractShape3} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={navigateToLogin}
              >
                <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={styles.backButtonBlur}>
                  <Ionicons name="arrow-back" size={22} color={theme.text} />
                </BlurView>
              </TouchableOpacity>
            </Animated.View>

            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: logoScaleAnim }],
                },
              ]}
            >
              {/* Logo with Glow */}
              <View style={styles.logoGlow}>
                <LinearGradient
                  colors={isDarkMode 
                    ? [`${theme.primary}40`, `${theme.primary}10`]
                    : ['rgba(108, 99, 255, 0.3)', 'rgba(108, 99, 255, 0.05)']
                  }
                  style={styles.logoGlowGradient}
                />
              </View>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[theme.primary, theme.primaryDark]}
                  style={styles.logoGradient}
                >
                  <Ionicons name="time" size={36} color={theme.white} />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Create Account</Text>
              <Text style={styles.tagline}>Start your journey with Expirio</Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Full Name Input */}
              <FloatingLabelInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                autoCapitalize="words"
                editable={!loading}
                theme={theme}
                styles={styles}
              />

              {/* Email Input */}
              <FloatingLabelInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                theme={theme}
                styles={styles}
              />

              {/* Password Input */}
              <FloatingLabelInput
                label="Create Password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
                editable={!loading}
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                theme={theme}
                styles={styles}
              />

              {/* Password Strength */}
              <PasswordStrength password={password} theme={theme} styles={styles} />

              {/* Confirm Password Input */}
              <FloatingLabelInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="shield-checkmark-outline"
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                rightIcon={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                theme={theme}
                styles={styles}
              />

              {/* Create Account Button */}
              <PremiumButton
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                icon="person-add"
                style={styles.signUpButton}
                theme={theme}
                styles={styles}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Sign-Up Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignup}
                activeOpacity={0.8}
                disabled={loading || !request}
              >
                <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={styles.googleButtonBlur}>
                  <Text style={styles.googleButtonIcon}>🔵</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* Features Preview */}
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What you'll get</Text>
                <View style={styles.featuresList}>
                  <FeatureItem
                    icon="notifications-outline"
                    text="Smart expiry reminders"
                    theme={theme}
                    styles={styles}
                  />
                  <FeatureItem
                    icon="scan-outline"
                    text="Barcode scanning"
                    theme={theme}
                    styles={styles}
                  />
                  <FeatureItem
                    icon="shield-checkmark-outline"
                    text="Secure cloud backup"
                    theme={theme}
                    styles={styles}
                  />
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text, theme, styles }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={16} color={theme.primary} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  // Abstract Background Shapes
  abstractShape1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: isDarkMode ? `${theme.primary}15` : 'rgba(108, 99, 255, 0.08)',
  },
  abstractShape2: {
    position: 'absolute',
    top: height * 0.3,
    left: -120,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: isDarkMode ? `${theme.primary}10` : 'rgba(108, 99, 255, 0.05)',
  },
  abstractShape3: {
    position: 'absolute',
    bottom: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: isDarkMode ? `${theme.primary}12` : 'rgba(108, 99, 255, 0.06)',
  },

  // Back Button
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  logoGlowGradient: {
    flex: 1,
    borderRadius: 50,
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDarkMode ? 0.45 : 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  // Form Section
  formSection: {
    flex: 1,
  },

  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: isDarkMode ? theme.border : 'transparent',
  },
  inputContainerFocused: {
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOpacity: isDarkMode ? 0.4 : 0.15,
  },
  inputIconContainer: {
    width: 36,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    paddingVertical: 16,
    fontWeight: '500',
  },
  rightIconContainer: {
    padding: 8,
  },

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Terms Agreement
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  termsLink: {
    color: theme.primary,
    fontWeight: '600',
  },

  // Premium Button
  premiumButton: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.5 : 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.white,
    letterSpacing: 0.3,
  },
  signUpButton: {
    marginBottom: 20,
  },

  // Google Button
  googleButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: isDarkMode ? `${theme.primary}40` : 'rgba(108, 99, 255, 0.2)',
    marginBottom: 12,
  },
  googleButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  googleButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '600',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: isDarkMode ? theme.border : 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '700',
  },

  // Features Preview
  featuresContainer: {
    backgroundColor: isDarkMode ? `${theme.primary}10` : 'rgba(108, 99, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDarkMode ? `${theme.primary}20` : 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
});

export default SignupScreen;
