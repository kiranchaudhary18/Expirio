import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SUPPORT_OPTIONS = [
  {
    id: 'email',
    icon: 'mail',
    iconColor: '#EA4335',
    bgColor: '#EA433515',
    title: 'Email Support',
    subtitle: 'Get help via email',
    detail: 'support@expirio.com',
    description: 'We typically respond within 24 hours',
    action: 'mailto:support@expirio.com?subject=Expirio%20Support%20Request',
  },
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    iconColor: '#25D366',
    bgColor: '#25D36615',
    title: 'WhatsApp Support',
    subtitle: 'Chat with us instantly',
    detail: '+91 9999999999',
    description: 'Available Mon-Sat, 9 AM - 6 PM IST',
    action: 'whatsapp://send?phone=919999999999&text=Hi,%20I%20need%20help%20with%20Expirio%20app',
    fallbackAction: 'https://wa.me/919999999999?text=Hi,%20I%20need%20help%20with%20Expirio%20app',
  },
];

const QUICK_LINKS = [
  {
    id: 'faq',
    icon: 'help-circle-outline',
    title: 'FAQ',
    subtitle: 'Quick answers',
    screen: 'HelpCenter',
  },
  {
    id: 'feedback',
    icon: 'chatbox-ellipses-outline',
    title: 'Feedback',
    subtitle: 'Share ideas',
    action: 'mailto:feedback@expirio.com?subject=Expirio%20Feedback',
  },
  {
    id: 'bug',
    icon: 'bug-outline',
    title: 'Report Bug',
    subtitle: 'Found issue?',
    action: 'mailto:bugs@expirio.com?subject=Bug%20Report%20-%20Expirio',
  },
];

const ContactSupportScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const handleSupportOption = async (option) => {
    try {
      const supported = await Linking.canOpenURL(option.action);
      
      if (supported) {
        await Linking.openURL(option.action);
      } else if (option.fallbackAction) {
        // Try fallback URL (e.g., web WhatsApp)
        const fallbackSupported = await Linking.canOpenURL(option.fallbackAction);
        if (fallbackSupported) {
          await Linking.openURL(option.fallbackAction);
        } else {
          Alert.alert(
            'Unable to Open',
            `Please install ${option.title.split(' ')[0]} or contact us at ${option.detail}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Unable to Open',
          `Please contact us at ${option.detail}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleQuickLink = async (link) => {
    if (link.screen) {
      navigation.navigate(link.screen);
    } else if (link.action) {
      try {
        const supported = await Linking.canOpenURL(link.action);
        if (supported) {
          await Linking.openURL(link.action);
        } else {
          Alert.alert('Error', 'Unable to open email app.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const SupportCard = ({ option }) => (
    <TouchableOpacity
      style={styles.supportCard}
      onPress={() => handleSupportOption(option)}
      activeOpacity={0.8}
    >
      <View style={styles.supportCardContent}>
        <View style={[styles.supportIconContainer, { backgroundColor: option.bgColor }]}>
          <Ionicons name={option.icon} size={28} color={option.iconColor} />
        </View>
        <View style={styles.supportInfo}>
          <Text style={styles.supportTitle}>{option.title}</Text>
          <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
          <Text style={styles.supportDetail}>{option.detail}</Text>
        </View>
        <View style={styles.supportArrow}>
          <Ionicons name="arrow-forward-circle" size={28} color={theme.primary} />
        </View>
      </View>
      <View style={styles.supportDescription}>
        <Ionicons name="time-outline" size={14} color={theme.gray} />
        <Text style={styles.descriptionText}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset" size={44} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>We're here to help!</Text>
          <Text style={styles.heroSubtitle}>
            Choose your preferred way to reach us
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          {SUPPORT_OPTIONS.map(option => (
            <SupportCard key={option.id} option={option} />
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksContainer}>
            {QUICK_LINKS.map(link => (
              <TouchableOpacity
                key={link.id}
                style={styles.quickLinkCard}
                onPress={() => handleQuickLink(link)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name={link.icon} size={24} color={theme.primary} />
                </View>
                <Text style={styles.quickLinkTitle}>{link.title}</Text>
                <Text style={styles.quickLinkSubtitle}>{link.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.workingHoursCard}>
          <View style={styles.workingHoursHeader}>
            <Ionicons name="calendar-outline" size={22} color={theme.primary} />
            <Text style={styles.workingHoursTitle}>Working Hours</Text>
          </View>
          <View style={styles.workingHoursContent}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 4:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={[styles.hoursTime, styles.closed]}>Closed</Text>
            </View>
          </View>
          <Text style={styles.timezone}>All times in IST (Indian Standard Time)</Text>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow us for updates</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://twitter.com/expirio_app')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://instagram.com/expirio_app')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://facebook.com/expirio_app')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: theme.gray,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
  },
  supportCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  supportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportInfo: {
    flex: 1,
    marginLeft: 14,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 13,
    color: theme.gray,
    marginBottom: 4,
  },
  supportDetail: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.primary,
  },
  supportArrow: {
    marginLeft: 8,
  },
  supportDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  descriptionText: {
    fontSize: 13,
    color: theme.gray,
    marginLeft: 6,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quickLinkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  quickLinkSubtitle: {
    fontSize: 12,
    color: theme.gray,
  },
  workingHoursCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  workingHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workingHoursTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 10,
  },
  workingHoursContent: {
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  hoursDay: {
    fontSize: 15,
    color: theme.text,
  },
  hoursTime: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.primary,
  },
  closed: {
    color: theme.expired,
  },
  timezone: {
    fontSize: 12,
    color: theme.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  socialSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  socialTitle: {
    fontSize: 15,
    color: theme.gray,
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
});

export default ContactSupportScreen;
