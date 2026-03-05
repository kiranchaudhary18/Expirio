import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PRIVACY_SECTIONS = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: 'document-text-outline',
    content: `Welcome to Expirio ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information.

This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application Expirio (the "App"). Please read this privacy policy carefully.

By using the App, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the App.`,
  },
  {
    id: 'collection',
    title: 'Information We Collect',
    icon: 'folder-outline',
    content: `We collect information that you provide directly to us:

• Account Information: When you create an account, we collect your name, email address, and password.

• Item Data: Information about items you track including names, categories, expiry dates, photos, and notes.

• Subscription Data: Details about subscriptions you track including service names, renewal dates, and amounts.

• Device Information: Device type, operating system, unique device identifiers, and mobile network information.

• Usage Data: How you interact with the App, features you use, and time spent on different screens.

• Notification Preferences: Your choices regarding push notifications and email reminders.`,
  },
  {
    id: 'usage',
    title: 'How We Use Your Information',
    icon: 'analytics-outline',
    content: `We use the information we collect for various purposes:

• To provide and maintain our App
• To send you expiry reminders and notifications
• To personalize your experience
• To improve our App and develop new features
• To communicate with you about updates, support, and promotional offers
• To detect and prevent fraud or technical issues
• To comply with legal obligations

We do not sell your personal information to third parties.`,
  },
  {
    id: 'sharing',
    title: 'Information Sharing',
    icon: 'share-social-outline',
    content: `We may share your information only in the following situations:

• Service Providers: We may share data with third-party service providers who perform services on our behalf (e.g., cloud hosting, email delivery).

• Legal Requirements: We may disclose your information if required by law or in response to valid requests by public authorities.

• Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred.

• With Your Consent: We may share your information for any other purpose with your consent.

We require all third parties to respect the security of your personal data and to treat it in accordance with the law.`,
  },
  {
    id: 'security',
    title: 'Data Security',
    icon: 'shield-checkmark-outline',
    content: `We implement appropriate technical and organizational security measures to protect your personal information:

• All data transmission is encrypted using TLS/SSL
• Data at rest is encrypted using AES-256 encryption
• Regular security audits and penetration testing
• Access controls and authentication mechanisms
• Secure data centers with physical security measures

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.`,
  },
  {
    id: 'retention',
    title: 'Data Retention',
    icon: 'time-outline',
    content: `We retain your personal information for as long as necessary to:

• Provide you with our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

When you delete your account, we will delete or anonymize your personal information within 30 days, unless we are required to retain it for legal purposes.

You can request deletion of your data at any time through the App settings or by contacting us.`,
  },
  {
    id: 'rights',
    title: 'Your Rights',
    icon: 'person-outline',
    content: `You have the following rights regarding your personal data:

• Access: Request a copy of your personal data
• Correction: Request correction of inaccurate data
• Deletion: Request deletion of your personal data
• Restriction: Request restriction of processing
• Portability: Request transfer of your data
• Objection: Object to processing of your data
• Withdraw Consent: Withdraw consent at any time

To exercise any of these rights, please contact us at privacy@expirio.com. We will respond to your request within 30 days.`,
  },
  {
    id: 'children',
    title: 'Children\'s Privacy',
    icon: 'people-outline',
    content: `Our App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover that a child under 13 has provided us with personal information, we will delete such information from our servers.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    icon: 'refresh-outline',
    content: `We may update our Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy in the App
• Sending you an email notification
• Displaying a prominent notice in the App

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

Last Updated: February 2026`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: 'mail-outline',
    content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us:

Email: privacy@expirio.com
Support: support@expirio.com
Address: 123 Tech Park, Bangalore, Karnataka 560001, India

We aim to respond to all inquiries within 48 hours.`,
  },
];

const PrivacyPolicyScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const Section = ({ section }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name={section.icon} size={22} color={theme.primary} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
            <Ionicons name="shield-checkmark" size={44} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>
            We are committed to protecting your personal information
          </Text>
          <View style={styles.lastUpdated}>
            <Ionicons name="calendar-outline" size={14} color={theme.gray} />
            <Text style={styles.lastUpdatedText}>Last updated: February 2026</Text>
          </View>
        </View>

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quick Summary</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.safe} />
            <Text style={styles.summaryText}>We never sell your data</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.safe} />
            <Text style={styles.summaryText}>Your data is encrypted</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.safe} />
            <Text style={styles.summaryText}>You control your information</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.safe} />
            <Text style={styles.summaryText}>Delete your data anytime</Text>
          </View>
        </View>

        {/* Privacy Sections */}
        <View style={styles.sectionsContainer}>
          {PRIVACY_SECTIONS.map((section, index) => (
            <View key={section.id}>
              <Section section={section} />
              {index < PRIVACY_SECTIONS.length - 1 && <View style={styles.sectionDivider} />}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Expirio, you agree to this Privacy Policy
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Text style={styles.contactButtonText}>Have Questions? Contact Us</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: theme.gray,
    marginLeft: 6,
  },
  summaryCard: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: theme.text,
    marginLeft: 10,
  },
  sectionsContainer: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  sectionContent: {
    fontSize: 14,
    color: theme.gray,
    lineHeight: 24,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: theme.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '15',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
    marginRight: 8,
  },
});

export default PrivacyPolicyScreen;
