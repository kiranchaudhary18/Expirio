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
const PremiumButton = ({ title, onPress, loading, icon, style, theme, styles }) => (
  <TouchableOpacity
    style={[styles.premiumButton, style]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={loading}
  >
    <LinearGradient
      colors={[theme.primary, theme.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
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
  </TouchableOpacity>
);

const LoginScreen = ({ navigation, onLoginSuccess }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      handleGoogleLoginSuccess(authentication);
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

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email.trim()) {
      Alert.alert('Oops!', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Oops!', 'Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Oops!', 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Call backend login API
      const response = await userAPI.login(email.trim(), password);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('userName', user.name);
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userToken', token);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (authentication) => {
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

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('Google login success handler error:', error);
      Alert.alert('Error', error.message || 'Failed to complete Google sign-in');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      if (!request) {
        Alert.alert('Error', 'Google Sign-In is not configured. Please check your Expo Client ID in the code.');
        setLoading(false);
        return;
      }

      const result = await promptAsync();

      if (result?.type !== 'success') {
        setLoading(false);
      }
      // Success handling is done in useEffect hook above
    } catch (error) {
      console.error('Google login prompt error:', error);
      Alert.alert('Error', 'Failed to open Google Sign-In. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const demoUserId = 'demo_user_' + Date.now();
      await AsyncStorage.setItem('userId', demoUserId);
      await AsyncStorage.setItem('userName', 'Demo User');
      await AsyncStorage.setItem('userEmail', 'demo@expirio.app');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enter demo mode.');
    }
  };

  const navigateToSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Signup');
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
                  <Ionicons name="time" size={44} color={theme.white} />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Expirio</Text>
              <Text style={styles.tagline}>Never let anything expire again</Text>
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
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Sign in to continue tracking</Text>

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
                label="Password"
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <PremiumButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                icon="arrow-forward"
                style={styles.loginButton}
                theme={theme}
                styles={styles}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <BlurView intensity={20} style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>or</Text>
                </BlurView>
                <View style={styles.divider} />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
                disabled={loading || !request}
              >
                <BlurView intensity={80} tint={isDarkMode ? 'dark' : 'light'} style={styles.googleButtonBlur}>
                  <Text style={styles.googleButtonIcon}>🔵</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={navigateToSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms</Text> &{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

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

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  logoGlowGradient: {
    flex: 1,
    borderRadius: 70,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.5 : 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Form Section
  formSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 32,
    fontWeight: '400',
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

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
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
  loginButton: {
    marginBottom: 20,
  },

  // Sign Up Link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  signUpText: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  signUpLink: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '700',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  dividerText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Demo Button
  demoButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: isDarkMode ? `${theme.primary}40` : 'rgba(108, 99, 255, 0.2)',
  },
  demoButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  demoButtonText: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '600',
    marginLeft: 10,
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

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: theme.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: theme.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
