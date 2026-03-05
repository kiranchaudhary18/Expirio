import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    id: '1',
    category: 'Getting Started',
    icon: 'rocket-outline',
    questions: [
      {
        id: '1a',
        question: 'How do I add a new item?',
        answer: 'To add a new item, tap the "+" button on the home screen. Fill in the item name, select a category, set the expiry date, and choose when you want to be reminded. You can also add a photo and notes for reference.',
      },
      {
        id: '1b',
        question: 'How do I add a subscription?',
        answer: 'Navigate to the Subscriptions tab from the bottom navigation. Tap "Add Subscription" and enter the subscription name, renewal date, amount, and set your reminder preferences.',
      },
      {
        id: '1c',
        question: 'How do I scan a barcode?',
        answer: 'Tap the scanner icon on the home screen. Point your camera at the product barcode. The app will automatically detect and add the item details.',
      },
    ],
  },
  {
    id: '2',
    category: 'Reminders & Notifications',
    icon: 'notifications-outline',
    questions: [
      {
        id: '2a',
        question: 'How do reminders work?',
        answer: 'Expirio sends you push notifications before items expire based on your reminder settings. You can set reminders for 1 day, 3 days, 7 days, or any custom number of days before expiry. Daily reminder time can be configured in Profile → Reminder Time.',
      },
      {
        id: '2b',
        question: 'Why am I not receiving notifications?',
        answer: 'Make sure notifications are enabled in your device settings for Expirio. Also check that Push Notifications is turned on in Profile → Preferences. On some devices, you may need to disable battery optimization for the app.',
      },
      {
        id: '2c',
        question: 'Can I get email notifications?',
        answer: 'Yes! Enable Email Notifications in Profile → Preferences. You will receive reminder emails for expiring items and subscription renewals at your registered email address.',
      },
    ],
  },
  {
    id: '3',
    category: 'Data & Privacy',
    icon: 'shield-checkmark-outline',
    questions: [
      {
        id: '3a',
        question: 'How do I backup my data?',
        answer: 'Your data is automatically synced to our secure cloud servers when you\'re logged in. To manually backup, go to Profile → Backup & Sync. You can also export your data as a file from Settings.',
      },
      {
        id: '3b',
        question: 'Is my data secure?',
        answer: 'Yes, we use industry-standard encryption to protect your data. All communications are encrypted using TLS, and your data is stored securely on encrypted servers. We never share your personal information with third parties.',
      },
      {
        id: '3c',
        question: 'How do I delete my account?',
        answer: 'Go to Profile → Account → Delete Account. This will permanently delete all your data including items, subscriptions, and settings. This action cannot be undone.',
      },
    ],
  },
  {
    id: '4',
    category: 'Troubleshooting',
    icon: 'construct-outline',
    questions: [
      {
        id: '4a',
        question: 'The app is running slow. What can I do?',
        answer: 'Try closing and reopening the app. If the issue persists, clear the app cache from your device settings, or reinstall the app. Make sure you have the latest version installed.',
      },
      {
        id: '4b',
        question: 'My items are not syncing across devices.',
        answer: 'Ensure you\'re logged in with the same account on all devices. Check your internet connection and try pulling down to refresh on the home screen.',
      },
      {
        id: '4c',
        question: 'Scanner is not working.',
        answer: 'Make sure you\'ve granted camera permissions to Expirio. Go to your device Settings → Apps → Expirio → Permissions → Camera and enable it.',
      },
    ],
  },
];

const HelpCenterScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleCategory = (categoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleQuestion = (questionId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Filter FAQs based on search
  const getFilteredFAQs = () => {
    if (!searchQuery.trim()) return FAQ_DATA;

    const query = searchQuery.toLowerCase();
    return FAQ_DATA.map(category => ({
      ...category,
      questions: category.questions.filter(
        q => q.question.toLowerCase().includes(query) || 
             q.answer.toLowerCase().includes(query)
      ),
    })).filter(category => category.questions.length > 0);
  };

  const filteredFAQs = getFilteredFAQs();

  const FAQItem = ({ question, isExpanded, onToggle }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question.question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.primary}
        />
      </View>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{question.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const CategorySection = ({ category, isExpanded, onToggle }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name={category.icon} size={22} color={theme.primary} />
          </View>
          <View>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            <Text style={styles.categoryCount}>
              {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.gray}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.questionsContainer}>
          {category.questions.map((question, index) => (
            <View key={question.id}>
              {index > 0 && <View style={styles.questionDivider} />}
              <FAQItem
                question={question}
                isExpanded={expandedQuestions[question.id]}
                onToggle={() => toggleQuestion(question.id)}
              />
            </View>
          ))}
        </View>
      )}
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
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={theme.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={40} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Browse through our FAQs or search for specific topics
          </Text>
        </View>

        {/* FAQ Categories */}
        <View style={styles.faqContainer}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                isExpanded={expandedCategories[category.id]}
                onToggle={() => toggleCategory(category.id)}
              />
            ))
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={theme.gray} />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try different keywords or browse categories
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support Card */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => navigation.navigate('ContactSupport')}
          activeOpacity={0.8}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="chatbubbles" size={28} color={theme.white} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtitle}>Contact our support team</Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color={theme.white} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.text,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    lineHeight: 22,
  },
  faqContainer: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    color: theme.gray,
  },
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 16,
  },
  questionDivider: {
    height: 1,
    backgroundColor: theme.border,
  },
  faqItem: {
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginRight: 10,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border + '50',
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.gray,
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: theme.gray,
    marginTop: 6,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.white,
    marginBottom: 3,
  },
  contactSubtitle: {
    fontSize: 14,
    color: theme.white + 'CC',
  },
});

export default HelpCenterScreen;
