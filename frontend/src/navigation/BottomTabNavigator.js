import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Add Button Component
const AddButton = ({ onPress, theme, isDarkMode }) => {
  const styles = createStyles(theme, isDarkMode);
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.addButtonInner}>
        <Ionicons name="add" size={32} color={theme.white} />
      </View>
    </TouchableOpacity>
  );
};

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = ({ onLogout }) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain">
      {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
    </Stack.Screen>
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
    <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const BottomTabNavigator = ({ onLogout }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Scanner':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'AddItem':
              iconName = 'add';
              break;
            case 'Subscriptions':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <AddButton {...props} theme={theme} isDarkMode={isDarkMode} />,
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionScreen}
        options={{
          tabBarLabel: 'Subs',
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
        }}
      >
        {() => <ProfileStack onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: theme.tabBar,
    borderTopWidth: isDarkMode ? 1 : 0,
    borderTopColor: theme.tabBarBorder,
    elevation: 20,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: isDarkMode ? 0.4 : 0.1,
    shadowRadius: 12,
    height: 85,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: isDarkMode ? 0.6 : 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default BottomTabNavigator;
